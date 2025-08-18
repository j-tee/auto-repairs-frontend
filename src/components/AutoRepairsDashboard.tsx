import React from "react";
import { useAutoRepairs } from "../hooks/useAutoRepairs";

const AutoRepairsDashboard: React.FC = () => {
  const autoRepairs = useAutoRepairs();

  const handleCreateSampleJob = () => {
    if (autoRepairs.vehicles.length === 0) {
      alert("Please load vehicles first to create a job");
      return;
    }

    const sampleJob = {
      vehicleId: autoRepairs.vehicles[0]?.id || "sample-vehicle-id",
      description: "Oil change and tire rotation",
      status: "pending" as const,
      estimatedCost: 150,
      mechanicId: "mechanic-1",
    };

    autoRepairs.createJob(sampleJob);
  };

  const handleUpdateJobStatus = (jobId: string) => {
    const job = autoRepairs.repairJobs.find((j) => j.id === jobId);
    if (!job) return;

    const statusFlow = {
      pending: "in-progress",
      "in-progress": "completed",
      completed: "pending",
      cancelled: "pending",
    } as const;

    const newStatus = statusFlow[job.status];
    autoRepairs.updateJobStatus(jobId, newStatus);
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
          onClick={autoRepairs.loadRepairJobs}
          disabled={autoRepairs.loading.repairJobs}
        >
          {autoRepairs.loading.repairJobs ? "Loading..." : "Load Repair Jobs"}
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
          disabled={autoRepairs.loading.createJob}
        >
          {autoRepairs.loading.createJob ? "Creating..." : "Create Sample Job"}
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
          <h3>Repair Jobs</h3>
          <p>Count: {autoRepairs.repairJobs.length}</p>
          {autoRepairs.error.repairJobs && (
            <p style={{ color: "red" }}>
              Error: {autoRepairs.error.repairJobs}
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

      {/* Repair Jobs List */}
      {autoRepairs.repairJobs.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Repair Jobs</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "10px",
            }}
          >
            {autoRepairs.repairJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor:
                    job.status === "completed"
                      ? "#e8f5e8"
                      : job.status === "in-progress"
                      ? "#fff3cd"
                      : "#f8f9fa",
                }}
              >
                <p>
                  <strong>Description:</strong> {job.description}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    style={{
                      padding: "2px 6px",
                      marginLeft: "5px",
                      borderRadius: "3px",
                      backgroundColor:
                        job.status === "completed"
                          ? "#28a745"
                          : job.status === "in-progress"
                          ? "#ffc107"
                          : job.status === "pending"
                          ? "#6c757d"
                          : "#dc3545",
                      color: "white",
                      fontSize: "0.8em",
                    }}
                  >
                    {job.status}
                  </span>
                </p>
                <p>
                  <strong>Estimated Cost:</strong> ${job.estimatedCost}
                </p>
                {job.actualCost && (
                  <p>
                    <strong>Actual Cost:</strong> ${job.actualCost}
                  </p>
                )}
                <button
                  onClick={() => handleUpdateJobStatus(job.id)}
                  disabled={autoRepairs.loading.updateJob}
                  style={{ marginTop: "5px" }}
                >
                  {autoRepairs.loading.updateJob
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {autoRepairs.error.createJob && (
        <p style={{ color: "red" }}>
          Create Job Error: {autoRepairs.error.createJob}
        </p>
      )}
      {autoRepairs.error.updateJob && (
        <p style={{ color: "red" }}>
          Update Job Error: {autoRepairs.error.updateJob}
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
