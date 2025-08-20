# Frontend-Backend API Integration Guide

## 🔗 Endpoint Mapping

This document shows how frontend service calls map to the actual backend API endpoints.

### ✅ Updated Endpoints (Aligned with Backend)

| Frontend Service | Method | Backend Endpoint | Description |
|-----------------|--------|------------------|-------------|
| **Vehicle Service** |
| `vehicleService.getAll()` | GET | `/api/shop/vehicles/` | List all vehicles |
| `vehicleService.getById(id)` | GET | `/api/shop/vehicles/{id}/` | Get vehicle details |
| `vehicleService.create(data)` | POST | `/api/shop/vehicles/` | Create new vehicle |
| `vehicleService.update(id, data)` | PUT | `/api/shop/vehicles/{id}/` | Update vehicle |
| `vehicleService.delete(id)` | DELETE | `/api/shop/vehicles/{id}/` | Delete vehicle |
| `vehicleService.search(query)` | GET | `/api/shop/vehicles/?search={query}` | Search vehicles |
| **Repair Job Service** |
| `repairJobService.getAll()` | GET | `/api/shop/repair-orders/` | List repair orders |
| `repairJobService.getById(id)` | GET | `/api/shop/repair-orders/{id}/` | Get repair order details |
| `repairJobService.create(data)` | POST | `/api/shop/repair-orders/` | Create repair order |
| `repairJobService.update(id, data)` | PUT | `/api/shop/repair-orders/{id}/` | Update repair order |
| `repairJobService.delete(id)` | DELETE | `/api/shop/repair-orders/{id}/` | Delete repair order |
| `repairJobService.getStatistics()` | GET | `/api/shop/repair-orders/financial_summary/` | Get financial stats |
| **Customer Service** |
| `customerService.getAll()` | GET | `/api/shop/customers/` | List customers |
| `customerService.getById(id)` | GET | `/api/shop/customers/{id}/` | Get customer details |
| `customerService.create(data)` | POST | `/api/shop/customers/` | Create customer |
| `customerService.update(id, data)` | PUT | `/api/shop/customers/{id}/` | Update customer |
| `customerService.delete(id)` | DELETE | `/api/shop/customers/{id}/` | Delete customer |
| `customerService.search(query)` | GET | `/api/shop/customers/?search={query}` | Search customers |
| **Reporting Service** |
| `reportingService.getDashboardSummary()` | GET | `/api/shop/repair-orders/financial_summary/` | Dashboard data |
| `reportingService.getRevenueReport()` | GET | `/api/shop/repair-orders/financial_summary/` | Revenue report |
| **Inventory Service** |
| `inventoryService.getParts()` | GET | `/api/shop/parts/` | List parts |
| `inventoryService.updatePartQuantity()` | PATCH | `/api/shop/parts/{id}/` | Update part |
| `inventoryService.getServices()` | GET | `/api/shop/services/` | List services |
| `inventoryService.createService()` | POST | `/api/shop/services/` | Create service |

## 🚨 Previously Misaligned Endpoints (Now Fixed)

| ❌ Old Frontend Call | ✅ New Frontend Call | Backend Endpoint |
|---------------------|---------------------|------------------|
| `/reports/dashboard` | `/shop/repair-orders/financial_summary` | `/api/shop/repair-orders/financial_summary/` |
| `/vehicles` | `/shop/vehicles` | `/api/shop/vehicles/` |
| `/repair-jobs` | `/shop/repair-orders` | `/api/shop/repair-orders/` |
| `/customers` | `/shop/customers` | `/api/shop/customers/` |
| `/reports/revenue` | `/shop/repair-orders/financial_summary` | `/api/shop/repair-orders/financial_summary/` |
| `/reports/performance` | `/shop/repair-orders?analytics=true` | `/api/shop/repair-orders/` |
| `/inventory/parts` | `/shop/parts` | `/api/shop/parts/` |

