# Dashboard Backend API Requirements

## Executive Summary

The frontend dashboard service is currently experiencing significant gaps between what the backend provides and what the frontend requires for a comprehensive auto repair shop dashboard. This document outlines the current state, gaps, and specific requirements for backend implementation.

## Current Backend vs Frontend Requirements Analysis

### 1. Shop Statistics Endpoint: `/shop/shops/stats/`

**Current Backend Response (`ShopStatsAPIResponse`):**
```json
{
  "total_shops": 5,
  "active_shops": 4,
  "revenue_this_month": 15000.50,
  "recentActivity": [],
  "upcomingAppointments": [],
  "lowInventoryItems": [],
  "employeePerformance": [],
  "topServices": [
    {
      "name": "Oil Change",
      "count": 25,
      "revenue": 1250.00
    }
  ],
  "availableSlots": [
    {
      "time": "09:00",
      "available": true
    }
  ],
  "busySlots": [
    {
      "time": "14:00", 
      "available": false
    }
  ]
}
```

**Frontend Requirements (`ShopStats`):**
```typescript
interface ShopStats {
  id: string;                        // ❌ MISSING
  name: string;                      // ❌ MISSING  
  totalTechnicians: number;          // ❌ MISSING
  activeTechnicians: number;         // ❌ MISSING
  averageRepairTime: number;         // ❌ MISSING (in hours)
  customerSatisfactionScore: number; // ❌ MISSING (0-5 scale)
  monthlyRevenue: number;            // ✅ AVAILABLE (revenue_this_month)
  completedRepairsThisMonth: number; // ❌ MISSING
  pendingRepairs: number;            // ❌ MISSING
  capacityUtilization: number;       // ❌ MISSING (percentage 0-100)
}
```

### 2. Dashboard Statistics Requirements

The frontend dashboard service attempts to aggregate data from multiple endpoints:

#### ✅ **Working Endpoints:**
- `GET /appointments/appointments/` - Appointments data
- `GET /customers/customers/` - Customer data  
- `GET /repair-orders/repair-orders/active/` - Active repair orders
- `GET /repair-orders/repair-orders/` - All repair orders

#### ❌ **Problematic Endpoints:**
- `GET /shop/shops/stats/` - Returns incomplete data for dashboard needs

### 3. Critical Missing Backend Data

#### 3.1 Technician/Employee Statistics
**Required but not provided:**
- Total technicians count
- Active/working technicians count
- Employee performance metrics

#### 3.2 Shop Performance Metrics
**Required but not provided:**
- Average repair completion time
- Customer satisfaction scores
- Shop capacity utilization rates
- Individual shop identification (id, name)

#### 3.3 Operational Metrics
**Required but not provided:**
- Completed repairs count for current month
- Pending repairs count
- Work bay utilization

## Recommended Backend Implementations

### Option 1: Enhanced Shop Stats Endpoint (Recommended)

**Endpoint:** `GET /shop/shops/stats/`

**Enhanced Response Format:**
```json
{
  // Existing fields (keep as-is)
  "total_shops": 5,
  "active_shops": 4,
  "revenue_this_month": 15000.50,
  "recentActivity": [],
  "upcomingAppointments": [],
  "lowInventoryItems": [],
  "employeePerformance": [],
  "topServices": [...],
  "availableSlots": [...],
  "busySlots": [...],
  
  // NEW REQUIRED FIELDS
  "shop_details": {
    "id": "shop_001",
    "name": "Main Auto Shop"
  },
  "technician_stats": {
    "total_technicians": 8,
    "active_technicians": 6,
    "on_break_technicians": 1,
    "unavailable_technicians": 1
  },
  "repair_metrics": {
    "average_repair_time_hours": 4.5,
    "completed_repairs_this_month": 45,
    "pending_repairs": 12,
    "capacity_utilization_percentage": 75.5
  },
  "quality_metrics": {
    "customer_satisfaction_score": 4.2,
    "average_rating": 4.2,
    "total_reviews": 156
  }
}
```

### Option 2: Dedicated Dashboard Endpoint (Alternative)

