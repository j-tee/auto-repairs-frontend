import React, { useState } from "react";
import { Row, Col, Card, Button, Alert, Tab, Tabs } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { AutoRepairsDashboard } from "../components";
import { RebuildDashboard } from "../components/RebuildDashboard";
import {
  AddCustomerModal,
  AddVehicleModal,
  AddRepairOrderModal,
  AddVehicleProblemModal,
} from "../components/modals";

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

  const handleSuccess = (entityType: string, _data: any) => {
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
    // Mock data - in real app, these would come from API
    if (user?.role === "customer") {
      return [
        { title: "My Vehicles", value: "2", icon: "🚗", color: "primary" },
        { title: "Active Appointments", value: "1", icon: "📅", color: "info" },
        { title: "Repair Orders", value: "0", icon: "📋", color: "warning" },
        { title: "Total Spent", value: "$1,250", icon: "💰", color: "success" },
      ];
    }

    if (user?.role === "employee" || user?.role === "owner") {
      return [
        {
          title: "Today's Appointments",
          value: "8",
          icon: "📅",
          color: "primary",
        },
        { title: "Active Repairs", value: "12", icon: "🔧", color: "warning" },
        { title: "Customers", value: "156", icon: "👥", color: "info" },
        {
          title: "Revenue Today",
          value: "$3,450",
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

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h1 className="mb-2">
              🔧{" "}
              {user?.role === "customer"
                ? "Customer Portal"
                : "Auto Repair Shop Management"}
            </h1>
            <p className="text-muted">
              Welcome back, <strong>{user?.firstName || user?.email}</strong> |
              Role: <span className="badge bg-primary ms-1">{user?.role}</span>
            </p>
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
                <div className="mb-3">
                  <strong>9:00 AM - Oil Change</strong>
                  <br />
                  <small className="text-muted">John Doe - Toyota Camry</small>
                </div>
                <div className="mb-3">
                  <strong>11:30 AM - Brake Inspection</strong>
                  <br />
                  <small className="text-muted">Jane Smith - Honda Civic</small>
                </div>
                <div className="mb-3">
                  <strong>2:00 PM - Engine Diagnostic</strong>
                  <br />
                  <small className="text-muted">
                    Mike Johnson - Ford F-150
                  </small>
                </div>
                <Button variant="outline-primary" size="sm" className="w-100">
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
                <div className="mb-3">
                  <strong>Transmission Repair</strong>
                  <br />
                  <small className="text-muted">BMW X5 - 60% Complete</small>
                  <div className="progress mt-1" style={{ height: "5px" }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Engine Overhaul</strong>
                  <br />
                  <small className="text-muted">
                    Chevy Silverado - 25% Complete
                  </small>
                  <div className="progress mt-1" style={{ height: "5px" }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>
                <Button variant="outline-warning" size="sm" className="w-100">
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
                      <li>Vehicle registration</li>
                      <li>Service history</li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <h6>📅 Operations</h6>
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

          <Tab eventKey="legacy" title="🔄 Legacy Dashboard">
            <RebuildDashboard />
          </Tab>

          <Tab eventKey="original" title="📊 Original Components">
            <h2>🏪 Auto Repairs Management System</h2>

            {/* Auto Repairs Dashboard Component */}
            <AutoRepairsDashboard />
          </Tab>
        </Tabs>
      </div>

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={(data: any) => handleSuccess("Customer", data)}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={(data: any) => handleSuccess("Vehicle", data)}
      />

      {/* TODO: AddAppointmentModal needs to be implemented */}
      {/*
      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        onSuccess={(data: any) => handleSuccess("Appointment", data)}
      />
      */}

      <AddRepairOrderModal
        show={showRepairOrderModal}
        onHide={() => setShowRepairOrderModal(false)}
        onSuccess={(data: any) => handleSuccess("Repair Order", data)}
      />

      <AddVehicleProblemModal
        show={showProblemModal}
        onHide={() => setShowProblemModal(false)}
        onSuccess={(data: any) => handleSuccess("Problem Report", data)}
      />
    </div>
  );
};

export default AutoRepairDashboard;
