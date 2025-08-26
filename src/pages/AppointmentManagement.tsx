import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
  Table,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import {
  appointmentMngtService,
  type Appointment,
} from "../services/appointmentMngtService";
import { customerMngtService } from "../services/customerMngtService";
import { vehicleMngtService } from "../services/vehicleMngtService";

export const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentMngtService.getAppointments({
        limit: 50,
        search: searchTerm || undefined,
      });

      console.log("Loaded appointments:", response.appointments);

      // Fetch customer and vehicle details for each appointment
      const appointmentsWithDetails = await Promise.all(
        response.appointments.map(async (appointment) => {
          try {
            // Fetch customer details if customerId exists
            let customer = appointment.customer;
            if (!customer && appointment.customerId) {
              try {
                customer = await customerMngtService.getCustomerById(
                  appointment.customerId
                );
                console.log(
                  `Fetched customer ${appointment.customerId}:`,
                  customer
                );
              } catch (customerErr) {
                console.warn(
                  `Failed to fetch customer ${appointment.customerId}:`,
                  customerErr
                );
              }
            }

            // Fetch vehicle details if vehicleId exists
            let vehicle = appointment.vehicle;
            if (!vehicle && appointment.vehicleId) {
              try {
                vehicle = await vehicleMngtService.getVehicleById(
                  appointment.vehicleId
                );
                console.log(
                  `Fetched vehicle ${appointment.vehicleId}:`,
                  vehicle
                );
              } catch (vehicleErr) {
                console.warn(
                  `Failed to fetch vehicle ${appointment.vehicleId}:`,
                  vehicleErr
                );
              }
            }

            return {
              ...appointment,
              customer,
              vehicle,
            };
          } catch (detailErr) {
            console.warn(
              `Failed to fetch details for appointment ${appointment.id}:`,
              detailErr
            );
            return appointment;
          }
        })
      );

      setAppointments(appointmentsWithDetails);
      console.log("Appointments with details:", appointmentsWithDetails);
    } catch (err: any) {
      console.error("Error loading appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Reload when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAppointments();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "cancelled":
        return "danger";
      case "in_progress":
        return "primary";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading appointments...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Appointment Management
              </h4>
              <Badge bg="info" pill>
                {appointments.length} Total
              </Badge>
            </Card.Header>
            <Card.Body>
              {/* Success/Error Messages */}
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
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {/* Search Bar */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="text-end">
                  <Button variant="primary" onClick={loadAppointments}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </Button>
                </Col>
              </Row>

              {/* Appointments Table */}
              {appointments.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                  <h5>No appointments found</h5>
                  <p className="mb-0">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "No appointments have been scheduled yet."}
                  </p>
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>{formatDate(appointment.scheduledDate)}</td>
                        <td>{formatTime(appointment.scheduledTime)}</td>
                        <td>
                          <div style={{ maxWidth: "200px" }}>
                            {appointment.description || "No description"}
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td>
                          {appointment.vehicle ? (
                            <div>
                              <strong>
                                {appointment.vehicle.make}{" "}
                                {appointment.vehicle.model}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {appointment.vehicle.year}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">
                              Vehicle ID: {appointment.vehicleId}
                            </span>
                          )}
                        </td>
                        <td>
                          {appointment.customer ? (
                            <div>
                              <strong>
                                {appointment.customer.name || "Name Missing"}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {appointment.customer.email}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">
                              Customer ID: {appointment.customerId}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                console.log("View appointment:", appointment.id)
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() =>
                                console.log("Edit appointment:", appointment.id)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Debug Information - Only in development */}
      {import.meta.env.DEV && (
        <Row className="mt-3">
          <Col>
            <Card bg="light">
              <Card.Header>
                <small>Debug Information</small>
              </Card.Header>
              <Card.Body>
                <small>
                  <strong>User:</strong> {user?.email} ({user?.role})<br />
                  <strong>Appointments loaded:</strong> {appointments.length}
                  <br />
                  <strong>Search term:</strong> "{searchTerm}"<br />
                  <strong>Loading:</strong> {loading ? "Yes" : "No"}
                  <br />
                  <strong>Error:</strong> {error || "None"}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};
