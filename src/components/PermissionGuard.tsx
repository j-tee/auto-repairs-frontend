import React from "react";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types";

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
