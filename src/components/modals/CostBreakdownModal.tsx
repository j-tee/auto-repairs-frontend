import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Table,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  repairOrderMngtService,
} from "../../services/repairOrderMngtService";
import type { RepairOrderCostBreakdown } from "../../types/repairOrders";
import { formatCurrency } from "../../utils/currency";

interface CostBreakdownModalProps {
  show: boolean;
  onHide: () => void;
  repairOrderId: string;
}

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({
  show,
  onHide,
  repairOrderId,
}) => {
  const [breakdown, setBreakdown] = useState<RepairOrderCostBreakdown | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && repairOrderId) {
      fetchBreakdown();
    }
  }, [show, repairOrderId]);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrderMngtService.getCostBreakdown(repairOrderId);
      setBreakdown(data);
    } catch (err) {
      console.error("Failed to load cost breakdown:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load cost breakdown"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBreakdown(null);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-calculator me-2"></i>
          Cost Breakdown - Repair Order #{repairOrderId}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading cost breakdown...</span>
            </Spinner>
            <p className="mt-2 text-muted">Loading cost breakdown...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {!loading && !error && breakdown && (
          <div className="cost-breakdown">
            {/* Status Information */}
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6 className="text-muted mb-1">Current Status</h6>
                    <span
                      className={`badge bg-${getStatusColor(
                        breakdown.current_state
                      )} fs-6`}
                    >
                      {getStatusLabel(breakdown.current_state)}
                    </span>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-1">Progress</h6>
                    {breakdown.started_at && (
                      <small className="text-success">
                        Started:{" "}
                        {new Date(breakdown.started_at).toLocaleDateString()}
                      </small>
                    )}
                    {breakdown.completed_at && (
                      <small className="text-primary d-block">
                        Completed:{" "}
                        {new Date(breakdown.completed_at).toLocaleDateString()}
                      </small>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Labor Costs */}
            {breakdown.labor_costs.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-tools me-2"></i>
                    Labor & Workmanship
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Hours</th>
                        <th>Rate</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th className="text-end">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.labor_costs.map((labor, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{labor.service_name}</strong>
                            {labor.service_description && (
                              <div className="text-muted small">
                                {labor.service_description}
                              </div>
                            )}
                          </td>
                          <td>{labor.labor_hours}h</td>
                          <td>{formatCurrency(labor.hourly_rate)}/h</td>
                          <td>{labor.technician || "Not assigned"}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                labor.completed ? "success" : "warning"
                              }`}
                            >
                              {labor.completed ? "Completed" : "In Progress"}
                            </span>
                          </td>
                          <td className="text-end">
                            <strong>{formatCurrency(labor.total_cost)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Parts Costs */}
            {breakdown.parts_costs.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-cogs me-2"></i>
                    Parts & Materials
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Part</th>
                        <th>Part Number</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.parts_costs.map((part, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{part.part_name}</strong>
                          </td>
                          <td>
                            <code>{part.part_number}</code>
                          </td>
                          <td>{part.quantity}</td>
                          <td>{formatCurrency(part.unit_price)}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                part.installed ? "success" : "warning"
                              }`}
                            >
                              {part.installed ? "Installed" : "Pending"}
                            </span>
                          </td>
                          <td className="text-end">
                            <strong>{formatCurrency(part.total_price)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Totals */}
            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Cost Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <Table>
                  <tbody>
                    <tr>
                      <td>Labor Total:</td>
                      <td className="text-end">
                        <strong>
                          {formatCurrency(breakdown.totals.labor_total)}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Parts Total:</td>
                      <td className="text-end">
                        <strong>
                          {formatCurrency(breakdown.totals.parts_total)}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Subtotal:</td>
                      <td className="text-end">
                        <strong>
                          {formatCurrency(breakdown.totals.subtotal_before_tax)}
                        </strong>
                      </td>
                    </tr>
                    {parseFloat(breakdown.totals.discount_amount) > 0 && (
                      <tr className="table-warning">
                        <td>
                          Discount ({breakdown.totals.discount_percent}%):
                        </td>
                        <td className="text-end">
                          <strong>
                            -{formatCurrency(breakdown.totals.discount_amount)}
                          </strong>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>Tax ({breakdown.totals.tax_percent}%):</td>
                      <td className="text-end">
                        <strong>
                          {formatCurrency(breakdown.totals.tax_amount)}
                        </strong>
                      </td>
                    </tr>
                    <tr className="table-primary">
                      <td>
                        <strong>Final Total:</strong>
                      </td>
                      <td className="text-end">
                        <h5 className="text-primary mb-0">
                          {formatCurrency(breakdown.totals.final_total)}
                        </h5>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Related Appointments */}
            {breakdown.related_appointments.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-check me-2"></i>
                    Related Appointments
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.related_appointments.map(
                        (appointment, index) => (
                          <tr key={index}>
                            <td>{appointment.description}</td>
                            <td>
                              {new Date(appointment.date).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${getAppointmentStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {breakdown && (
          <Button
            variant="primary"
            onClick={() => window.print()}
            disabled={loading}
          >
            <i className="fas fa-print me-2"></i>
            Print
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "warning";
    case "not_started":
      return "secondary";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    default:
      return status;
  }
}

function getAppointmentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "in_progress":
      return "warning";
    case "pending":
      return "info";
    case "scheduled":
      return "primary";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}
