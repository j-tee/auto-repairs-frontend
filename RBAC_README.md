# Auto Repairs Frontend - RBAC System

## Overview

This auto repair shop management system now implements a comprehensive **Role-Based Access Control (RBAC)** system with three distinct user types, each having different privilege levels and access permissions.

## 🎯 User Roles

### 1. Owner (Highest Privilege)
**Role**: `owner`  
**Description**: Shop owners have full administrative control over the system.

**Permissions**:
- ✅ **Full Shop Management**: Create, view, update, delete shops
- ✅ **Employee Management**: Create, view, update, delete employee accounts  
- ✅ **User Management**: View all users, update user roles
- ✅ **Financial Data Access**: View revenue, profits, financial summaries
- ✅ **Inventory Management**: Manage parts and services across all shops
- ✅ **Order Management**: View and manage all repair orders
- ✅ **Customer Data**: Access all customer information
- ✅ **Appointment Management**: Full CRUD operations on appointments

**Frontend Access**:
- 👥 User Management page
- 🏪 Shop Management page  
- 💰 Financial Reports page
- ⚙️ System Settings page
- All employee and customer features

### 2. Employee (Medium Privilege)
**Role**: `employee`  
**Description**: Shop employees can perform day-to-day operations.

**Permissions**:
- ❌ **Shop Management**: Cannot create/delete shops (view only their shop)
- ❌ **Employee Management**: Cannot create/delete employee accounts
- ❌ **Financial Data**: Cannot view revenue/profit data
- ✅ **Inventory Management**: Manage parts and services for their shop
- ✅ **Order Management**: Create and manage repair orders
- ✅ **Customer Data**: Access customer information
- ✅ **Appointment Management**: Full CRUD operations on appointments

**Frontend Access**:
- 🔧 Repairs Management
- 🚗 Vehicles Management
- 👥 Customer Management
- 🛠️ Services Management
- All customer features for personal use

### 3. Customer (Lowest Privilege)
**Role**: `customer`  
**Description**: Customers can only access their own data and create appointments.

**Permissions**:
- ❌ **Shop Management**: No access to shop data
- ❌ **Employee Management**: No access
- ❌ **Financial Data**: No access
- ❌ **Inventory Management**: No access to parts/services management
- ❌ **All Orders**: Cannot view other customers' orders
- ✅ **Own Data**: View and update their own profile
- ✅ **Own Vehicles**: View their vehicles
- ✅ **Own Orders**: View their repair orders only
- ✅ **Appointments**: Create appointments for their vehicles

**Frontend Access**:
- 📋 Personal Dashboard
- 🚗 My Vehicles
- 🔧 My Repairs
- 📅 Book Appointments
- 👤 Profile Settings

## 🔧 Technical Implementation

### Core Components

#### 1. Authentication System (`useAuth` hook)
```typescript
// New RBAC helper functions
const { 
  isOwner,           // Owner role check
  isEmployee,        // Employee role check (includes owners)
  isCustomer,        // Customer role check
  canManageShops,    // Shop management permission
  canViewFinancialData, // Financial data access
  canManageInventory,   // Inventory management
  canManageEmployees,   // User management
  hasPermission      // Generic permission check
} = useAuth();
```

#### 2. Permission Guard Component
```typescript
import { PermissionGuard, OwnerOnly, EmployeeOnly, CustomerOnly } from './components/PermissionGuard';

// Conditional rendering based on permissions
<OwnerOnly>
  <AdminPanel />
</OwnerOnly>

<EmployeeOnly>
  <InventoryManagement />
</EmployeeOnly>

<CustomerOnly>
  <PersonalDashboard />
</CustomerOnly>
```

