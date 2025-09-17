import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navigation } from "./components/navigation/Navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AutoRepairDashboard } from "./pages/AutoRepairDashboard";
import { UserManagement } from "./pages/UserManagement";
import { ShopManagement } from "./pages/ShopManagement";
import { FinancialReports } from "./pages/FinancialReports";
import { VehicleManagement } from "./pages/VehicleManagement";
import { CustomerManagement } from "./pages/CustomerManagement";
import { AppointmentManagement } from "./pages/AppointmentManagement";
import { RepairManagement } from "./pages/RepairManagement";
import { ServiceCatalogManagement } from "./pages/ServiceCatalogManagement";
import { TechnicianDashboard } from "./pages/TechnicianDashboard";
import { useAuth } from "./hooks/useAuth";
import { useAppDispatch } from "./store";
import { initializeAuth } from "./store/slices/autoRepairsSlice";
import { displayEnvironmentStatus } from "./utils/environmentConfig";
import "./App.scss";
import "./styles/watermark.scss";
import { ToastContainer } from "react-toastify";

// App Content Component (needs to be inside Router)
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Initialize authentication state from localStorage on app start
  useEffect(() => {
    dispatch(initializeAuth());

    // Display environment status in development
    if (import.meta.env.DEV) {
      displayEnvironmentStatus();
    }
  }, [dispatch]);

  return (
    <>
      {user && <Navigation />}
      <div className={user ? "content-watermark" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />
          
          {/* Public Information Routes */}
          <Route
            path="/demo"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Product Demo</h1>
                <p>Watch how AutoRepair Pro can transform your business</p>
                <p>Demo content coming soon...</p>
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Contact Sales</h1>
                <p>Get in touch with our team to learn more</p>
                <p>Contact form coming soon...</p>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>About AutoRepair Pro</h1>
                <p>Learn more about our company and mission</p>
                <p>About page coming soon...</p>
              </div>
            }
          />
          <Route
            path="/help"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Help Center</h1>
                <p>Find answers to common questions</p>
                <p>Help documentation coming soon...</p>
              </div>
            }
          />
          <Route
            path="/privacy"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Privacy Policy</h1>
                <p>Our commitment to protecting your data</p>
                <p>Privacy policy coming soon...</p>
              </div>
            }
          />
          <Route
            path="/terms"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Terms of Service</h1>
                <p>Terms and conditions for using AutoRepair Pro</p>
                <p>Terms of service coming soon...</p>
              </div>
            }
          />
          <Route
            path="/documentation"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>Documentation</h1>
                <p>API and user documentation</p>
                <p>Documentation coming soon...</p>
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AutoRepairDashboard />
              </ProtectedRoute>
            }
          />
          {/* Customer Routes */}
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
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>My Appointments</h1>
                  <p>View and schedule appointments</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-repair-orders"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>My Repair Orders</h1>
                  <p>Track your repair orders and history</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredRole="employee">
                <CustomerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute requiredRole="employee">
                <VehicleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole="employee">
                <AppointmentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repair-orders"
            element={
              <ProtectedRoute requiredRole="employee">
                <RepairManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute requiredRole="employee">
                <ServiceCatalogManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parts"
            element={
              <ProtectedRoute requiredRole="employee">
                <div style={{ padding: "20px" }}>
                  <h1>Parts Inventory</h1>
                  <p>Manage parts inventory and orders</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Technician Routes */}
          <Route
            path="/technician-dashboard"
            element={
              <ProtectedRoute>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRole="owner">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/financial"
            element={
              <ProtectedRoute requiredRole="owner">
                <FinancialReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/customers"
            element={
              <ProtectedRoute requiredRole="owner">
                <div style={{ padding: "20px" }}>
                  <h1>Customer Reports</h1>
                  <p>Customer analytics and insights</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/inventory"
            element={
              <ProtectedRoute requiredRole="owner">
                <div style={{ padding: "20px" }}>
                  <h1>Inventory Reports</h1>
                  <p>Parts and inventory analytics</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-settings"
            element={
              <ProtectedRoute requiredRole="owner">
                <ShopManagement />
              </ProtectedRoute>
            }
          />

          {/* Profile and Settings */}
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
          {/* Catch-all redirect */}
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
    <ToastContainer position="top-right" autoClose={5000} />
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
