import React from "react";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../store/slices/authSlice";

interface PermissionGuardProps {
  children: React.ReactNode;
  role?: User["role"];
  permission?:
    | "canManageShops"
    | "canViewFinancialData"
    | "canManageInventory"
    | "canManageEmployees";
  requireOwner?: boolean;
  requireEmployee?: boolean;
  fallback?: React.ReactNode;
  showError?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * Supports both role-based and permission-based access control
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  role,
  permission,
  requireOwner = false,
  requireEmployee = false,
  fallback = null,
  showError = false,
}) => {
  const {
    user,
    isOwner,
    isEmployee,
    canManageShops,
    canViewFinancialData,
    canManageInventory,
    canManageEmployees,
    hasPermission,
  } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return showError ? (
      <div className="alert alert-warning">
        Please log in to access this content.
      </div>
    ) : (
      (fallback as React.ReactElement)
    );
  }

  // Check specific role requirement
  if (role && !hasPermission(role)) {
    return showError ? (
      <div className="alert alert-danger">
        Access denied. {role.charAt(0).toUpperCase() + role.slice(1)} privileges
        required.
      </div>
    ) : (
      (fallback as React.ReactElement)
    );
  }

  // Check owner requirement
  if (requireOwner && !isOwner()) {
    return showError ? (
      <div className="alert alert-danger">
        Access denied. Owner privileges required.
      </div>
    ) : (
      (fallback as React.ReactElement)
    );
  }

  // Check employee requirement (includes owners)
  if (requireEmployee && !isEmployee()) {
    return showError ? (
      <div className="alert alert-danger">
        Access denied. Employee or owner privileges required.
      </div>
    ) : (
      (fallback as React.ReactElement)
    );
  }

  // Check specific permission
  if (permission) {
    let hasRequiredPermission = false;

    switch (permission) {
      case "canManageShops":
        hasRequiredPermission = canManageShops();
        break;
      case "canViewFinancialData":
        hasRequiredPermission = canViewFinancialData();
        break;
      case "canManageInventory":
        hasRequiredPermission = canManageInventory();
        break;
      case "canManageEmployees":
        hasRequiredPermission = canManageEmployees();
        break;
      default:
        hasRequiredPermission = false;
    }

    if (!hasRequiredPermission) {
      return showError ? (
        <div className="alert alert-danger">
          Access denied. Insufficient permissions.
        </div>
      ) : (
        (fallback as React.ReactElement)
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

/**
 * Hook for conditional logic based on permissions
 */
export const usePermissions = () => {
  const {
    user,
    isOwner,
    isEmployee,
    isCustomer,
    canManageShops,
    canViewFinancialData,
    canManageInventory,
    canManageEmployees,
    hasPermission,
  } = useAuth();

  const permissions = {
    user,
    // Role checks
    isOwner: isOwner(),
    isEmployee: isEmployee(),
    isCustomer: isCustomer(),

    // Permission checks
    canManageShops: canManageShops(),
    canViewFinancialData: canViewFinancialData(),
    canManageInventory: canManageInventory(),
    canManageEmployees: canManageEmployees(),

    // Helper functions
    hasRole: (role: User["role"]) => hasPermission(role),
    canAccess: (
      permission:
        | "canManageShops"
        | "canViewFinancialData"
        | "canManageInventory"
        | "canManageEmployees"
    ) => {
      switch (permission) {
        case "canManageShops":
          return canManageShops();
        case "canViewFinancialData":
          return canViewFinancialData();
        case "canManageInventory":
          return canManageInventory();
        case "canManageEmployees":
          return canManageEmployees();
        default:
          return false;
      }
    },
  };

  return permissions;
};

/**
 * Higher-order component for protecting entire routes/pages
 */
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PermissionGuardProps, "children">
) => {
  return (props: P) => (
    <PermissionGuard {...options}>
      <Component {...props} />
    </PermissionGuard>
  );
};

// Specific permission components for common use cases
export const OwnerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard requireOwner fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const EmployeeOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard requireEmployee fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CustomerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard role="customer" fallback={fallback}>
    {children}
  </PermissionGuard>
);