#### 3. Protected Routes
```typescript
<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredRole="owner">
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

### User Interface Updates

#### 1. Navigation System
- **Owner**: Full navigation with "Owner" dropdown containing admin features
- **Employee**: Access to operational features (repairs, customers, vehicles, services)
- **Customer**: Basic navigation with personal features only

#### 2. Role-Based Dashboard
- **Owner Dashboard**: Financial overview, shop performance, user statistics
- **Employee Dashboard**: Daily schedule, pending repairs, inventory alerts
- **Customer Dashboard**: Personal vehicles, repair history, upcoming appointments

#### 3. User Management Interface
- Role selection: Owner/Employee/Customer
- Permission-based field visibility
- Bulk operations for user management
- Activity logging and session management

## 📁 File Structure

```
src/
├── components/
│   ├── PermissionGuard.tsx           # Permission-based rendering
│   ├── navigation/Navigation.tsx     # RBAC-aware navigation
│   └── modals/
│       ├── CreateUserModal.tsx       # User creation with roles
│       ├── EditUserModal.tsx         # User editing with roles
│       └── UserDetailsModal.tsx      # User details display
├── pages/
│   ├── UserManagement.tsx            # Owner: User administration
│   ├── ShopManagement.tsx            # Owner: Shop management
│   ├── FinancialReports.tsx          # Owner: Financial data
│   ├── SystemSettings.tsx            # Owner: System configuration
│   ├── RBACDashboard.tsx             # Role-based dashboard
│   └── DashboardPage.tsx             # Main dashboard
├── hooks/
│   └── useAuth.ts                    # Enhanced with RBAC functions
├── store/slices/
│   └── authSlice.ts                  # Updated User interface with permissions
├── types/
│   └── userManagement.ts             # RBAC-compatible types
└── services/
    └── userManagementAPI.ts          # User management API
```

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Default Test Users
```
Owner: 
  Email: owner@autorepairs.com
  Password: owner123

Employee:
  Email: employee@autorepairs.com  
  Password: employee123

Customer:
  Email: customer@autorepairs.com
  Password: customer123
```

## 🔒 Security Features

### 1. Frontend Permission Checks
- Role-based component rendering
- Navigation menu filtering
- Route protection
- Form field visibility control

### 2. Backend Integration Ready
- JWT token with role information
- Permission object in user data
- API endpoint protection
- Session management

### 3. User Experience
- Role-appropriate interfaces
- Contextual dashboards
- Intuitive navigation
- Clear permission feedback

## 🎨 UI/UX Features

### 1. Role Indicators
- Color-coded role badges
- Permission status displays
- Access level indicators
- Feature availability hints

### 2. Adaptive Interface
- Role-specific quick actions
- Contextual menu items
- Relevant statistics display
- Appropriate workflow guidance

### 3. User Feedback
- Clear access denied messages
- Permission requirement explanations
- Feature availability status
- Role-based help text

## 🔄 Migration from Legacy System

### Backward Compatibility
The system maintains compatibility with legacy roles:
- `admin` → `owner`
- `manager` → `owner`  
- `mechanic` → `employee`
- `customer` → `customer`

### Gradual Migration
1. New users default to the new role system
2. Existing users can be migrated through the admin interface
3. Legacy permission checks still work during transition
4. Full migration can be completed when ready

## 📊 Benefits

### 1. Enhanced Security
- Granular permission control
- Clear privilege separation
- Reduced attack surface
- Audit trail capabilities

### 2. Better User Experience  
- Role-appropriate interfaces
- Simplified navigation
- Contextual features
- Reduced complexity

### 3. Scalability
- Easy role expansion
- Permission customization
- Multi-shop support ready
- Enterprise-ready architecture

### 4. Maintainability
- Clear component separation
- Reusable permission guards
- Centralized access control
- Type-safe implementation

## 🛠️ Customization

### Adding New Permissions
1. Update the `User` interface in `authSlice.ts`
2. Add permission checks in `useAuth.ts`
3. Create new `PermissionGuard` components
4. Update navigation and routing

### Creating New Roles
1. Add role to the `User['role']` type
2. Update permission hierarchy in `hasPermission`
3. Add role-specific UI components
4. Update backend API accordingly

### Role-Specific Features
1. Use `PermissionGuard` for conditional rendering
2. Add role checks in component logic
3. Create role-specific pages/modals
4. Update navigation menus

## 📞 Support

For questions about the RBAC system implementation or customization, refer to the component documentation and type definitions in the codebase.
