import { useAuth } from "./useAuth";
import type { User } from "../types";

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
