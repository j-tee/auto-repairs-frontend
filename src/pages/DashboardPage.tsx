import React from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CounterComponent,
  AutoRepairsDashboard,
  AxiosQueryDemo,
} from "../components";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-content">
      <h1>Welcome back, {user?.firstName}!</h1>
      <p>
        Role: <strong>{user?.role}</strong>
      </p>

      <div style={{ marginTop: "30px" }}>
        <h2>Auto Repairs Management System</h2>

        {/* Axios + Query String Demo */}
        <AxiosQueryDemo />

        {/* Redux Counter Component */}
        <CounterComponent />

        {/* Auto Repairs Dashboard Component */}
        <AutoRepairsDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
