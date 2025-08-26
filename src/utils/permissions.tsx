import React from "react";
import { PermissionGuard } from "../components/PermissionGuard";

interface PermissionGuardProps {
  children: React.ReactNode;
  role?: "owner" | "employee" | "customer";
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
