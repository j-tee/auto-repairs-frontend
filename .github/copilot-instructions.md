# Auto Repair Shop Management System - AI Coding Assistant Guidelines

## 🎯 Project Overview

This is a **React 18 + TypeScript + Vite** auto repair shop management system with **Redux Toolkit state management**, **RBAC (Role-Based Access Control)**, and **domain-driven service architecture**. The system manages customers, vehicles, appointments, repair orders, employees, and shops with comprehensive permission controls.

---

## 🏗️ Architecture Patterns

### Service Layer Architecture
- **Domain-Driven Design**: Each service handles a specific business domain
- **Location**: `src/services/`
- **Pattern**: Individual management services with TypeScript interfaces
- **Export**: Centralized exports via `src/services/index.ts`

```typescript
// Service naming convention
export { customerMngtService } from './customerMngtService';
export { vehicleMngtService } from './vehicleMngtService';
export { appointmentMngtService } from './appointmentMngtService';
export { repairOrderMngtService } from './repairOrderMngtService';
export { employeeMngtService } from './employeeMngtService';
export { shopMngtService } from './shopMngtService';
export { userMngtService } from './userMngtService';
export { authService } from './authService';
```

### Service Interface Pattern
Each service exports:
- **Domain Interface**: Main entity type (e.g., `Customer`, `Vehicle`)
- **Create Data Interface**: Data structure for creating entities (e.g., `CreateCustomerData`)
- **Update Data Interface**: Data structure for updates (e.g., `UpdateCustomerData`) 
- **Query Interface**: Filter/search parameters (e.g., `CustomerQuery`)
- **Service Instance**: The actual service object with methods

```typescript
// Example service structure
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // ... other properties
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // ... required fields only
}

export const customerMngtService = {
  getCustomers: async (query: CustomerQuery) => { /* ... */ },
  createCustomer: async (data: CreateCustomerData) => { /* ... */ },
  // ... other methods
};
```

---

## 🔄 State Management with Redux Toolkit

### Consolidated Slice Pattern
- **Single Slice**: `autoRepairsSlice.ts` contains ALL application state
- **Auth Integration**: Authentication state merged into main slice (no separate authSlice)
- **Type-Safe Hooks**: Use `useAppDispatch` and `useAppSelector` from `src/store/index.ts`

### State Structure
```typescript
interface EnhancedAutoRepairsState {
  // Auth state (merged from authSlice)
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Core entities
  vehicles: Vehicle[];
  customers: Customer[];
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  employees: Employee[];
  shops: Shop[];
  
  // Granular loading states
  loading: {
    login: boolean;
    vehicles: boolean;
    customers: boolean;
    createCustomer: boolean;
    updateCustomer: boolean;
    // ... specific loading state for each operation
  };
  
  // Granular error states
  error: {
    login: string | null;
    vehicles: string | null;
    customers: string | null;
    // ... specific error state for each operation
  };
}
```

### Hook Usage Pattern
```typescript
// Always use the domain-specific hook
import { useAutoRepairs } from '../hooks/useAutoRepairs';

const Component = () => {
  const {
    customers,
    loading,
    error,
    loadCustomers,
    addCustomer,
    editCustomer,
    removeCustomer
  } = useAutoRepairs();
  
  // Hook methods return Redux async thunk promises
  const handleCreate = async (data: CreateCustomerData) => {
    try {
      await addCustomer(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
};
```

---

## 🔐 RBAC (Role-Based Access Control)

### User Roles Hierarchy
1. **Owner** (Highest): Full system access, financial data, user management
2. **Employee** (Medium): Operational access, no financial/admin features  
3. **Customer** (Lowest): Personal data only

### Permission Guard Pattern
```typescript
import { PermissionGuard } from '../components/PermissionGuard';

// Conditional rendering by role
<PermissionGuard role="owner">
  <AdminPanel />
</PermissionGuard>

// Conditional rendering by permission
<PermissionGuard permission="canViewFinancialData">
  <FinancialReports />
</PermissionGuard>

// Simplified role guards
<OwnerOnly>
  <UserManagement />
</OwnerOnly>

<EmployeeOnly>
  <InventoryManagement />
</EmployeeOnly>
```

### Protected Route Pattern
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredRole="owner">
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

### Legacy Role Mapping
The system automatically maps legacy roles:
- `admin` → `owner`
- `manager` → `owner`
- `mechanic` → `employee`

---

## 🌐 API Integration Patterns

### Axios Client Configuration
- **Location**: `src/utils/api.ts`
- **Features**: Auto auth tokens, retry logic, query string serialization, error handling
- **Environment**: Uses `VITE_API_BASE_URL` for backend URL

### API Utility Functions
```typescript
// Generic API functions (avoid direct axios usage)
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Always use with proper TypeScript generics
const customers = await apiGet<Customer[]>('/shop/customers/');
const newCustomer = await apiPost<Customer>('/shop/customers/', customerData);
```

### Service Method Pattern
Services handle URL construction and data transformation:
```typescript
// Service methods handle endpoint construction
const customers = await customerMngtService.getCustomers({ search: 'john' });
// Internally calls: GET /api/shop/customers/?search=john

// Never construct URLs directly in components
```

---

## 🔧 Component Patterns

### Modal Patterns
- **Location**: `src/components/modals/`
- **Naming**: `Add{Entity}Modal.tsx`, `Edit{Entity}Modal.tsx`
- **Props**: Accept `show`, `onHide`, and entity-specific props
- **State**: Use local state for form data, Redux for submission

### Error Handling Pattern
```typescript
const [localError, setLocalError] = useState<string | null>(null);

try {
  await serviceCall();
  setLocalError(null);
} catch (error) {
  setLocalError(error.message);
}

// Display both Redux and local errors
{(error.operation || localError) && (
  <Alert variant="danger">
    {error.operation || localError}
  </Alert>
)}
```

