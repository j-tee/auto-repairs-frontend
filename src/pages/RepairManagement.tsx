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
import { useAuth } from "../hooks/useAuth";
import type {
  RepairOrder,
  Appointment,
  Service,
  Vehicle,
  Customer,
} from "../types/entities";
import { apiGet } from "../utils/api";

export const RepairManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for data
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modal states
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("RepairManagement component mounting...");
      console.log("Auth token:", localStorage.getItem("auth_token"));
      console.log("User data:", localStorage.getItem("user_data"));

      const [
        repairOrdersResponse,
        appointmentsResponse,
        servicesResponse,
        vehiclesResponse,
        customersResponse,
      ] = await Promise.all([
        apiGet<RepairOrder[]>("/shop/repair-orders/"),
        apiGet<Appointment[]>("/shop/appointments/"),
        apiGet<Service[]>("/shop/services/"),
        apiGet<Vehicle[]>("/shop/vehicles/"),
        apiGet<Customer[]>("/shop/customers/"),
      ]);

      console.log("RepairManagement API responses:", {
        repairOrders: repairOrdersResponse.length,
        appointments: appointmentsResponse.length,
        services: servicesResponse.length,
        vehicles: vehiclesResponse.length,
        customers: customersResponse.length,
      });

      // 🔍 Debug actual data structure
      console.log("Sample appointment:", appointmentsResponse[0]);
      console.log("Sample vehicle:", vehiclesResponse[0]);
      console.log("Sample service:", servicesResponse[0]);
      console.log(
        "All services IDs:",
        servicesResponse.map((s: any) => s.id)
      );

      setRepairOrders(repairOrdersResponse);
      setAppointments(appointmentsResponse);
      setServices(servicesResponse);
      setVehicles(vehiclesResponse);
      setCustomers(customersResponse);
    } catch (err) {
      console.error("RepairManagement loadData error:", err);
      setError(
        `Failed to load data: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (entityType: string, _data: any) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    loadData(); // Refresh data
  };

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getCustomerInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return "Unknown Customer";
    // ✅ Use backend-provided customer_name directly
    return vehicle.customer_name || "Unknown Customer";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
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

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">🔧 Repair Management</h1>
          <p className="text-muted">Manage repair orders and appointments</p>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning mb-1">
                {
                  repairOrders.filter((order) => order.status === "pending")
                    .length
                }
              </h3>
              <Card.Text>Pending Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary mb-1">
                {
                  repairOrders.filter((order) => order.status === "in_progress")
                    .length
                }
              </h3>
              <Card.Text>In Progress</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info mb-1">
                {appointments.filter((apt) => apt.status === "pending").length}
              </h3>
              <Card.Text>Pending</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success mb-1">0</h3>
              <Card.Text>Available Services</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="repair-orders" className="mb-3">
        <Tab eventKey="repair-orders" title="🔧 Repair Orders">
          <Card>
            <Card.Body>
              {repairOrders.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No repair orders yet</h5>
                  <p className="text-muted">
                    Create your first repair order to get started.
                  </p>
                  <Button
                    variant="success"
                    onClick={() => setShowRepairOrderModal(true)}
                  >
                    Create First Repair Order
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>
                        <td>{getCustomerInfo(order.vehicle)}</td>
                        <td>{getVehicleInfo(order.vehicle)}</td>
                        <td>
                          <strong>
                            $
                            {order.total_cost
                              ? parseFloat(order.total_cost).toFixed(2)
                              : "0.00"}
                          </strong>
                        </td>
                        <td>
                          <Badge
                            bg={getStatusBadgeVariant(
                              order.status || "pending"
                            )}
                          >
                            {order.status
                              ? order.status.replace("_", " ").toUpperCase()
                              : "PENDING"}
                          </Badge>
                        </td>
                        <td>
                          {order.created_date
                            ? new Date(order.created_date).toLocaleDateString()
                            : order.date_created
                            ? new Date(order.date_created).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                          >
                            👁️
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            🗑️
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="ms-1"
                          >
                            ✓
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

        <Tab eventKey="appointments" title="📅 Appointments">
          <Card>
            <Card.Body>
              {appointments.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No appointments scheduled</h5>
                  <p className="text-muted">
                    Schedule the first appointment to get started.
                  </p>
                  <Button
                    variant="success"
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <div>
                            <strong>
                              {new Date(appointment.date).toLocaleDateString()}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {appointment.time || "Time TBD"}
                            </small>
                          </div>
                        </td>
                        <td>{getCustomerInfo(appointment.vehicle)}</td>
                        <td>{getVehicleInfo(appointment.vehicle)}</td>
                        <td>
                          {services.find((s) => s.id === appointment.service)
                            ?.name || "Unknown Service"}
                        </td>
                        <td>
                          <Badge
                            bg={getStatusBadgeVariant(
                              appointment.status || "pending"
                            )}
                          >
                            {appointment.status
                              ? appointment.status
                                  .replace("_", " ")
                                  .toUpperCase()
                              : "PENDING"}
                          </Badge>
                        </td>
                        <td>{appointment.notes || "No notes"}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                          >
                            👁️
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            🗑️
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="ms-1"
                          >
                            ✓
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
      </Tabs>
    </Container>
  );
};
