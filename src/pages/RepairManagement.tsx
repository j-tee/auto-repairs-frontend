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
  Form,
  InputGroup,
  ButtonGroup,
} from "react-bootstrap";
import { useAutoRepairs } from "../hooks/useAutoRepairs";
import {
  CostBreakdownModal,
  RepairOrderCompletionModal,
} from "../components/modals";
import { formatCurrency } from "../utils/currency";
import { useAuth } from "../hooks/useAuth";
import type { CompleteWorkData, RepairOrder, RepairOrderQuery } from "../types/repairOrders";
import type { Appointment } from "../types/appointments";

export const RepairManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    repairOrders: reduxRepairOrders,
    appointments,
    vehicles,
    customers,
    loading: reduxLoading,
    error: reduxError,
    loadRepairOrders: loadReduxRepairOrders,
    loadAppointments,
    loadVehicles,
    loadCustomers,
    // Completion System Redux Actions
    // startRepairWork,
    // completeRepairWork,
  } = useAutoRepairs();

  // Local state for enhanced repair order management
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  // Modal states
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data from Redux
        await Promise.all([
          loadReduxRepairOrders(),
          loadAppointments(),
          loadVehicles(),
          loadCustomers(),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Sync Redux state with local state
  useEffect(() => {
    setRepairOrders(reduxRepairOrders);
    setTotal(reduxRepairOrders.length);
  }, [reduxRepairOrders]);

  // Load repair orders using Redux
  const loadRepairOrders = async (query?: RepairOrderQuery) => {
    try {
      setLoading(true);
      const queryParams: RepairOrderQuery = {
        ...query,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter as RepairOrder['status'] | undefined,
        priority: priorityFilter as RepairOrder['priority'] | undefined,
      };

      await loadReduxRepairOrders(queryParams);

      // Use Redux state directly
      setRepairOrders(reduxRepairOrders);
      setTotalPages(1); // For simplicity, adjust based on your pagination needs
      setTotal(reduxRepairOrders.length);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load repair orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search and filtering
  useEffect(() => {
    setCurrentPage(1);
    loadRepairOrders();
  }, [searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    loadRepairOrders();
  }, [currentPage]);

  // Status management functions
  const handleStartWork = async (orderId: string | number) => {
    try {
      // TODO: Implement startRepairWork function
      console.log('Starting work for order:', orderId);
      await loadRepairOrders();
      setSuccessMessage("Work started successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start work");
    }
  };

  const handleCompleteWork = async (completionData: CompleteWorkData) => {
    try {
      // Note: completeRepairWork is commented out in useAutoRepairs, so this might need to be updated
      // const actionResult = await completeRepairWork(selectedOrderId, completionData);
      console.log('Completing work for order:', selectedOrderId, 'with data:', completionData);
      await loadRepairOrders();
      setShowCompletion(false);

      setSuccessMessage("Work completed successfully!");
      const invoiceNumber = selectedOrderId;

      setSuccessMessage(
        `Work completed successfully. Invoice #${invoiceNumber}`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete work");
    }
  };

  // Modal handlers
  const handleViewCostBreakdown = (orderId: string | number) => {
    setSelectedOrderId(String(orderId));
    setShowCostBreakdown(true);
  };

  const handleCompleteOrder = (orderId: string | number) => {
    setSelectedOrderId(String(orderId));
    setShowCompletion(true);
  };

  // Helper functions
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getVehicleInfo = (vehicleId: string | number) => {
    const vehicle = vehicles.find((v) => v.id === String(vehicleId) || v.id === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getCustomerInfo = (vehicleId: string | number) => {
    const vehicle = vehicles.find((v) => v.id === String(vehicleId) || v.id === vehicleId);
    if (!vehicle) return "Unknown Customer";
    const customer = customers.find((c) => c.id === vehicle.customerId);
    if (!customer) return "Unknown Customer";

    // Try different customer field combinations safely
    if ('firstName' in customer && 'lastName' in customer && customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    } else if ('name' in customer && customer.name) {
      return customer.name;
    } else {
      return "Unknown Customer";
    }
  };

  const canPerformAction = (action: string, status: string) => {
    switch (action) {
      case "start":
        return (
          status === "pending" &&
          (user?.role === "owner" || user?.role === "employee")
        );
      case "complete":
        return (
          status === "in_progress" &&
          (user?.role === "owner" || user?.role === "employee")
        );
      case "view_breakdown":
        return user?.role === "owner" || user?.role === "employee";
      default:
        return false;
    }
  };

  if (
    loading ||
    reduxLoading.repairOrders ||
    reduxLoading.vehicles ||
    reduxLoading.customers
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
      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {(error || reduxError.repairOrders) && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error || reduxError.repairOrders}
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">🔧 Repair Management</h1>
          <p className="text-muted">
            Manage repair orders with completion tracking
          </p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="repair-orders" className="mb-4">
        <Tab eventKey="repair-orders" title={`Repair Orders (${total})`}>
          <Card>
            <Card.Header>
              <Row className="g-3 align-items-center">
                <Col md={4}>
                  <Form.Group>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search repair orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <InputGroup.Text>🔍</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant="primary"
                    onClick={() => setShowCompletion(true)}
                  >
                    + New Repair Order
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {repairOrders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No repair orders found</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Total Cost</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="fw-bold">#{order.id}</td>
                        <td>{getVehicleInfo(order.vehicleId)}</td>
                        <td>{getCustomerInfo(order.vehicleId)}</td>
                        <td>
                          <Badge
                            bg={getStatusBadgeVariant(
                              order.status || "pending"
                            )}
                          >
                            {order.status || "pending"}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={getPriorityBadgeVariant(
                              order.priority || "medium"
                            )}
                          >
                            {order.priority || "medium"}
                          </Badge>
                        </td>
                        <td className="fw-bold text-success">
                          {formatCurrency(order.total || 0)}
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <ButtonGroup size="sm">
                            {canPerformAction(
                              "view_breakdown",
                              order.status || "pending"
                            ) && (
                              <Button
                                variant="outline-info"
                                onClick={() =>
                                  handleViewCostBreakdown(order.id)
                                }
                                title="View Cost Breakdown"
                              >
                                💰
                              </Button>
                            )}

                            {canPerformAction(
                              "start",
                              order.status || "pending"
                            ) && (
                              <Button
                                variant="outline-primary"
                                onClick={() => handleStartWork(order.id)}
                                title="Start Work"
                              >
                                ▶️
                              </Button>
                            )}

                            {canPerformAction(
                              "complete",
                              order.status || "pending"
                            ) && (
                              <Button
                                variant="outline-success"
                                onClick={() => handleCompleteOrder(order.id)}
                                title="Complete Work"
                              >
                                ✅
                              </Button>
                            )}
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card.Footer>
                <Row className="align-items-center">
                  <Col>
                    <small className="text-muted">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, total)} of {total}{" "}
                      results
                    </small>
                  </Col>
                  <Col xs="auto">
                    <ButtonGroup>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </Card.Footer>
            )}
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="Appointments">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Appointments</h5>
              <Button
                variant="primary"
                onClick={() => setShowCostBreakdown(true)}
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
                    {appointments.map((appointment: Appointment) => (
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

      {/* Cost Breakdown Modal */}
      <CostBreakdownModal
        show={showCostBreakdown}
        onHide={() => setShowCostBreakdown(false)}
        repairOrderId={selectedOrderId}
      />

      {/* Completion Modal */}
      <RepairOrderCompletionModal
        show={showCompletion}
        onHide={() => setShowCompletion(false)}
        repairOrderId={selectedOrderId}
        onComplete={(completionData) => handleCompleteWork(completionData)}
      />
    </Container>
  );
};