## 🔐 RBAC Endpoint Access

### Owner Role Access
```typescript
// Full access to all endpoints
const ownerEndpoints = [
  '/api/shop/shops/',           // Shop management
  '/api/shop/repair-orders/financial_summary/', // Financial data
  '/api/admin/users/',          // User management
  '/api/shop/employees/',       // Employee management
  // + all employee and customer endpoints
];
```

### Employee Role Access  
```typescript
// Limited management access
const employeeEndpoints = [
  '/api/shop/vehicles/',        // Vehicle management
  '/api/shop/customers/',       // Customer management
  '/api/shop/repair-orders/',   // Repair order management
  '/api/shop/parts/',           // Parts inventory
  '/api/shop/services/',        // Services inventory
  '/api/shop/appointments/',    // Appointment management
  // - financial endpoints
  // - shop management
  // - employee management
];
```

### Customer Role Access
```typescript
// Personal data only
const customerEndpoints = [
  '/api/auth/user/',            // Own profile
  '/api/shop/vehicles/?owner=self',     // Own vehicles only
  '/api/shop/repair-orders/?customer=self', // Own orders only
  '/api/shop/appointments/?customer=self',  // Own appointments
  '/api/shop/vehicle-problems/?customer=self', // Own problems
  // - all management endpoints
  // - other customers' data
];
```

## 🔧 Usage Examples

### Making API Calls with Proper Authentication

```typescript
// Example: Get dashboard data (Owner only)
import { reportingService } from '../services/autoRepairsService';
import { useAuth } from '../hooks/useAuth';

const DashboardComponent = () => {
  const { canViewFinancialData } = useAuth();
  
  useEffect(() => {
    if (canViewFinancialData()) {
      // This calls GET /api/shop/repair-orders/financial_summary/
      reportingService.getDashboardSummary()
        .then(data => setDashboardData(data))
        .catch(error => console.error('Dashboard error:', error));
    }
  }, [canViewFinancialData]);
};
```

### Error Handling for 404s

```typescript
// Before fix: Would get 404 for /api/reports/dashboard
// After fix: Calls correct /api/shop/repair-orders/financial_summary/

const handleApiCall = async () => {
  try {
    const data = await reportingService.getDashboardSummary();
    return data;
  } catch (error) {
    if (error.status === 404) {
      console.error('Endpoint not found - check API documentation');
    } else if (error.status === 403) {
      console.error('Access denied - check user permissions');
    }
    throw error;
  }
};
```

## 🧪 Testing Endpoint Alignment

### 1. Check Network Tab
- Open browser DevTools → Network tab
- Perform actions in the application
- Verify calls go to `/api/shop/*` endpoints (not `/api/reports/*`)

### 2. Backend API Testing
```bash
# Test if endpoints exist
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/shop/vehicles/
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/shop/repair-orders/financial_summary/
```

### 3. Frontend Service Testing
```typescript
// Test service calls resolve correctly
import { vehicleService } from '../services/autoRepairsService';

// Should call /api/shop/vehicles/ (not /api/vehicles/)
const vehicles = await vehicleService.getAll();
console.log('Vehicles loaded:', vehicles);
```

## 📝 Notes

1. **All service endpoints updated** to match backend API structure
2. **RBAC permissions preserved** - frontend guards still work correctly  
3. **Search functionality** changed from `/search?q=` to `/?search=` pattern
4. **Financial data** consolidated to `/financial_summary/` endpoint
5. **Inventory operations** moved to `/shop/parts/` and `/shop/services/`

## 🎯 Next Steps

1. ✅ **Endpoints aligned** - All frontend calls match backend API
2. ✅ **Error handling updated** - 404s should be resolved
3. ✅ **RBAC maintained** - Permission checks still work
4. 🔄 **Test with backend** - Verify all endpoints return expected data
5. 🔄 **Add error boundaries** - Handle any remaining API integration issues
