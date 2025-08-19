import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import {
  CounterComponent,
  AutoRepairsDashboard,
  AxiosQueryDemo,
} from "../components";
import {
  AddCustomerModal,
  AddVehicleModal,
  AddAppointmentModal,
  AddRepairOrderModal,
  AddVehicleProblemModal,
} from "../components/modals";

export const DashboardPage: React.FC = () => {
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

  const getRoleBasedActions = () => {
    const commonActions = [
      {
        title: "New Customer",
        icon: "👤",
        action: () => setShowCustomerModal(true),
        variant: "success" as const,
        description: "Register a new customer",
      },
      {
        title: "Add Vehicle",
        icon: "🚗",
        action: () => setShowVehicleModal(true),
        variant: "info" as const,
        description: "Register customer vehicle",
      },
    ];

    if (user?.role === "customer") {
      return [
        {
          title: "Report Problem",
          icon: "⚠️",
          action: () => setShowProblemModal(true),
          variant: "warning" as const,
          description: "Report vehicle issue",
        },
        {
          title: "Book Appointment",
          icon: "📅",
          action: () => setShowAppointmentModal(true),
          variant: "primary" as const,
          description: "Schedule service",
        },
      ];
    }

    if (
      user?.role === "mechanic" ||
      user?.role === "manager" ||
      user?.role === "admin"
    ) {
      return [
        ...commonActions,
        {
          title: "Schedule Service",
          icon: "📅",
          action: () => setShowAppointmentModal(true),
          variant: "primary" as const,
          description: "Book appointment",
        },
        {
          title: "Create Repair Order",
          icon: "📋",
          action: () => setShowRepairOrderModal(true),
          variant: "danger" as const,
          description: "Comprehensive repair",
        },
      ];
    }

    return commonActions;
  };

  return (
    <Container fluid className="dashboard-content py-4">
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h1 className="mb-2">
              🔧 Welcome back, {user?.firstName || user?.email}!
            </h1>
            <p className="text-muted">
              Role: <span className="badge bg-primary">{user?.role}</span>
            </p>
          </div>
        </Col>
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
                        className="quick-action-btn"
                      >
                        <div className="text-center">
                          <div style={{ fontSize: "2rem" }}>{action.icon}</div>
                          <div className="fw-bold">{action.title}</div>
                          <small>{action.description}</small>
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

      <div style={{ marginTop: "30px" }}>
        <h2>🏪 Auto Repairs Management System</h2>

        {/* Axios + Query String Demo */}
        <AxiosQueryDemo />

        {/* Redux Counter Component */}
        <CounterComponent />

        {/* Auto Repairs Dashboard Component */}
        <AutoRepairsDashboard />
      </div>

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={(data) => handleSuccess("Customer", data)}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={(data) => handleSuccess("Vehicle", data)}
      />

      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        onSuccess={(data) => handleSuccess("Appointment", data)}
      />

      <AddRepairOrderModal
        show={showRepairOrderModal}
        onHide={() => setShowRepairOrderModal(false)}
        onSuccess={(data) => handleSuccess("Repair Order", data)}
      />

      <AddVehicleProblemModal
        show={showProblemModal}
        onHide={() => setShowProblemModal(false)}
        onSuccess={(data) => handleSuccess("Problem Report", data)}
      />
    </Container>
  );
};

export default DashboardPage;
