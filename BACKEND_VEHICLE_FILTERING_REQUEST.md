# Backend API Enhancement Request: Vehicle Filtering by Customer

## Current Issue
The frontend appointment scheduling system requires loading vehicles for a specific customer, but the current `/api/shop/vehicles/` endpoint returns ALL vehicles in the database regardless of query parameters. This creates performance and usability issues.

## Database Schema Analysis
Based on the existing database structure:
```sql
-- Current vehicle table structure
auto_repairs_db=# select * from shop_vehicle limit 3;
 id | customer_id | make   | model  | year | license_plate 
----+-------------+--------+--------+------+---------------
 27 |          24 | Toyota | Camry  | 2018 | ABC123       
 28 |          19 | Honda  | Civic  | 2020 | XYZ789       
 29 |          20 | Ford   | F-150  | 2019 | DEF456       
```

The `shop_vehicle` table has a `customer_id` field that establishes the relationship.

## Required API Enhancements

### 1. Vehicle Filtering by Customer ID
**Endpoint:** `GET /api/shop/vehicles/`
**Enhancement:** Add support for `customer_id` query parameter

**Example Request:**
```
GET /api/shop/vehicles/?customer_id=24
```

**Expected Response:**
```json
[
  {
    "id": 27,
    "customer_id": 24,
    "make": "Toyota",
    "model": "Camry",
    "year": 2018,
    "license_plate": "ABC123",
    "is_active": true
  },
  {
    "id": 32,
    "customer_id": 24,
    "make": "Ford",
    "model": "Explorer",
    "year": 2021,
    "license_plate": "GHI789",
    "is_active": true
  }
]
```

### 2. Customer-Specific Vehicle Endpoint (Recommended)
**New Endpoint:** `GET /api/shop/customers/{customer_id}/vehicles/`

**Example Request:**
```
GET /api/shop/customers/24/vehicles/
```

**Benefits:**
- RESTful design
- Clear relationship hierarchy
- Easier caching and permissions
- Better API documentation

### 3. Django Implementation Suggestion

#### Option A: Add filtering to existing ViewSet
```python
# In your VehicleViewSet
from django_filters import rest_framework as filters

class VehicleFilter(filters.FilterSet):
    customer_id = filters.NumberFilter(field_name='customer_id')
    
    class Meta:
        model = Vehicle
        fields = ['customer_id', 'is_active']

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = VehicleFilter
```

#### Option B: Add nested route (Preferred)
```python
# In your urls.py
from rest_framework.decorators import action

class CustomerViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['get'])
    def vehicles(self, request, pk=None):
        customer = self.get_object()
        vehicles = Vehicle.objects.filter(customer_id=customer.id, is_active=True)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
```

## Frontend Use Cases Requiring This Filtering

### 1. Appointment Scheduling
- **Current Problem:** When scheduling an appointment, selecting a customer loads ALL vehicles
- **Required:** Only show vehicles belonging to the selected customer
- **Frequency:** Every appointment creation/editing

### 2. Customer Vehicle Management
- **Current Problem:** Customer details page would show all vehicles
- **Required:** Show only customer's vehicles
- **Frequency:** Customer profile views

### 3. Repair Order Creation
- **Current Problem:** Similar to appointments - all vehicles loaded
- **Required:** Customer-specific vehicle selection
- **Frequency:** Every repair order creation

### 4. Vehicle Problem Reporting
- **Current Problem:** Customer can see all vehicles when reporting problems
- **Required:** Only their own vehicles
- **Frequency:** Problem reporting workflows

## Performance Impact

### Current State (Inefficient)
```
GET /api/shop/vehicles/ → Returns ~50+ vehicles
Frontend filters clientside → Uses only 1-2 vehicles
Wasted bandwidth: 48+ vehicle records
```

### With Backend Filtering (Efficient)
```
GET /api/shop/vehicles/?customer_id=24 → Returns 2 vehicles
Frontend uses all returned data → 100% efficiency
Bandwidth saved: 96% reduction
```

## Security Considerations

### Role-Based Access Control
- **Owners/Employees:** Can access any customer's vehicles
- **Customers:** Should only access their own vehicles (customer_id = request.user.customer.id)

### Implementation Example:
```python
def get_queryset(self):
    queryset = Vehicle.objects.filter(is_active=True)
    
    # Filter by customer_id parameter
    customer_id = self.request.query_params.get('customer_id', None)
    if customer_id:
        queryset = queryset.filter(customer_id=customer_id)
    
    # Security: Customers can only see their own vehicles
    if self.request.user.role == 'customer':
        queryset = queryset.filter(customer_id=self.request.user.customer.id)
    
    return queryset
```

## Testing Requirements

### 1. Functional Tests
- Verify filtering by customer_id works
- Test with non-existent customer_id (should return empty)
- Test without customer_id parameter (should return all for owners/employees)

### 2. Security Tests
- Customer users cannot access other customers' vehicles
- Owner/Employee users can access any customer's vehicles

### 3. Performance Tests
- Response time with filtering vs without
- Database query optimization (ensure indexes on customer_id)

## Database Optimization

### Recommended Index
```sql
-- Ensure index exists for efficient filtering
CREATE INDEX IF NOT EXISTS idx_shop_vehicle_customer_id ON shop_vehicle(customer_id);
```

## Priority and Impact

**Priority:** HIGH
**Effort:** LOW (1-2 hours development)
**Impact:** HIGH (Fixes major UX issue, improves performance)

## Expected URLs After Implementation

### Option A: Query Parameter Filtering
```
GET /api/shop/vehicles/?customer_id=24          # Customer 24's vehicles
GET /api/shop/vehicles/?customer_id=19          # Customer 19's vehicles  
GET /api/shop/vehicles/                         # All vehicles (owners/employees)
```

### Option B: Nested Resource (Preferred)
```
GET /api/shop/customers/24/vehicles/            # Customer 24's vehicles
GET /api/shop/customers/19/vehicles/            # Customer 19's vehicles
GET /api/shop/vehicles/                         # All vehicles (admin view)
```

## Frontend Integration

Once implemented, the frontend will use:
```typescript
// For appointment scheduling
const customerVehicles = await vehicleMngtService.getVehicles({ customerId: "24" });

// Or with nested route
const customerVehicles = await vehicleMngtService.getCustomerVehicles("24");
```

## Request for Backend Developer

Please implement **Option B (Nested Resource)** as it follows REST conventions better. If that's not feasible immediately, **Option A (Query Parameter)** would also solve the issue.

**Estimated Timeline:** 1-2 hours development + testing
**Breaking Changes:** None (additive enhancement)
**Dependencies:** None

Please confirm which approach you prefer and provide the final URL structure so we can update the frontend service accordingly.
