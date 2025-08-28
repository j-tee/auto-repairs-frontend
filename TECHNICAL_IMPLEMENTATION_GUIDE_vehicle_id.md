# Technical Implementation Guide: vehicle → vehicle_id Migration

**Companion Document to**: BACKEND_API_FIELD_NAMING_INCONSISTENCY.md  
**Audience**: Backend Development Team  
**Date**: August 28, 2025  

## Django Implementation Details

### Current Serializer (Problematic)
```python
# repair_orders/serializers.py
class CreateRepairOrderSerializer(serializers.ModelSerializer):
    # This field name is misleading - suggests object but expects ID
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        required=True
    )
    
    class Meta:
        model = RepairOrder
        fields = ['vehicle', 'services', 'parts', 'notes', 'discount_amount']
```

### Proposed Serializer (Clear)
```python
# repair_orders/serializers.py  
class CreateRepairOrderSerializer(serializers.ModelSerializer):
    # Clear field name - obviously expects vehicle ID
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',  # Maps to the actual model field
        required=True
    )
    
    class Meta:
        model = RepairOrder
        fields = ['vehicle_id', 'services', 'parts', 'notes', 'discount_amount']
```

### Migration Strategy Options

#### Option 1: Breaking Change Implementation
```python
class CreateRepairOrderSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        required=True
    )
    
    class Meta:
        model = RepairOrder
        fields = ['vehicle_id', 'services', 'parts', 'notes']
```

#### Option 2: Backward Compatible Implementation
```python
class CreateRepairOrderSerializer(serializers.ModelSerializer):
    # New preferred field name
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        required=False,
        help_text="Preferred field name for vehicle ID"
    )
    
    # Legacy field name (deprecated)
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        required=False,
        help_text="DEPRECATED: Use vehicle_id instead"
    )
    
    def validate(self, attrs):
        vehicle_id = attrs.get('vehicle_id')
        vehicle = attrs.get('vehicle')
        
        # Ensure exactly one is provided
        if vehicle_id and vehicle:
            raise serializers.ValidationError(
                "Provide either 'vehicle_id' or 'vehicle', not both"
            )
        
        if not vehicle_id and not vehicle:
            raise serializers.ValidationError(
                "Either 'vehicle_id' or 'vehicle' is required"
            )
        
        # Use vehicle_id if provided, otherwise use legacy vehicle
        if vehicle_id:
            attrs['vehicle'] = vehicle_id
        
        # Remove the extra field to avoid model assignment issues
        if 'vehicle_id' in attrs:
            del attrs['vehicle_id']
            
        return attrs
    
    class Meta:
        model = RepairOrder
        fields = ['vehicle_id', 'vehicle', 'services', 'parts', 'notes']
```

#### Option 3: Deprecation Warning Implementation
```python
import warnings
from rest_framework import serializers

class CreateRepairOrderSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        required=False
    )
    
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        required=False
    )
    
    def validate(self, attrs):
        vehicle_id = attrs.get('vehicle_id')
        vehicle = attrs.get('vehicle')
        
        if vehicle and not vehicle_id:
            # Issue deprecation warning
            warnings.warn(
                "The 'vehicle' field is deprecated. Use 'vehicle_id' instead.",
                DeprecationWarning,
                stacklevel=2
            )
            
        # Validation logic same as Option 2
        if vehicle_id and vehicle:
            raise serializers.ValidationError(
                "Provide either 'vehicle_id' or 'vehicle', not both"
            )
        
        if not vehicle_id and not vehicle:
            raise serializers.ValidationError(
                "Either 'vehicle_id' or 'vehicle' is required"
            )
        
        if vehicle_id:
            attrs['vehicle'] = vehicle_id
            
        if 'vehicle_id' in attrs:
            del attrs['vehicle_id']
            
        return attrs
```

## API Response Examples

### Current Response (Confusing)
```json
POST /api/shop/repair-orders/
Request:
{
  "vehicle": 27,
  "notes": "Brake inspection"
}

Response:
{
  "id": 123,
  "vehicle": 27,  ← This could be confusing
  "status": "pending",
  "notes": "Brake inspection"
}
```

