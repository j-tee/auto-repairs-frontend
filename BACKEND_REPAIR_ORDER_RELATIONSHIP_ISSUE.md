# 🚨 Backend RepairOrder Model Relationship Issue

## Issue Summary
The Django backend is throwing a `ValueError` when accessing the `/api/shop/repair-orders/active/` endpoint due to a missing relationship attribute `repairorderservice_set` on the `RepairOrder` model.

## Error Details
```
ValueError at /api/shop/repair-orders/active/
Exception raised in callable attribute "calculate_total_cost"; 
original exception was: 'RepairOrder' object has no attribute 'repairorderservice_set'

Request Method: GET
Request URL: http://127.0.0.1:8000/api/shop/repair-orders/active/
Django Version: 5.2.5
```

## Root Cause Analysis
The error occurs in the `RepairOrder.calculate_total_cost` method when trying to access `self.repairorderservice_set.all()`. This suggests:

1. **Missing Model Relationship**: The `RepairOrderService` model either doesn't exist or isn't properly linked to `RepairOrder`
2. **Missing Foreign Key**: The foreign key relationship from `RepairOrderService` to `RepairOrder` may be missing
3. **Incorrect related_name**: The `related_name` parameter in the foreign key might not be set to `repairorderservice_set`

## Expected Backend Model Structure
Based on the frontend type definitions, the expected model structure should be:

```python
# models.py
class RepairOrder(models.Model):
    # ... other fields ...
    
    def calculate_total_cost(self):
        # This method should be able to access related services
        service_cost = sum(
            ros.service.labor_cost for ros in self.repairorderservice_set.all()
        )
        # ... rest of calculation
```

```python
class RepairOrderService(models.Model):
    repair_order = models.ForeignKey(
        RepairOrder, 
        on_delete=models.CASCADE,
        related_name='repairorderservice_set'  # This ensures RepairOrder.repairorderservice_set works
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    # ... other fields
```

## Frontend Impact & Mitigation
The frontend has been updated with robust error handling:

### ✅ Implemented Fallback Strategy
- Primary: Try `/shop/repair-orders/active/` endpoint
- Fallback: Get all repair orders with status filter
- Ultimate fallback: Return empty array to prevent UI crashes

### ✅ Components Updated
1. **repairOrderMngtService.getActiveRepairOrders()**: Added 2-tier fallback
2. **dashboardService**: Already had error handling (no changes needed)
3. **AutoRepairDashboard**: Already had error handling (no changes needed)

## Backend Fix Required
To resolve this issue, the backend team needs to:

1. **Verify RepairOrderService Model Exists**:
   ```python
   # In shop/models.py
   class RepairOrderService(models.Model):
       repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name='repairorderservice_set')
       service = models.ForeignKey(Service, on_delete=models.CASCADE)
       quantity = models.PositiveIntegerField(default=1)
       # ... other fields
   ```

2. **Run Migrations**:
   ```bash
   python manage.py makemigrations shop
   python manage.py migrate
   ```

3. **Verify Related Names**: Ensure all M2M and FK relationships have correct related names

4. **Test the calculate_total_cost Method**: Ensure it can access all related objects

## Testing the Fix
Once the backend is fixed, test these endpoints:
- `GET /api/shop/repair-orders/active/` - Should return active repair orders
- `GET /api/shop/repair-orders/{id}/` - Should include cost calculation
- `POST /api/shop/repair-orders/` - Should work with services

## Frontend Status
✅ **Frontend is resilient**: The application will continue to work even while this backend issue exists
✅ **Error handling**: All error scenarios are gracefully handled
✅ **User experience**: Users see empty states instead of crashes
✅ **Logging**: Comprehensive logging for debugging

## Priority
🔴 **High Priority**: This affects core repair order functionality and financial calculations

## Next Steps
1. Backend team to implement the missing RepairOrderService model and relationships
2. Run database migrations
3. Test the `/active/` endpoint
4. Remove frontend fallback logic once backend is stable (optional)
