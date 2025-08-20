# Auto Repair Shop Management System - Frontend

A comprehensive React TypeScript frontend for managing auto repair shop operations with Role-Based Access Control (RBAC).

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Three-tier permission system (Owner, Employee, Customer)
- **Responsive Design**: Built with React Bootstrap for mobile-first design
- **Type Safety**: Full TypeScript implementation with strict type checking
- **State Management**: Redux Toolkit with RTK Query for efficient API calls
- **Permission Guards**: Component-level and route-level access control
- **Modern Development**: Vite for fast development and hot module replacement

## 👥 User Roles & Permissions

### 🏢 Owner (Full Access)
- ✅ Shop management and configuration
- ✅ Financial reports and analytics
- ✅ Employee management and role assignment
- ✅ Complete inventory control
- ✅ All customer and vehicle data
- ✅ System administration

### 👨‍🔧 Employee (Operational Access)
- ✅ Inventory management (parts/services)
- ✅ Customer and vehicle management
- ✅ Repair order creation and tracking
- ✅ Appointment scheduling
- ❌ Financial data access
- ❌ Shop configuration
- ❌ Employee management

### 👤 Customer (Personal Access)
- ✅ Personal profile management
- ✅ Vehicle registration and updates
- ✅ Appointment booking
- ✅ Own repair order tracking
- ✅ Problem reporting
- ❌ Other customers' data
- ❌ Administrative functions

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Framework**: React Bootstrap + Bootstrap 5
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: RTK Query for efficient API communication
- **Development**: ESLint + TypeScript for code quality

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components  
│   ├── modals/         # Modal dialogs
│   └── PermissionGuard.tsx    # RBAC permission components
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication & RBAC logic
├── pages/              # Page components
│   ├── UserManagement.tsx     # User administration
│   ├── ShopManagement.tsx     # Shop operations (Owner only)
│   ├── FinancialReports.tsx   # Financial analytics (Owner only)
│   └── RBACDashboard.tsx      # RBAC control panel
├── store/              # Redux store configuration
│   └── slices/         # Redux slices
│       └── authSlice.ts        # Authentication state
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-repairs-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5174
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🧪 Testing RBAC System

Visit the comprehensive test suite to verify all permissions work correctly:
```
http://localhost:5174/rbac-test
```

This page provides:
- ✅ Role verification tests
- ✅ Permission function checks  
- ✅ Component guard testing
- ✅ Legacy role support validation
- ✅ usePermissions hook verification

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Auto Repair Shop
```

### Backend Integration
The frontend connects to a Django REST API backend. See `API_DOCUMENTATION.md` for complete endpoint documentation.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Automatic redirection for unauthorized access
- **Component Guards**: Fine-grained permission control
- **Role Validation**: Server-side role verification
- **Input Sanitization**: Protection against common web vulnerabilities

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (phones)
- 📱 Tablet devices  
- 💻 Desktop computers
- 🖥️ Large screens

## 🎨 UI Components

Built with React Bootstrap components:
- Navigation with role-based menus
- Modal dialogs for forms
- Tables with sorting and filtering
- Cards for data display
- Alerts and notifications
- Badges for status indicators

## 🔄 State Management

Uses Redux Toolkit for:
- **Authentication State**: User login/logout, role management
- **API Caching**: Efficient data fetching with RTK Query
- **Permission State**: Centralized RBAC logic
- **UI State**: Loading states, error handling

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your web server or CDN

3. **Configure environment variables** for production API endpoints

## 📋 API Integration

The frontend communicates with backend API endpoints documented in `API_DOCUMENTATION.md`. Key integration points:

- **Authentication**: JWT token management
- **Role-Based Filtering**: Automatic data filtering based on user role
- **Permission Checks**: Frontend permissions match backend access control
- **Error Handling**: Comprehensive error states and user feedback

## 🧑‍💻 Development

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules
- **Component Standards**: Reusable, testable components
- **Permission Patterns**: Consistent RBAC implementation

### Adding New Features
1. Define TypeScript interfaces in `src/types/`
2. Create reusable components in `src/components/`
3. Add permission checks using `useAuth` hook
4. Implement API calls with RTK Query
5. Add route protection where needed

### Permission Implementation
```typescript
// Example: Adding a new permission-protected component
import { PermissionGuard } from '../components/PermissionGuard';

const MyComponent = () => (
  <PermissionGuard 
    permission="canManageInventory"
    fallback={<div>Access denied</div>}
  >
    <div>Protected content</div>
  </PermissionGuard>
);
```

## 📞 Support

For questions or issues:
1. Check the RBAC test suite at `/rbac-test`
2. Review API documentation in `API_DOCUMENTATION.md`
3. Examine component implementations for examples
4. Test with different user roles to verify behavior

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
