import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../store/slices/autoRepairsSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User["role"] | "admin" | "manager" | "mechanic"; // Support both new and legacy roles
}

// Map legacy roles to actual user roles
const mapLegacyRole = (role: string): User["role"] => {
  switch (role) {
    case "admin":
    case "manager":
      return "owner";
    case "mechanic":
      return "employee";
    default:
      return role as User["role"];
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const mappedRole = requiredRole ? mapLegacyRole(requiredRole) : undefined;

  // Debug info: path: ${location.pathname}, user: ${user?.email}, requiredRole: ${requiredRole}, mappedRole: ${mappedRole}

  if (!user) {
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mappedRole && !hasPermission(mappedRole)) {
    // User ${user.email} doesn't have ${requiredRole} (mapped to ${mappedRole}) permission, redirecting to dashboard
    // User doesn't have required permissions
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
