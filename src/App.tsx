import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navigation } from "./components/navigation/Navigation";
import { AuthPage } from "./components/auth/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { ModalsDemo } from "./components/ModalsDemo";
import { useAuth } from "./hooks/useAuth";
import "./App.scss";
import "./styles/watermark.scss";

// App Content Component (needs to be inside Router)
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navigation />}
      <div className={user ? "content-watermark" : ""}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modals"
            element={
              <ProtectedRoute>
                <ModalsDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute requiredRole="mechanic">
                <div style={{ padding: "20px" }}>
                  <h1>Repairs Management</h1>
                  <p>Repair tickets and status tracking</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute requiredRole="mechanic">
                <div style={{ padding: "20px" }}>
                  <h1>Vehicle Management</h1>
                  <p>Vehicle information and history</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="manager">
                <div style={{ padding: "20px" }}>
                  <h1>Reports & Analytics</h1>
                  <p>Business insights and performance metrics</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <div style={{ padding: "20px" }}>
                  <h1>User Administration</h1>
                  <p>Manage users, roles, and permissions</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute requiredRole="admin">
                <div style={{ padding: "20px" }}>
                  <h1>System Settings</h1>
                  <p>Configure system-wide settings</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>Profile Settings</h1>
                  <p>Update your personal information</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-repairs"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>My Repairs</h1>
                  <p>Track your repair requests and history</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vehicles"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>My Vehicles</h1>
                  <p>Manage your registered vehicles</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>Preferences</h1>
                  <p>Customize your app experience</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
          <Route
            path="*"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <>
      {/* Automotive Watermark Background */}
      <div className="app-background">
        <div className="watermark-pattern"></div>
      </div>

      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
