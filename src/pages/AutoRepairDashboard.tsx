import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useAutoRepairs } from "../hooks/useAutoRepairs";
import {
  AddCustomerModal,
  AddVehicleModal,
  AddAppointmentModal,
  AddRepairOrderModal,
  AddVehicleProblemModal,
} from "../components/modals";
import type { DashboardSummary } from "../types/dashboard";
import type { Appointment } from "../types/appointments";
import type { RepairOrder } from "../types/repairOrders";

export const AutoRepairDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    repairOrders,
    customers,
    vehicles,
    loading,
    error,
    loadAppointments,
    loadRepairOrders,
    loadCustomers,
    loadVehicles,
    todaysRevenue,
    loadTodaysRevenue,
    clearError,
    clearAppointments,
  } = useAutoRepairs();

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dashboard data state (only for dashboard-specific stats)
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Load dashboard data on component mount
  useEffect(() => {
    if (user?.role) {
      const initializeData = async () => {
        await loadAllEntityData();
      };
      initializeData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.id, loadAppointments, loadRepairOrders, loadCustomers, loadVehicles]);

  // Calculate dashboard stats from Redux state instead of bypassing Redux
  const calculateDashboardStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (user?.role === "customer") {
      // Customer stats calculated from Redux state
      const customerTotalSpent = repairOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        role: "customer" as const,
        stats: {
          customerVehicles: vehicles.length,
          customerActiveAppointments: appointments.length,
          customerRepairOrders: repairOrders.length,
          customerTotalSpent,
          todaysAppointments: 0,
          activeRepairs: 0,
          totalCustomers: 0,
          todaysRevenue: 0,
          monthlyAppointments: 0,
          monthlyRevenue: 0,
          monthlyNewCustomers: 0
        },
        lastUpdated: new Date().toISOString()
      };
    } else {
      // Employee/Owner stats calculated from Redux state
      console.log(`🔍 Dashboard calculation - Today: ${today}`);
      console.log(`📋 Total appointments in Redux: ${appointments.length}`);
      console.log(`📋 Appointments data:`, appointments.map(apt => ({
        id: apt.id,
        scheduledDate: apt.scheduledDate,
        status: apt.status,
        date: apt.date
      })));
      
      const todaysAppointments = appointments.filter(apt => 
        apt.scheduledDate === today
      ).length;
      
      console.log(`📊 Today's appointments count: ${todaysAppointments}`);
      
      // Use server-calculated today's revenue from Redux instead of client-side calculation
      const revenueToday = todaysRevenue || 0;
      console.log(`📊 Dashboard stats: todaysRevenue from Redux = ${todaysRevenue}, revenueToday = ${revenueToday}`);

      // Calculate monthly stats
      const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const monthlyAppointments = appointments.filter(apt => 
        apt.scheduledDate?.startsWith(thisMonth)  // ✅ Remove status filter - count ALL appointments scheduled this month
      ).length;
      
      const monthlyRevenue = repairOrders
        .filter(order => 
          order.completedAt?.startsWith(thisMonth) || 
          (order.status === 'completed' && order.updatedAt?.startsWith(thisMonth))
        )
        .reduce((sum, order) => sum + (order.total || 0), 0);
        
      const monthlyNewCustomers = customers.filter(customer => 
        customer.createdAt?.startsWith(thisMonth)
      ).length;
      
      return {
        role: (user?.role || "employee") as "employee" | "owner",
        stats: {
          todaysAppointments,
          activeRepairs: repairOrders.length, // These are already filtered for active status
          totalCustomers: customers.length,
          todaysRevenue: revenueToday, // Use server-calculated value
          monthlyAppointments,
          monthlyRevenue,
          monthlyNewCustomers,
          customerVehicles: 0,
          customerActiveAppointments: 0,
          customerRepairOrders: 0,
          customerTotalSpent: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }, [user, appointments, repairOrders, vehicles, customers, todaysRevenue]);

  // Update dashboard data when Redux state changes
  const loadDashboardData = useCallback(() => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      
      const calculatedData = calculateDashboardStats();
      setDashboardData(calculatedData);
    } catch (error) {
      console.error("Error calculating dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate dashboard data";
      setDashboardError(errorMessage);
    } finally {
      setDashboardLoading(false);
    }
  }, [calculateDashboardStats]);

  // Update dashboard stats when Redux state changes
  useEffect(() => {
    if (user?.role && (appointments.length > 0 || repairOrders.length > 0 || customers.length > 0 || vehicles.length > 0)) {
      loadDashboardData();
    }
  }, [user?.role, appointments, repairOrders, customers, vehicles, loadDashboardData]);

  const loadAllEntityData = async () => {
    try {
      // Clear any previous errors
      clearError('appointments');
      clearError('repairOrders');
      clearError('customers');
      clearError('vehicles');

      if (user?.role !== "customer") {
        // For employees and owners, load all data
        const today = new Date().toISOString().split('T')[0];
        
        // Clear appointments to ensure fresh today's data
        clearAppointments();
        
        // Load today's appointments
        await loadAppointments({ 
          date_from: today,
          date_to: today
        });

        // Load active repair orders
        await loadRepairOrders({ 
          status: 'in_progress'
        });

        // Load basic customer and vehicle data for context
        await loadCustomers();
        await loadVehicles();
        
        // Load today's revenue from server-side calculation
        console.log('🔄 Dashboard loading today\'s revenue...');
        await loadTodaysRevenue();
      } else {
        // For customers, load their specific data
        await loadAppointments({ 
          customer_id: user.id
        });
        await loadRepairOrders({ 
          customer_id: user.id
        });
        await loadVehicles({ 
          customer_id: user.id
        });
      }
    } catch (error: unknown) {
      console.error("Error loading entity data:", error);
    }
  };

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

  const handleSuccess = (entityType: string) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
    // Refresh relevant data based on entity type
    switch (entityType.toLowerCase()) {
      case 'customer':
        loadCustomers();
        break;
      case 'vehicle':
        loadVehicles();
        break;
      case 'appointment':
        // Maintain proper filters based on user role
        if (user?.role !== "customer") {
          // For employees and owners, reload today's appointments
          const today = new Date().toISOString().split('T')[0];
          clearAppointments(); // Clear before loading filtered data
          loadAppointments({ 
            date_from: today,
            date_to: today
          });
        } else {
          // For customers, reload their appointments
          clearAppointments(); // Clear before loading customer data
          loadAppointments({ 
            customer_id: user.id
          });
        }
        break;
      case 'repair order':
        // Maintain proper filters for repair orders too
        if (user?.role !== "customer") {
          loadRepairOrders({ 
            status: 'in_progress'
          });
        } else {
          loadRepairOrders({ 
            customer_id: user.id
          });
        }
        break;
    }
    
    // Only refresh dashboard stats occasionally, not after every entity creation
    // The main stats come from Redux state anyway
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
          value: vehicles.length.toString(),
          icon: "🚗",
          color: "primary",
        },
        {
          title: "Active Appointments",
          value: appointments.length.toString(),
          icon: "📅",
          color: "info",
        },
        {
          title: "Repair Orders",
          value: repairOrders.length.toString(),
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
          value: appointments.length.toString(),
          icon: "📅",
          color: "primary",
        },
        {
          title: "Active Repairs",
          value: repairOrders.length.toString(),
          icon: "🔧",
          color: "warning",
        },
        {
          title: "Total Customers",
          value: customers.length.toString(),
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
              onClick={() => {
                loadDashboardData();
                loadAllEntityData();
              }}
              disabled={
                dashboardLoading || loading.appointments || loading.repairOrders
              }
              className="ms-3"
            >
              {dashboardLoading || loading.appointments || loading.repairOrders ? (
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
                {loading.appointments ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading appointments...</p>
                  </div>
                ) : error.appointments ? (
                  <div className="text-center py-3 text-danger">
                    <p className="mb-0">Error: {error.appointments}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => {
                        if (user?.role !== "customer") {
                          const today = new Date().toISOString().split('T')[0];
                          clearAppointments(); // Clear before loading filtered data
                          loadAppointments({ 
                            date_from: today,
                            date_to: today
                          });
                        } else {
                          clearAppointments(); // Clear before loading customer data
                          loadAppointments({ 
                            customer_id: user.id
                          });
                        }
                      }}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    <p className="mb-0">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <>
                    {appointments.slice(0, 5).map((appointment) => (
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
                                  : appointment.status === "pending"
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
                {loading.repairOrders ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading repairs...</p>
                  </div>
                ) : error.repairOrders ? (
                  <div className="text-center py-3 text-danger">
                    <p className="mb-0">Error: {error.repairOrders}</p>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      onClick={() => loadRepairOrders()}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : repairOrders.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    <p className="mb-0">No active repairs at this time</p>
                  </div>
                ) : (
                  <>
                    {repairOrders.slice(0, 5).map((repair, index) => {
                      const progress = getRepairProgress(repair);

                      // Helper function to safely get vehicle info
                      const getVehicleInfo = (repair: RepairOrder) => {
                        // Try different possible field structures
                        const vehicle = repair.vehicle;
                        if (vehicle) {
                          const year = vehicle.year;
                          const make = vehicle.make;
                          const model = vehicle.model;

                          if (year && make && model) {
                            return `${year} ${make} ${model}`;
                          }
                          if (make && model) {
                            return `${make} ${model}`;
                          }
                          if (vehicle.licensePlate) {
                            return `Vehicle: ${vehicle.licensePlate}`;
                          }
                        }
                        return `Vehicle ID: ${repair.vehicleId || repair.id}`;
                      };

                      // Helper function to safely get description
                      const getDescription = (repair: RepairOrder) => {
                        // Try different possible field names that might contain description
                        return (
                          repair.description ||
                          repair.notes ||
                          repair.diagnosis ||
                          (repair.orderNumber
                            ? `Repair Order #${repair.orderNumber}`
                            : null) ||
                          (repair.id ? `Repair Order #${repair.id}` : null) ||
                          "Repair Service"
                        );
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
                          {(repair.orderNumber || repair.order_number) && (
                            <small className="text-muted d-block mt-1">
                              Order #{repair.orderNumber || repair.order_number}
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
                {loading.vehicles ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading vehicles...</p>
                  </div>
                ) : error.vehicles ? (
                  <div className="text-center py-3 text-danger">
                    <p className="mb-0">Error: {error.vehicles}</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    <p className="mb-0">No vehicles registered</p>
                  </div>
                ) : (
                  <>
                    {vehicles.slice(0, 3).map((vehicle) => (
                      <div key={vehicle.id} className="mb-3">
                        <strong>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </strong>
                        <br />
                        <small className="text-muted">
                          License: {vehicle.licensePlate || 'N/A'}
                        </small>
                      </div>
                    ))}
                  </>
                )}
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
                {loading.appointments || loading.repairOrders ? (
                  <div className="text-center py-3">
                    <Spinner size="sm" animation="border" />
                    <p className="mt-2 mb-0">Loading activity...</p>
                  </div>
                ) : (
                  <>
                    {appointments.slice(0, 2).map((appointment) => (
                      <div key={appointment.id} className="mb-3">
                        <strong>Appointment Scheduled</strong>
                        <br />
                        <small className="text-muted">
                          {appointment.serviceType || appointment.description} - {formatAppointmentTime(appointment)}
                        </small>
                      </div>
                    ))}
                    {repairOrders.slice(0, 2).map((repair) => (
                      <div key={repair.id} className="mb-3">
                        <strong>Service {repair.status === 'completed' ? 'Completed' : 'In Progress'}</strong>
                        <br />
                        <small className="text-muted">
                          {repair.description || 'Repair Service'}
                        </small>
                      </div>
                    ))}
                    {appointments.length === 0 && repairOrders.length === 0 && (
                      <div className="text-center py-3 text-muted">
                        <p className="mb-0">No recent activity</p>
                      </div>
                    )}
                  </>
                )}
                <Button variant="outline-success" size="sm" className="w-100">
                  View History
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

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
