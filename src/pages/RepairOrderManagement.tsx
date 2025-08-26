import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { repairOrderMngtService } from "../services/repairOrderMngtService";
import type {
  RepairOrder,
  RepairOrderQuery,
  CompleteWorkData,
} from "../types/repairOrders";
import {
  CostBreakdownModal,
  RepairOrderCompletionModal,
} from "../components/modals";
import { formatCurrency } from "../utils/currency";
import { useAuth } from "../hooks/useAuth";

export const RepairOrderManagement: React.FC = () => {
  const { user } = useAuth();
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadRepairOrders();
  }, [currentPage, statusFilter, priorityFilter]);

  const loadRepairOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const query: RepairOrderQuery = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: (priorityFilter as any) || undefined,
        sortBy: "updated_at",
        sortOrder: "desc",
      };

      const response = await repairOrderMngtService.getRepairOrders(query);
      setRepairOrders(response.repairOrders || []);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err) {
      console.error("Failed to load repair orders:", err);
      setError("Failed to load repair orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadRepairOrders();
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: RepairOrder["status"]
  ) => {
    try {
      await repairOrderMngtService.updateRepairOrder(orderId, {
        status: newStatus,
      });
      loadRepairOrders(); // Refresh the list
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update repair order status");
    }
  };

  const handleStartWork = async (orderId: string) => {
    try {
      await repairOrderMngtService.startWork(orderId, {
        technician_id: user?.id,
        notes: "Work started",
      });
      loadRepairOrders();
    } catch (err) {
      console.error("Failed to start work:", err);
      setError("Failed to start work on repair order");
    }
  };

  const handleViewCostBreakdown = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCostBreakdown(true);
  };

  const handleStartCompletion = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCompletion(true);
  };

  const handleCompletionSuccess = async (completionData: CompleteWorkData) => {
    try {
      console.log("Processing repair order completion:", completionData);
      // Call the actual completion service
      const result = await repairOrderMngtService.completeWork(
        selectedOrderId,
        completionData
      );

      loadRepairOrders(); // Refresh the list
      setShowCompletion(false);
      setError(null);

      // Show success message
      alert(
        `Repair order completed successfully! Final total: ${formatCurrency(
          result.totalCost || 0
        )}`
      );
    } catch (err) {
      console.error("Failed to complete repair order:", err);
      setError("Failed to complete repair order. Please try again.");
    }
  };

  const getStatusBadgeVariant = (status: RepairOrder["status"]): string => {
    switch (status) {
      case "draft":
        return "secondary";
      case "approved":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "on_hold":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (
    priority: RepairOrder["priority"]
  ): string => {
    switch (priority) {
      case "low":
        return "success";
      case "medium":
        return "info";
      case "high":
        return "warning";
      case "urgent":
        return "danger";
      default:
        return "secondary";
    }
  };

  const canCompleteOrder = (order: RepairOrder): boolean => {
    return order.status === "in_progress" && user?.role !== "customer";
  };

  const canStartWork = (order: RepairOrder): boolean => {
    return order.status === "approved" && user?.role !== "customer";
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fas fa-wrench me-2"></i>
            Repair Order Management
          </h2>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search repair orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" onClick={loadRepairOrders}>
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Repair Orders Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Repair Orders ({total} total)</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Loading repair orders...</p>
            </div>
          ) : repairOrders.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No repair orders found</h5>
              <p className="text-muted">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {repairOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      <br />
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      {order.customer ? (
                        <>
                          <strong>
                            {order.customer.firstName} {order.customer.lastName}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {order.customer.phone}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">No customer info</span>
                      )}
                    </td>
                    <td>
                      {order.vehicle ? (
                        <>
                          <strong>
                            {order.vehicle.year} {order.vehicle.make}{" "}
                            {order.vehicle.model}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {order.vehicle.licensePlate}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">No vehicle info</span>
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: "200px" }}>
                        <strong>{order.description}</strong>
                        {order.diagnosis && (
                          <div className="text-muted small mt-1">
                            Diagnosis: {order.diagnosis}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityBadgeVariant(order.priority)}>
                        {order.priority}
                      </Badge>
                    </td>
                    <td>
                      <strong>{formatCurrency(order.total)}</strong>
                    </td>
                    <td>
                      <Dropdown as={ButtonGroup}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewCostBreakdown(order.id)}
                        >
                          <i className="fas fa-calculator me-1"></i>
                          Breakdown
                        </Button>

                        <Dropdown.Toggle
                          split
                          variant="outline-primary"
                          size="sm"
                        />

                        <Dropdown.Menu>
                          {canStartWork(order) && (
                            <Dropdown.Item
                              onClick={() => handleStartWork(order.id)}
                            >
                              <i className="fas fa-play me-2 text-success"></i>
                              Start Work
                            </Dropdown.Item>
                          )}

                          {canCompleteOrder(order) && (
                            <Dropdown.Item
                              onClick={() => handleStartCompletion(order.id)}
                            >
                              <i className="fas fa-check-circle me-2 text-success"></i>
                              Complete Order
                            </Dropdown.Item>
                          )}

                          <Dropdown.Divider />

                          {order.status !== "on_hold" &&
                            order.status !== "completed" && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(order.id, "on_hold")
                                }
                              >
                                <i className="fas fa-pause me-2 text-warning"></i>
                                Put On Hold
                              </Dropdown.Item>
                            )}

                          {order.status !== "cancelled" &&
                            order.status !== "completed" && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(order.id, "cancelled")
                                }
                              >
                                <i className="fas fa-times me-2 text-danger"></i>
                                Cancel
                              </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, total)} of {total} entries
              </div>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

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
        onComplete={handleCompletionSuccess}
      />
    </Container>
  );
};
