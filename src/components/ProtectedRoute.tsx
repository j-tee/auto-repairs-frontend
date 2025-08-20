import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User["role"] | "admin" | "manager" | "mechanic"; // Support both new and legacy roles
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    path: location.pathname,
    user: user,
    requiredRole,
    hasPermission: requiredRole ? hasPermission(requiredRole) : "N/A",
  });

  if (!user) {
    console.log("No user, redirecting to login");
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    console.log(
      `User ${user.email} doesn't have ${requiredRole} permission, redirecting to dashboard`
    );
    // User doesn't have required permissions
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
