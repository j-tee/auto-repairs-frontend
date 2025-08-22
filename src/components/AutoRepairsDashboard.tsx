import React from "react";
import { useAutoRepairs } from "../hooks/useAutoRepairs";

const AutoRepairsDashboard: React.FC = () => {
  const autoRepairs = useAutoRepairs();

  const handleCreateSampleJob = () => {
    if (autoRepairs.vehicles.length === 0) {
      alert("Please load vehicles first to create a repair order");
      return;
    }

    const sampleRepairOrder = {
      customerId: autoRepairs.customers[0]?.id || "sample-customer-id",
      vehicleId: autoRepairs.vehicles[0]?.id || "sample-vehicle-id",
      serviceAdvisorId: "default-advisor-id",
      shopId: "default-shop-id",
      description: "Oil change and tire rotation",
      customerComplaints: "Routine maintenance needed",
      priority: "medium" as const,
      status: "created" as const,
      diagnosis: "Routine maintenance required",
      recommendedServices: "Regular oil changes recommended every 5,000 miles",
      laborHours: 2,
      laborRate: 75,
      partsTotal: 50,
      laborTotal: 150,
      taxAmount: 15,
      discountAmount: 0,
      totalAmount: 215,
      customerApprovalRequired: false,
    };

    autoRepairs.addRepairOrder(sampleRepairOrder);
  };

  const handleUpdateJobStatus = (jobId: string) => {
    const repairOrder = autoRepairs.repairOrders.find(
      (order) => order.id === jobId
    );
    if (!repairOrder) {
      alert("Repair order not found");
      return;
    }

    const statusFlow: Record<string, string> = {
      created: "in_progress",
      in_progress: "waiting_approval",
      waiting_approval: "completed",
      waiting_parts: "in_progress",
      completed: "created",
      cancelled: "created",
    };

    const newStatus = statusFlow[repairOrder.status] as any;
    if (newStatus) {
      autoRepairs.editRepairOrder(jobId, { status: newStatus });
    }
  };

  return (
    <div className="card">
      <h2>Auto Repairs Dashboard</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={autoRepairs.loadVehicles}
          disabled={autoRepairs.loading.vehicles}
        >
          {autoRepairs.loading.vehicles ? "Loading..." : "Load Vehicles"}
        </button>
        <button
          onClick={autoRepairs.loadRepairOrders}
          disabled={autoRepairs.loading.repairOrders}
        >
          {autoRepairs.loading.repairOrders
            ? "Loading..."
            : "Load Repair Orders"}
        </button>
        <button
          onClick={autoRepairs.loadCustomers}
          disabled={autoRepairs.loading.customers}
        >
          {autoRepairs.loading.customers ? "Loading..." : "Load Customers"}
        </button>
        <button onClick={autoRepairs.loadAllData}>Load All Data</button>
        <button
          onClick={handleCreateSampleJob}
          disabled={autoRepairs.loading.repairOrders}
        >
          {autoRepairs.loading.repairOrders
            ? "Creating..."
            : "Create Sample Job"}
        </button>
      </div>

      {/* Display data counts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>Vehicles</h3>
          <p>Count: {autoRepairs.vehicles.length}</p>
          {autoRepairs.error.vehicles && (
            <p style={{ color: "red" }}>Error: {autoRepairs.error.vehicles}</p>
          )}
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>Repair Orders</h3>
          <p>Count: {autoRepairs.repairOrders?.length || 0}</p>
          {autoRepairs.error.repairOrders && (
            <p style={{ color: "red" }}>
              Error: {autoRepairs.error.repairOrders}
            </p>
          )}
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>Customers</h3>
          <p>Count: {autoRepairs.customers.length}</p>
          {autoRepairs.error.customers && (
            <p style={{ color: "red" }}>Error: {autoRepairs.error.customers}</p>
          )}
        </div>
      </div>

      {/* Repair Orders List */}
      {autoRepairs.repairOrders.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Repair Orders</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "10px",
            }}
          >
            {autoRepairs.repairOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor:
                    order.status === "completed"
                      ? "#e8f5e8"
                      : order.status === "in_progress"
                      ? "#fff3cd"
                      : "#f8f9fa",
                }}
              >
                <p>
                  <strong>Work Order #:</strong> {order.orderNumber}
                </p>
                <p>
                  <strong>Description:</strong> {order.description}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    style={{
                      padding: "2px 6px",
                      marginLeft: "5px",
                      borderRadius: "3px",
                      backgroundColor:
                        order.status === "completed"
                          ? "#28a745"
                          : order.status === "in_progress"
                          ? "#ffc107"
                          : order.status === "draft"
                          ? "#6c757d"
                          : "#dc3545",
                      color: "white",
                      fontSize: "0.8em",
                    }}
                  >
                    {order.status}
                  </span>
                </p>
                <p>
                  <strong>Priority:</strong> {order.priority}
                </p>
                <p>
                  <strong>Total Amount:</strong> ${order.total}
                </p>
                <button
                  onClick={() => handleUpdateJobStatus(order.id)}
                  disabled={autoRepairs.loading.repairOrders}
                  style={{ marginTop: "5px" }}
                >
                  {autoRepairs.loading.repairOrders
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {autoRepairs.error.repairOrders && (
        <p style={{ color: "red" }}>
          Repair Orders Error: {autoRepairs.error.repairOrders}
        </p>
      )}
      {autoRepairs.error.vehicles && (
        <p style={{ color: "red" }}>
          Vehicles Error: {autoRepairs.error.vehicles}
        </p>
      )}
      {autoRepairs.error.customers && (
        <p style={{ color: "red" }}>
          Customers Error: {autoRepairs.error.customers}
        </p>
      )}

      {Object.values(autoRepairs.error).some((error) => error) && (
        <button
          onClick={autoRepairs.clearAllErrors}
          style={{
            marginTop: "10px",
            backgroundColor: "#dc3545",
            color: "white",
          }}
        >
          Clear All Errors
        </button>
      )}
    </div>
  );
};

export default AutoRepairsDashboard;