### Loading State Pattern
```typescript
// Use granular loading states from Redux
{loading.customers ? (
  <Spinner animation="border" />
) : (
  <CustomersTable data={customers} />
)}
```

---

## 📝 Type Transformations & Compatibility

### Service vs Shared Types
Services define their own types that may differ from shared types. Always use service types in Redux and components:

```typescript
// ✅ Correct - use service types
import { Customer, CreateCustomerData } from '../services/customerMngtService';

// ❌ Avoid - shared types may be outdated
import { Customer } from '../types/entities';
```

### Filter/Query Transformations
Some services expect different formats:
```typescript
// AppointmentFilters (UI) vs AppointmentQuery (service)
const transformFilters = (filters: AppointmentFilters): AppointmentQuery => {
  return {
    ...filters,
    // Transform array to single value if needed
    status: Array.isArray(filters.status) ? filters.status[0] : filters.status
  };
};
```

### Property Name Mapping
Be aware of property name differences:
- **Customer**: Service uses `firstName`/`lastName`, some components may expect `name`
- **RepairOrder**: Service uses `orderNumber`, some components may expect `workOrderNumber`
- **Vehicle**: Service includes `isActive`, ensure it's provided in create operations

---

## 🛠️ Development Conventions

### File Organization
```
src/
├── services/          # Domain services (8 services)
├── store/             # Redux store and slices
├── hooks/             # Custom hooks (useAuth, useAutoRepairs)
├── components/        # Reusable components
│   ├── modals/        # Entity modals
│   └── guards/        # Permission guards
├── pages/             # Route components
├── utils/             # API utilities
└── types/             # TypeScript definitions
```

### Import Order Convention
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { Button, Modal } from 'react-bootstrap';

// 3. Internal hooks
import { useAuth, useAutoRepairs } from '../hooks';

// 4. Service imports
import { customerMngtService, type CreateCustomerData } from '../services';

// 5. Component imports
import { PermissionGuard } from '../components';
```

### Error Boundary Pattern
```typescript
// Wrap major sections in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <MainApplication />
</ErrorBoundary>
```

---

## 🚨 Common Issues & Solutions

### TypeScript Compilation Errors
1. **Service Type Mismatches**: Always use service-specific types, not shared types
2. **Missing Properties**: Ensure all required properties are provided (e.g., `Vehicle.isActive`)
3. **Filter Transformations**: Transform UI filters to service query format

### Redux State Issues
1. **Loading States**: Use granular loading states (`loading.createCustomer` vs `loading.customers`)
2. **Error Clearing**: Clear specific errors using `clearError('operation')`
3. **State Updates**: Use slice actions for local updates, thunks for API calls

### RBAC Issues
1. **Permission Checks**: Use `PermissionGuard` components, not manual role checks
2. **Route Protection**: Always wrap sensitive routes with `ProtectedRoute`
3. **Legacy Compatibility**: System handles legacy role mapping automatically

### API Integration Issues
1. **Endpoint URLs**: Services handle URL construction, don't build URLs manually
2. **Authentication**: API client handles tokens automatically
3. **Error Handling**: Use try/catch with service calls, display user-friendly errors

---

## 📋 Development Checklist

### Adding New Features
- [ ] Define TypeScript interfaces in appropriate service
- [ ] Add Redux async thunks for API operations
- [ ] Create component with proper RBAC guards
- [ ] Add loading and error states
- [ ] Update navigation if needed
- [ ] Test with different user roles

### Modifying Existing Features
- [ ] Check service type compatibility
- [ ] Update Redux slice if state changes
- [ ] Verify RBAC permissions still work
- [ ] Test error scenarios
- [ ] Ensure loading states are handled

### API Integration
- [ ] Use service methods, not direct API calls
- [ ] Handle authentication automatically
- [ ] Transform data between service and UI formats
- [ ] Implement proper error handling
- [ ] Add retry logic for failed requests

---

## 💡 Best Practices

### State Management
1. **Single Source of Truth**: Use Redux for all shared state
2. **Local State**: Use local state for form inputs and UI-only state
3. **Async Operations**: Always use Redux async thunks for API calls
4. **Error Handling**: Provide both global and local error handling

### Component Design
1. **Separation of Concerns**: Components handle UI, hooks handle business logic
2. **Prop Typing**: Use service types for props, not shared types
3. **Error Boundaries**: Wrap major sections to prevent app crashes
4. **Performance**: Use `useCallback` and `useMemo` for expensive operations

### Security
1. **RBAC First**: Always check permissions before rendering sensitive content
2. **API Security**: API client handles authentication tokens automatically
3. **Route Protection**: Protect sensitive routes with `ProtectedRoute`
4. **Error Messages**: Don't expose sensitive information in error messages

### Code Quality
1. **TypeScript Strict**: Enable strict mode and fix all type errors
2. **ESLint**: Follow project ESLint configuration
3. **Documentation**: Document complex business logic and transformations
4. **Testing**: Test different user roles and error scenarios

---

## 🔗 Key Files Reference

- **Main Store**: `src/store/slices/autoRepairsSlice.ts`
- **Store Configuration**: `src/store/index.ts`
- **API Utilities**: `src/utils/api.ts`
- **Auth Hook**: `src/hooks/useAuth.ts`
- **Main Hook**: `src/hooks/useAutoRepairs.ts`
- **Permission Guard**: `src/components/PermissionGuard.tsx`
- **Protected Route**: `src/components/ProtectedRoute.tsx`
- **Services Index**: `src/services/index.ts`

This system is designed for immediate productivity while maintaining code quality, type safety, and security through RBAC. Always prioritize service types over shared types, use the provided hooks for state management, and implement proper permission checks for all features.
