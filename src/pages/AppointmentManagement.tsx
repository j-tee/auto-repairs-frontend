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
import { useAutoRepairs } from "../hooks/useAutoRepairs";
import type { Appointment } from "../types/appointments";

export const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    loading,
    error,
    loadAppointments,
    clearError
  } = useAutoRepairs();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Don't automatically load all appointments to avoid interfering with dashboard filters
  // Appointments will be loaded on-demand via search/filter actions

  const handleSearch = async () => {
    try {
      await loadAppointments({
        searchTerm: searchTerm || undefined,
        limit: 50
      } as any);
    } catch (error: any) {
      console.error("Error searching appointments:", error);
    }
  };

  // Reload when search term changes  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Helper function to get customer phone number regardless of source
  const getCustomerPhone = (customer: any) => {
    return customer.phone_number || customer.phone || "N/A";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "info";
      case "confirmed":
        return "primary";
      case "cancelled":
        return "danger";
      case "no_show":
        return "warning";
      case "in_progress":
        return "info";
      case "pending":
        return "warning";
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

  if (loading.appointments) {
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
              {error.appointments && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => clearError('appointments')}
                >
                  {error.appointments}
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
                  <Button 
                    variant="outline-primary" 
                    onClick={handleSearch}
                    disabled={loading.appointments}
                  >
                    <i className="bi bi-search me-1"></i>
                    Search
                  </Button>
                </Col>
              </Row>

              {/* Appointments Table */}
              {appointments.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-calendar-x display-4 d-block mb-3"></i>
                  <h5>No appointments found</h5>
                  <p className="mb-0">
                    {searchTerm
                      ? "Try adjusting your search criteria."
                      : "No appointments have been scheduled yet."}
                  </p>
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <div>
                            <strong>{formatDate(appointment.scheduledDate || appointment.date)}</strong>
                            <br />
                            <small className="text-muted">
                              {formatTime(appointment.scheduledTime || "")}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>
                              {appointment.customer?.name || 
                               appointment.customer?.firstName + " " + appointment.customer?.lastName ||
                               "Unknown Customer"}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {appointment.customer?.email || "N/A"}
                              <br />
                              {getCustomerPhone(appointment.customer)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {appointment.vehicle ? (
                              <>
                                <strong>
                                  {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {appointment.vehicle.licensePlate || appointment.vehicle.license_plate || "No License"}
                                </small>
                              </>
                            ) : (
                              <span className="text-muted">No vehicle info</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {appointment.description || appointment.serviceType || "No description"}
                            {appointment.reportedProblem && (
                              <>
                                <br />
                                <small className="text-info">
                                  Problem: {appointment.reportedProblem.description}
                                </small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(appointment.status || "pending")}>
                            {appointment.status || "pending"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-primary">
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button size="sm" variant="outline-warning">
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button size="sm" variant="outline-danger">
                              <i className="bi bi-trash"></i>
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

      {/* Debug Information - Only in dev mode */}
      {process.env.NODE_ENV === "development" && (
        <Row className="mt-3">
          <Col>
            <Card>
              <Card.Header>
                <small>Debug Information</small>
              </Card.Header>
              <Card.Body>
                <small>
                  <strong>User Role:</strong> {user?.role || "N/A"}
                  <br />
                  <strong>Appointments Count:</strong> {appointments.length}
                  <br />
                  <strong>Search Term:</strong> {searchTerm || "None"}
                  <br />
                  <strong>Loading:</strong> {loading.appointments ? "Yes" : "No"}
                  <br />
                  <strong>Error:</strong> {error.appointments || "None"}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};
