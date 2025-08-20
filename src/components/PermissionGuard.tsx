import React from "react";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../store/slices/autoRepairsSlice";

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
  const { user, hasPermission } = useAuth();

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
  if (requireOwner && user.role !== "owner") {
    return showError ? (
      <div className="alert alert-danger">
        Access denied. Owner privileges required.
      </div>
    ) : (
      (fallback as React.ReactElement)
    );
  }

  // Check employee requirement (includes owners)
  if (requireEmployee && user.role !== "employee" && user.role !== "owner") {
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
        hasRequiredPermission = user.role === "owner";
        break;
      case "canViewFinancialData":
        hasRequiredPermission =
          user.role === "owner" || user.role === "employee";
        break;
      case "canManageInventory":
        hasRequiredPermission =
          user.role === "owner" || user.role === "employee";
        break;
      case "canManageEmployees":
        hasRequiredPermission = user.role === "owner";
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
  const { user, hasPermission } = useAuth();

  const permissions = {
    user,
    // Role checks - using the correct role names and logic
    isOwner: user?.role === "owner",
    isEmployee: user?.role === "employee",
    isCustomer: user?.role === "customer",

    // Permission checks based on role hierarchy
    canManageShops: user?.role === "owner", // Only owners can manage shops
    canViewFinancialData: user?.role === "owner" || user?.role === "employee", // Owners and employees
    canManageInventory: user?.role === "owner" || user?.role === "employee", // Owners and employees
    canManageEmployees: user?.role === "owner", // Only owners can manage employees

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
          return user?.role === "owner";
        case "canViewFinancialData":
          return user?.role === "owner" || user?.role === "employee";
        case "canManageInventory":
          return user?.role === "owner" || user?.role === "employee";
        case "canManageEmployees":
          return user?.role === "owner";
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