### Proposed Response (Clear)
```json
POST /api/shop/repair-orders/
Request:
{
  "vehicle_id": 27,
  "notes": "Brake inspection"
}

Response:
{
  "id": 123,
  "vehicle_id": 27,  ← Clear it's an ID
  "vehicle": {       ← Clear it's the full object
    "id": 27,
    "make": "Toyota",
    "model": "Camry"
  },
  "status": "pending",
  "notes": "Brake inspection"
}
```

## Database Impact

**Good News**: No database migration required! The database schema remains unchanged:

```sql
-- RepairOrder table structure (unchanged)
CREATE TABLE repair_orders (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),  -- Database field stays the same
    customer_id INTEGER REFERENCES customers(id),
    status VARCHAR(50),
    -- ... other fields
);
```

The change is purely at the **API serialization layer**.

## Testing Considerations

### Test Cases for Backward Compatibility
```python
# tests/test_repair_order_api.py
class TestRepairOrderCreation:
    
    def test_create_with_vehicle_id(self):
        """Test creation with new vehicle_id field"""
        data = {
            'vehicle_id': self.vehicle.id,
            'notes': 'Test repair order'
        }
        response = self.client.post('/api/shop/repair-orders/', data)
        assert response.status_code == 201
    
    def test_create_with_vehicle_legacy(self):
        """Test creation with legacy vehicle field"""
        data = {
            'vehicle': self.vehicle.id,
            'notes': 'Test repair order'
        }
        response = self.client.post('/api/shop/repair-orders/', data)
        if BACKWARD_COMPATIBLE:
            assert response.status_code == 201
        else:
            assert response.status_code == 400  # After breaking change
    
    def test_both_fields_provided_error(self):
        """Test error when both fields provided"""
        data = {
            'vehicle_id': self.vehicle.id,
            'vehicle': self.vehicle.id,
            'notes': 'Test repair order'
        }
        response = self.client.post('/api/shop/repair-orders/', data)
        assert response.status_code == 400
```

## OpenAPI/Swagger Documentation

### Current Schema (Misleading)
```yaml
components:
  schemas:
    CreateRepairOrder:
      type: object
      properties:
        vehicle:  # ← Misleading name
          type: integer
          description: Vehicle ID
      required:
        - vehicle
```

### Proposed Schema (Clear)
```yaml
components:
  schemas:
    CreateRepairOrder:
      type: object
      properties:
        vehicle_id:  # ← Clear name
          type: integer
          description: ID of the vehicle for this repair order
          example: 27
        vehicle:     # ← Legacy field (if maintaining compatibility)
          type: integer
          description: "DEPRECATED: Use vehicle_id instead"
          deprecated: true
      required:
        - vehicle_id
```

## Consistency Check Across Models

Verify other models follow the same pattern:

```python
# Check these serializers for consistency
class CreateAppointmentSerializer:
    customer_id = ...  # ✅ Good
    vehicle_id = ...   # ✅ Good
    
class CreateServiceRecordSerializer:
    vehicle_id = ...   # ✅ Good
    
class CreateRepairOrderSerializer:
    vehicle = ...      # ❌ Inconsistent (current issue)
```

## Implementation Timeline Recommendation

### Phase 1 (Week 1): Add vehicle_id Support
- Implement Option 2 (backward compatible)
- Add tests for both fields
- Update API documentation

### Phase 2 (Week 2-4): Frontend Migration
- Frontend team updates to use `vehicle_id`
- Test all repair order creation flows
- Verify no `vehicle` field usage remains

### Phase 3 (Week 5-8): Deprecation Period
- Add deprecation warnings for `vehicle` field
- Monitor logs for remaining usage
- Communicate timeline to all teams

### Phase 4 (Week 9): Breaking Change
- Remove `vehicle` field support
- Update documentation
- Deploy with version bump

## Rollback Plan

If issues arise, quick rollback options:
1. **Immediate**: Revert to original serializer
2. **Partial**: Keep both fields active longer
3. **Frontend**: Frontend can quickly revert to using `vehicle`

## Questions for Backend Team

1. **Preference**: Which migration option (1, 2, or 3) do you prefer?
2. **Timeline**: What timeline works best for your release schedule?
3. **Testing**: Do you need additional test cases beyond those suggested?
4. **Documentation**: Any specific documentation updates needed?
5. **Monitoring**: Should we add metrics to track field usage during transition?

---

**Ready to assist with implementation once approach is agreed upon.**
