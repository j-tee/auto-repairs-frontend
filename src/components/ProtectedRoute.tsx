import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types";

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

  console.log("ProtectedRoute check:", {
    path: location.pathname,
    user: user,
    requiredRole,
    mappedRole,
    hasPermission: mappedRole ? hasPermission(mappedRole) : "N/A",
  });

  if (!user) {
    console.log("No user, redirecting to login");
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mappedRole && !hasPermission(mappedRole)) {
    console.log(
      `User ${user.email} doesn't have ${requiredRole} (mapped to ${mappedRole}) permission, redirecting to dashboard`
    );
    // User doesn't have required permissions
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