**New Endpoint:** `GET /dashboard/stats/`

**Query Parameters:**
- `user_role`: "customer" | "employee" | "owner"
- `user_id`: (optional, for customer-specific data)

**Response Format:**
```json
{
  "role": "owner",
  "overview": {
    "todays_appointments": 12,
    "active_repairs": 8,
    "total_customers": 245,
    "todays_revenue": 2850.00
  },
  "monthly_stats": {
    "appointments": 89,
    "revenue": 15000.50,
    "new_customers": 15,
    "completed_repairs": 45
  },
  "shop_performance": {
    "id": "shop_001",
    "name": "Main Auto Shop",
    "total_technicians": 8,
    "active_technicians": 6,
    "average_repair_time": 4.5,
    "customer_satisfaction": 4.2,
    "capacity_utilization": 75.5,
    "pending_repairs": 12
  },
  "last_updated": "2025-08-26T15:30:00Z"
}
```

## Current Frontend Workarounds

**The frontend currently implements these workarounds:**

1. **Default Values**: Missing backend data is filled with zeros/empty strings
2. **Error Handling**: Graceful degradation when shop stats fail (404 expected)
3. **Data Aggregation**: Manually calculating statistics from multiple endpoints
4. **Role-Based Logic**: Different data requirements based on user role

## Implementation Priority

### High Priority (Dashboard Unusable Without)
1. **Shop identification**: `id` and `name` fields
2. **Technician counts**: Basic staffing information
3. **Repair metrics**: Completion counts and pending work

### Medium Priority (Nice to Have)
1. **Performance metrics**: Average repair times
2. **Quality scores**: Customer satisfaction ratings
3. **Capacity metrics**: Utilization percentages

### Low Priority (Future Enhancement)
1. **Advanced analytics**: Trend data, predictions
2. **Real-time metrics**: Live updates, notifications

## Database Schema Considerations

**Recommended database fields to support these metrics:**

```sql
-- Shop table enhancements
ALTER TABLE shops ADD COLUMN total_technicians INTEGER DEFAULT 0;
ALTER TABLE shops ADD COLUMN bay_count INTEGER DEFAULT 0;

-- Employee/Technician tracking
CREATE TABLE technician_status (
  id SERIAL PRIMARY KEY,
  technician_id INTEGER REFERENCES employees(id),
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'busy', 'break', 'unavailable'
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Repair order timing
ALTER TABLE repair_orders ADD COLUMN started_at TIMESTAMP;
ALTER TABLE repair_orders ADD COLUMN completed_at TIMESTAMP;

-- Customer satisfaction
CREATE TABLE customer_ratings (
  id SERIAL PRIMARY KEY,
  repair_order_id INTEGER REFERENCES repair_orders(id),
  customer_id INTEGER REFERENCES customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Endpoints

**Current frontend test files available:**
- `debug-search-endpoints.html`
- `direct-api-test.html`
- `test-search-api.html`

**Recommended backend testing:**
```bash
# Test current endpoint
curl -X GET "http://localhost:8000/shop/shops/stats/" \
  -H "Authorization: Bearer <token>"

# Test with proposed enhancements
curl -X GET "http://localhost:8000/dashboard/stats/?user_role=owner" \
  -H "Authorization: Bearer <token>"
```

## Conclusion

The dashboard functionality is currently limited by missing backend data. Implementing the enhanced shop stats endpoint or dedicated dashboard endpoint will provide:

1. **Complete Dashboard Experience**: All metrics displayed properly
2. **Role-Based Functionality**: Appropriate data for customer/employee/owner views  
3. **Performance Insights**: Meaningful business metrics for decision making
4. **Scalable Architecture**: Foundation for future dashboard enhancements

**Next Steps:**
1. Backend team implements enhanced shop stats endpoint
2. Frontend team removes workarounds and utilizes real data
3. Testing and validation of dashboard functionality
4. Progressive enhancement with additional metrics

**Estimated Backend Development Time:**
- Enhanced shop stats endpoint: 2-3 days
- Database schema updates: 1 day  
- Testing and documentation: 1 day
- **Total: 4-5 days**
