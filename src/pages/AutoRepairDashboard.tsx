import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Tab,
  Tabs,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import {
  AddCustomerModal,
  AddVehicleModal,
  AddAppointmentModal,
  AddRepairOrderModal,
  AddVehicleProblemModal,
} from "../components/modals";
import { dashboardService } from "../services";
import type { DashboardSummary } from "../types/dashboard";
import { appointmentMngtService } from "../services/appointmentMngtService";
import { repairOrderMngtService } from "../services/repairOrderMngtService";
import type { Appointment } from "../types/appointments";
import type { RepairOrder } from "../types/repairOrders";

export const AutoRepairDashboard: React.FC = () => {
  const { user } = useAuth();

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Backend status warning
  const [backendWarning, setBackendWarning] = useState<string | null>(null);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Today's appointments data
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>(
    []
  );
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Active repairs data
  const [activeRepairs, setActiveRepairs] = useState<RepairOrder[]>([]);
  const [repairsLoading, setRepairsLoading] = useState(false);

  const loadTodaysAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const appointments =
        await appointmentMngtService.getTodaysAppointments();

      console.log(`✅ Loaded ${appointments.length} appointments for today`);

      setTodaysAppointments(appointments.slice(0, 5)); // Show max 5 appointments
    } catch (error: unknown) {
      console.error("Error loading today's appointments:", error);
      setTodaysAppointments([]); // Fall back to empty array
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const loadActiveRepairs = useCallback(async () => {
    try {
      setRepairsLoading(true);
      // Use the smart method that filters by appointment status
      const activeRepairs =
        await repairOrderMngtService.getActiveRepairOrders();

      console.log(`✅ Loaded ${activeRepairs.length} active repair orders`);

      setActiveRepairs(activeRepairs.slice(0, 5)); // Show max 5 active repairs
      
      // Clear any previous backend warnings if successful
      if (backendWarning && backendWarning.includes('repair orders')) {
        setBackendWarning(null);
      }
      
    } catch (error: unknown) {
      console.error("Error loading active repairs:", error);
      setActiveRepairs([]); // Fall back to empty array
      
      // Show user-friendly warning about backend issues
      setBackendWarning(
        "Some repair order data may be temporarily unavailable due to a backend issue. " +
        "The system is using fallback data. Please contact IT support if this persists."
      );
      
      // Auto-hide warning after 10 seconds
      setTimeout(() => setBackendWarning(null), 10000);
      
    } finally {
      setRepairsLoading(false);
    }
  }, [backendWarning]);

  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);

      const data = await dashboardService.getDashboardStats(
        user?.role || "customer",
        user?.id !== undefined ? String(user.id) : undefined
      );

      setDashboardData(data);

      // Also load detailed data for the schedule and repairs sections
      if (user?.role !== "customer") {
        // Load appointments and repairs in parallel, but don't let one failure stop the other
        const [appointmentsResult, repairsResult] = await Promise.allSettled([
          loadTodaysAppointments(),
          loadActiveRepairs(),
        ]);

        // Log any failures but continue
        if (appointmentsResult.status === "rejected") {
          console.error(
            "Failed to load appointments:",
            appointmentsResult.reason
          );
        }
        if (repairsResult.status === "rejected") {
          console.error("Failed to load repairs:", repairsResult.reason);
        }
      }
    } catch (error: unknown) {
      console.error("Error loading dashboard data:", error);
      setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard data");

      // Even if dashboard stats fail, try to load the appointments and repairs
      if (user?.role !== "customer") {
        try {
          await Promise.allSettled([
            loadTodaysAppointments(),
            loadActiveRepairs(),
          ]);
        } catch (secondaryError) {
          console.error("Secondary data loading also failed:", secondaryError);
        }
      }
    } finally {
      setDashboardLoading(false);
    }
  }, [user?.role, user?.id, loadTodaysAppointments, loadActiveRepairs]);

  // Load dashboard data on component mount
  useEffect(() => {
    if (user?.role) {
      loadDashboardData();
    }
  }, [user?.role, user?.id, loadDashboardData]);

  const formatAppointmentTime = (appointment: Appointment) => {
    try {
      // Service type uses scheduledDate and scheduledTime
      if (appointment.scheduledTime) {
        return appointment.scheduledTime;
      }
      if (appointment.scheduledDate) {
        const date = new Date(appointment.scheduledDate);
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return "TBD";
    } catch {
      return "TBD";
    }
  };

  const getRepairProgress = (repairOrder: RepairOrder) => {
    // Since backend doesn't have status field, estimate progress based on available data
    // This is a simplified approach - in a real scenario, you'd have actual progress tracking

    // If there are services or parts, assume some progress has been made
    const hasServices = repairOrder.items && repairOrder.items.length > 0;
    const hasTotal = repairOrder.total && repairOrder.total > 0;

    if (hasTotal && hasServices) {
      return 75; // Good progress if both services and pricing are set
    } else if (hasTotal || hasServices) {
      return 50; // Some progress if either services or pricing is set
    } else {
      return 25; // Initial progress for new orders
    }
  };

  const handleRefreshData = async () => {
    setBackendWarning(null); // Clear any warnings
    await loadDashboardData();
  };

  const handleSuccess = (entityType: string) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const getCustomerActions = () => [
    {
      title: "My Vehicles",
      icon: "🚗",
      action: () => (window.location.href = "/my-vehicles"),
      variant: "info" as const,
      description: "View and manage your vehicles",
    },
    {
      title: "Book Appointment",
      icon: "📅",
      action: () => setShowAppointmentModal(true),
      variant: "primary" as const,
      description: "Schedule a service appointment",
    },
    {
      title: "Report Problem",
      icon: "⚠️",
      action: () => setShowProblemModal(true),
      variant: "warning" as const,
      description: "Report a vehicle issue",
    },
    {
      title: "My Repair Orders",
      icon: "📋",
      action: () => (window.location.href = "/my-repair-orders"),
      variant: "success" as const,
      description: "Track repair progress",
    },
  ];

  const getEmployeeActions = () => [
    {
      title: "New Customer",
      icon: "👤",
      action: () => setShowCustomerModal(true),
      variant: "success" as const,
      description: "Register new customer",
    },
    {
      title: "Add Vehicle",
      icon: "🚗",
      action: () => setShowVehicleModal(true),
      variant: "info" as const,
      description: "Register customer vehicle",
    },
    {
      title: "Schedule Appointment",
      icon: "📅",
      action: () => setShowAppointmentModal(true),
      variant: "primary" as const,
      description: "Book customer appointment",
    },
    {
      title: "Create Repair Order",
      icon: "📋",
      action: () => setShowRepairOrderModal(true),
      variant: "danger" as const,
      description: "Start new repair order",
    },
  ];

  const getOwnerActions = () => [
    {
      title: "Employee Management",
      icon: "👥",
      action: () => (window.location.href = "/employees"),
      variant: "primary" as const,
      description: "Manage staff",
    },
    {
      title: "Financial Reports",
      icon: "💰",
      action: () => (window.location.href = "/reports/financial"),
      variant: "success" as const,
      description: "View revenue & profits",
    },
    {
      title: "Customer Analytics",
      icon: "📊",
      action: () => (window.location.href = "/reports/customers"),
      variant: "info" as const,
      description: "Customer insights",
    },
    {
      title: "Shop Settings",
      icon: "⚙️",
      action: () => (window.location.href = "/shop-settings"),
      variant: "secondary" as const,
      description: "Configure shop settings",
    },
  ];

  const getRoleBasedActions = () => {
    switch (user?.role) {
      case "customer":
        return getCustomerActions();
      case "employee":
        return getEmployeeActions();
      case "owner":
        return [...getEmployeeActions(), ...getOwnerActions()];
      default:
        return [];
    }
  };

  const getDashboardStats = () => {
    if (dashboardLoading) {
      return [
        { title: "Loading...", value: "...", icon: "⏳", color: "secondary" },
        { title: "Loading...", value: "...", icon: "⏳", color: "secondary" },
        { title: "Loading...", value: "...", icon: "⏳", color: "secondary" },
        { title: "Loading...", value: "...", icon: "⏳", color: "secondary" },
      ];
    }

    if (dashboardError || !dashboardData) {
      return [
        { title: "Error", value: "N/A", icon: "❌", color: "danger" },
        { title: "Error", value: "N/A", icon: "❌", color: "danger" },
        { title: "Error", value: "N/A", icon: "❌", color: "danger" },
        { title: "Error", value: "N/A", icon: "❌", color: "danger" },
      ];
    }

    const { stats } = dashboardData;

    if (user?.role === "customer") {
      return [
        {
          title: "My Vehicles",
          value: stats.customerVehicles?.toString() || "0",
          icon: "🚗",
          color: "primary",
        },
        {
          title: "Active Appointments",
          value: stats.customerActiveAppointments?.toString() || "0",
          icon: "📅",
          color: "info",
        },
        {
          title: "Repair Orders",
          value: stats.customerRepairOrders?.toString() || "0",
          icon: "📋",
          color: "warning",
        },
        {
          title: "Total Spent",
          value: stats.customerTotalSpent
            ? `$${stats.customerTotalSpent.toLocaleString()}`
            : "$0",
          icon: "💰",
          color: "success",
        },
      ];
    }

    if (user?.role === "employee" || user?.role === "owner") {
      return [
        {
          title: "Today's Appointments",
          value: stats.todaysAppointments.toString(),
          icon: "📅",
          color: "primary",
        },
        {
          title: "Active Repairs",
          value: stats.activeRepairs.toString(),
          icon: "🔧",
          color: "warning",
        },
        {
          title: "Total Customers",
          value: stats.totalCustomers.toString(),
          icon: "👥",
          color: "info",
        },
        {
          title: "Revenue Today",
          value: `$${stats.todaysRevenue.toLocaleString()}`,
          icon: "💰",
          color: "success",
        },
      ];
    }

    return [];
  };

  return (
    <div
      className="dashboard-content py-4"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "1.5rem 16px",
      }}
    >
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {backendWarning && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setBackendWarning(null)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Backend Notice:</strong> {backendWarning}
              </div>
            </div>
            <Button
              variant="outline-warning"
              size="sm"
              onClick={handleRefreshData}
              disabled={dashboardLoading}
            >
              <i className="fas fa-refresh me-1"></i>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {dashboardError && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Dashboard Error:</strong> {dashboardError}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={loadDashboardData}
              disabled={dashboardLoading}
            >
              {dashboardLoading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Retry"
              )}
            </Button>
          </div>
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header d-flex justify-content-between align-items-start">
            <div>
              <h1 className="mb-2">
                🔧{" "}
                {user?.role === "customer"
                  ? "Customer Portal"
                  : "Auto Repair Shop Management"}
              </h1>
              <p className="text-muted">
                Welcome back, <strong>{user?.firstName || user?.email}</strong>{" "}
                | Role:{" "}
                <span className="badge bg-primary ms-1">{user?.role}</span>
                {dashboardData && (
                  <span className="ms-2">
                    | Last updated:{" "}
                    {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={loadDashboardData}
              disabled={
                dashboardLoading || appointmentsLoading || repairsLoading
              }
              className="ms-3"
            >
              {dashboardLoading || appointmentsLoading || repairsLoading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Refreshing...
                </>
              ) : (
                <>🔄 Refresh Data</>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Dashboard Stats */}
      <Row className="mb-4">
        {getDashboardStats().map((stat, index) => (
          <Col md={6} lg={3} key={index} className="mb-3">
            <Card className={`h-100 border-${stat.color} shadow-sm`}>
              <Card.Body className="text-center">
                <div style={{ fontSize: "2.5rem" }} className="mb-2">
                  {stat.icon}
                </div>
                <h3 className={`text-${stat.color} mb-1`}>{stat.value}</h3>
                <p className="text-muted mb-0">{stat.title}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">⚡ Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {getRoleBasedActions().map((action, index) => (
                  <Col md={6} lg={3} key={index} className="mb-3">
                    <div className="d-grid">
                      <Button
                        variant={action.variant}
                        size="lg"
                        onClick={action.action}
                        className="quick-action-btn h-100"
                      >
                        <div className="text-center py-2">
                          <div style={{ fontSize: "2rem" }} className="mb-2">
                            {action.icon}
                          </div>
                          <div className="fw-bold mb-1">{action.title}</div>
                          <small className="d-block">
                            {action.description}
                          </small>
                        </div>
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role-specific content */}
      {user?.role !== "customer" && (
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">📅 Today's Schedule</h5>
              </Card.Header>
              <Card.Body>
                {appointmentsLoading ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading appointments...</p>
                  </div>
                ) : todaysAppointments.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    <p className="mb-0">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <>
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="mb-3">
                        <strong>
                          {formatAppointmentTime(appointment)} -{" "}
                          {appointment.serviceType ||
                            appointment.description ||
                            "Service Appointment"}
                        </strong>
                        <br />
                        <small className="text-muted">
                          {appointment.customer?.name || "Customer"} -{" "}
                          {appointment.vehicle
                            ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
                            : `Vehicle ID: ${appointment.vehicleId}`}
                        </small>
                        {appointment.status && (
                          <>
                            <br />
                            <span
                              className={`badge ${
                                appointment.status === "completed"
                                  ? "bg-success"
                                  : appointment.status === "in_progress"
                                  ? "bg-warning"
                                  : appointment.status === "cancelled"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              } ms-0`}
                              style={{ fontSize: "0.7em" }}
                            >
                              {appointment.status.replace("_", " ")}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100 mt-2"
                >
                  View Full Schedule
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">🔧 Active Repairs</h5>
              </Card.Header>
              <Card.Body>
                {repairsLoading ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading repairs...</p>
                  </div>
                ) : activeRepairs.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-muted mb-3">
                      <i className="fas fa-tools fa-2x"></i>
                    </div>
                    <p className="mb-2 text-muted">No active repairs at this time</p>
                    <small className="text-muted d-block mb-3">
                      Repair orders will appear here when work is in progress
                    </small>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowRepairOrderModal(true)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Create First Repair Order
                    </Button>
                  </div>
                ) : (
                  <>
                    {activeRepairs.map((repair: RepairOrder, index) => {
                      const progress = getRepairProgress(repair);

                      // Helper function to safely get vehicle info
                      const getVehicleInfo = (repair: RepairOrder) => {
                        // Try different possible field structures
                        const vehicle = repair.vehicle;
                        if (vehicle && typeof vehicle === 'object') {
                          const v = vehicle as { year?: string | number; model_year?: string | number; make?: string; model?: string };
                          const year = v.year ?? v.model_year ?? '';
                          const make = v.make ?? '';
                          const model = v.model ?? '';
                          return `${year} ${make} ${model}`.trim();
                        }
                        return "Unknown Vehicle";
                      };

                      // Helper function to safely get description
                      const getDescription = (repair: RepairOrder) => {
                        if (repair.description) return repair.description;
                        if (repair.notes) return repair.notes;
                        if (repair.customerComplaints) return repair.customerComplaints;
                        return "No description available";
                      };

                      return (
                        <div key={repair.id || index} className="mb-3">
                          <strong>{getDescription(repair)}</strong>
                          <br />
                          <small className="text-muted">
                            {getVehicleInfo(repair)} - {progress}% Complete
                          </small>
                          <div
                            className="progress mt-1"
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          {repair.orderNumber && (
                            <small className="text-muted d-block mt-1">
                              Order #{repair.orderNumber}
                            </small>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="w-100 mt-2"
                >
                  View All Repairs
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Customer-specific content */}
      {user?.role === "customer" && (
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">🚗 My Vehicles</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>2020 Toyota Camry</strong>
                  <br />
                  <small className="text-muted">
                    Last Service: Oil Change - Jan 15, 2024
                  </small>
                </div>
                <div className="mb-3">
                  <strong>2018 Honda CR-V</strong>
                  <br />
                  <small className="text-muted">
                    Last Service: Brake Inspection - Dec 8, 2023
                  </small>
                </div>
                <Button variant="outline-info" size="sm" className="w-100">
                  Manage Vehicles
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">📋 Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Appointment Scheduled</strong>
                  <br />
                  <small className="text-muted">
                    Oil Change - Jan 25, 2024 at 10:00 AM
                  </small>
                </div>
                <div className="mb-3">
                  <strong>Service Completed</strong>
                  <br />
                  <small className="text-muted">
                    Brake Inspection - Toyota Camry
                  </small>
                </div>
                <Button variant="outline-success" size="sm" className="w-100">
                  View History
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: "30px" }}>
        <Tabs defaultActiveKey="system" id="dashboard-tabs" className="mb-4">
          <Tab eventKey="system" title="🏪 Shop System">
            <Card>
              <Card.Body>
                <h4>Auto Repair Shop Management System</h4>
                <p>
                  This system helps manage all aspects of your auto repair
                  business:
                </p>
                <Row>
                  <Col md={4}>
                    <h6>👥 Customer Management</h6>
                    <ul>
                      <li>Customer profiles</li>
                      <li>Vehicle history</li>
                      <li>Service records</li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <h6>� Service Operations</h6>
                    <ul>
                      <li>Appointment scheduling</li>
                      <li>Repair order tracking</li>
                      <li>Parts inventory</li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <h6>📊 Business Intelligence</h6>
                    <ul>
                      <li>Financial reports</li>
                      <li>Customer analytics</li>
                      <li>Inventory reports</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={() => handleSuccess("Customer")}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={() => handleSuccess("Vehicle")}
      />

      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        onSuccess={() => handleSuccess("Appointment")}
      />

      <AddRepairOrderModal
        show={showRepairOrderModal}
        onHide={() => setShowRepairOrderModal(false)}
        onSuccess={() => handleSuccess("Repair Order")}
      />

      <AddVehicleProblemModal
        show={showProblemModal}
        onHide={() => setShowProblemModal(false)}
        onSuccess={() => handleSuccess("Problem Report")}
      />
    </div>
  );
};

export default AutoRepairDashboard;
