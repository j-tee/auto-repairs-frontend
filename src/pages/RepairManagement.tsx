import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useAutoRepairs } from "../hooks/useAutoRepairs";

export const RepairManagement: React.FC = () => {
  const {
    repairOrders,
    appointments,
    vehicles,
    customers,
    loading,
    error,
    loadRepairOrders,
    loadAppointments,
    loadVehicles,
    loadCustomers,
  } = useAutoRepairs();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setSuccessMessage(null);

      console.log("RepairManagement component mounting...");
      console.log("Auth token:", localStorage.getItem("auth_token"));
      console.log("User data:", localStorage.getItem("user_data"));

      // Use Redux slice actions to load data
      await Promise.all([
        loadRepairOrders(),
        loadAppointments(),
        loadVehicles(),
        loadCustomers(),
      ]);

      console.log("RepairManagement data loaded via Redux");
    } catch (err: any) {
      console.error("Error loading data:", err);
    }
  };

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getCustomerInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return "Unknown Customer";
    const customer = customers.find((c: any) => c.id === vehicle.customerId);
    if (!customer) return "Unknown Customer";

    // Customer has a single 'name' field according to Django model
    return customer.name || "Unknown Customer";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "in-progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (
    loading.repairOrders ||
    loading.appointments ||
    loading.vehicles ||
    loading.customers
  ) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading repair data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {(error.repairOrders ||
        error.appointments ||
        error.vehicles ||
        error.customers) && (
        <Alert variant="danger" dismissible>
          {error.repairOrders ||
            error.appointments ||
            error.vehicles ||
            error.customers}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">🔧 Repair Management</h1>
          <p className="text-muted">Manage repair orders and appointments</p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="repair-orders" className="mb-4">
        <Tab eventKey="repair-orders" title="Repair Orders">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Repair Orders</h5>
              <Button
                variant="primary"
                onClick={() => setShowRepairOrderModal(true)}
                size="sm"
              >
                + New Repair Order
              </Button>
            </Card.Header>
            <Card.Body>
              {repairOrders.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No repair orders found
                </p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Estimated Cost</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td>{order.workOrderNumber}</td>
                        <td>{getVehicleInfo(order.vehicleId)}</td>
                        <td>{getCustomerInfo(order.vehicleId)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>${order.estimatedCost?.toFixed(2) || "0.00"}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="Appointments">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Appointments</h5>
              <Button
                variant="primary"
                onClick={() => setShowAppointmentModal(true)}
                size="sm"
              >
                + New Appointment
              </Button>
            </Card.Header>
            <Card.Body>
              {appointments.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No appointments scheduled
                </p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Service Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment: any) => (
                      <tr key={appointment.id}>
                        <td>
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleString()}
                        </td>
                        <td>{getVehicleInfo(appointment.vehicleId)}</td>
                        <td>{getCustomerInfo(appointment.vehicleId)}</td>
                        <td>{appointment.serviceType || "General Service"}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="dashboard" title="Dashboard">
          <Row>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{repairOrders.length}</h3>
                  <p className="mb-0">Active Repair Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">{appointments.length}</h3>
                  <p className="mb-0">Scheduled Appointments</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{vehicles.length}</h3>
                  <p className="mb-0">Total Vehicles</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{customers.length}</h3>
                  <p className="mb-0">Total Customers</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Add modals here when needed */}
    </Container>
  );
};
