# Backend Implementation Request: Repair Order Status Management

## 🎯 Request Summary
Please implement proper status management for repair orders that aligns with the business workflow and frontend requirements.

## 🚨 Current Problem
The frontend receives this error when trying to filter/query repair orders by status:
```
FieldError at /api/shop/repair-orders/
Cannot resolve keyword 'status' into field. 
Choices are: date_created, discount_amount, discount_percent, id, notes, parts, repair_order_parts, repair_order_services, services, tax_percent, total_cost, vehicle, vehicle_id
```

## 📋 Business Requirements

### User Stories
1. **Shop Manager**: "I need to see all repair orders that are in progress so I can track workload"
2. **Service Advisor**: "I need to update a repair order status when work is completed"
3. **Customer**: "I want to know if my repair is pending, in progress, or completed"
4. **Technician**: "I need to mark work as started when I begin and completed when done"

### Status Workflow
```
[Created] → [In Progress] → [Awaiting Parts] → [Completed]
                ↓
            [On Hold] → [Cancelled]
```

## 🔧 Proposed Backend Implementation

### Option 1: Add Status Field to Repair Orders (Recommended)
Add a `status` field directly to the `repair_order` model:

```python
# models.py
class RepairOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('awaiting_parts', 'Awaiting Parts'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Existing fields...
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    # ... other existing fields
    
    # NEW FIELD
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
```

### Option 2: Status Through Appointment Relationship (Alternative)
If you prefer to keep status in appointments, provide a computed field:

```python
# serializers.py
class RepairOrderSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    def get_status(self, obj):
        # Get related appointment for this vehicle
        try:
            appointment = Appointment.objects.filter(
                vehicle=obj.vehicle
            ).order_by('-date_created').first()
            return appointment.status if appointment else 'pending'
        except:
            return 'pending'
    
    class Meta:
        model = RepairOrder
        fields = ['id', 'vehicle', 'status', ...] # include computed status
```

## 🌐 Required API Endpoints

### 1. GET /api/shop/repair-orders/ (Enhanced)
**Add status filtering support:**
```python
# views.py
class RepairOrderListView(generics.ListCreateAPIView):
    def get_queryset(self):
        queryset = RepairOrder.objects.all()
        status = self.request.query_params.get('status')
        
        if status:
            # Support multiple statuses: ?status=pending,in_progress
            status_list = status.split(',')
            queryset = queryset.filter(status__in=status_list)
            
        return queryset
```

**Frontend Usage:**
```javascript
// Get pending repair orders
GET /api/shop/repair-orders/?status=pending

// Get active repair orders (multiple statuses)
GET /api/shop/repair-orders/?status=pending,in_progress,awaiting_parts
```

### 2. PATCH /api/shop/repair-orders/{id}/ (Enhanced)
**Add status update support:**
```python
# Allow status updates in existing update endpoint
{
  "status": "in_progress"
}
```

### 3. POST /api/shop/repair-orders/{id}/start-work/ (Optional)
**Workflow-specific endpoint:**
```python
# Custom action for starting work
def start_work(self, request, pk=None):
    repair_order = self.get_object()
    repair_order.status = 'in_progress'
    repair_order.save()
    return Response({'status': 'work_started'})
```

### 4. POST /api/shop/repair-orders/{id}/complete/ (Optional)
**Workflow-specific endpoint:**
```python
def complete_work(self, request, pk=None):
    repair_order = self.get_object()
    repair_order.status = 'completed'
    repair_order.completion_date = timezone.now()
    repair_order.save()
    return Response({'status': 'completed'})
```

## 📊 Database Migration

### Migration for Option 1 (Direct Status Field)
```python
# migration file
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('shop', 'XXXX_previous_migration'),
    ]

    operations = [
        migrations.AddField(
            model_name='repairorder',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('in_progress', 'In Progress'),
                    ('awaiting_parts', 'Awaiting Parts'),
                    ('on_hold', 'On Hold'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled')
                ],
                default='pending',
                max_length=20
            ),
        ),
    ]
```

## 🧪 Testing Requirements

### API Response Format
```json
{
  "results": [
    {
      "id": 1,
      "vehicle": {
        "id": 1,
        "make": "Toyota",
        "model": "Camry"
      },
      "status": "in_progress",
      "date_created": "2025-08-27T10:00:00Z",
      "total_cost": "450.00",
      "repair_order_parts": [...],
      "repair_order_services": [...]
    }
  ]
}
```

### Test Cases Needed
1. **Filter by single status**: `GET /api/shop/repair-orders/?status=pending`
2. **Filter by multiple statuses**: `GET /api/shop/repair-orders/?status=pending,in_progress`
3. **Update status**: `PATCH /api/shop/repair-orders/1/ {"status": "completed"}`
4. **Invalid status handling**: Should return validation error
5. **Status in list response**: Every repair order should include status

## 🔄 Data Migration Strategy

### For Existing Data
```python
# data migration
def migrate_existing_repair_orders(apps, schema_editor):
    RepairOrder = apps.get_model('shop', 'RepairOrder')
    
    for repair_order in RepairOrder.objects.all():
        # Set default status based on business logic
        if repair_order.completion_date:
            repair_order.status = 'completed'
        else:
            repair_order.status = 'pending'
        repair_order.save()
```

## 🎯 Priority Level: HIGH

### Business Impact
- **User Experience**: Critical for shop management workflow
- **Frontend Development**: Blocking current feature implementation
- **Data Integrity**: Essential for accurate business reporting

### Timeline Request
- **Development**: 2-3 days
- **Testing**: 1 day  
- **Deployment**: ASAP

## 📞 Frontend Integration Ready

Once implemented, the frontend will immediately support:
- ✅ Status filtering in repair order lists
- ✅ Status updates through UI actions
- ✅ Status-based conditional rendering
- ✅ Workflow management (start work, complete work)
- ✅ Dashboard status analytics

## 📝 Questions for Backend Team

1. **Preference**: Do you prefer Option 1 (direct status field) or Option 2 (computed from appointments)?
2. **Migration**: Any concerns about adding status field to existing repair orders?
3. **Validation**: Should status transitions be restricted (e.g., can't go from 'completed' to 'pending')?
4. **History**: Do you want to track status change history?
5. **Timeline**: What's the estimated implementation timeline?

---

**Contact**: Frontend Development Team  
**Date**: August 27, 2025  
**Priority**: High - Blocking current development
