import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  Card,
  ListGroup,
} from "react-bootstrap";
import { repairOrderMngtService } from "../../services/repairOrderMngtService";
import type {
  CompleteWorkData,
  RelatedAppointmentsResponse,
} from "../../types/repairOrders";

interface CompletionDialogProps {
  show: boolean;
  onHide: () => void;
  repairOrderId: string;
  onComplete: (completionData: CompleteWorkData) => void;
}

export const RepairOrderCompletionModal: React.FC<CompletionDialogProps> = ({
  show,
  onHide,
  repairOrderId,
  onComplete,
}) => {
  const [completionNotes, setCompletionNotes] = useState("");
  const [qualityPassed, setQualityPassed] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [discountAmount, setDiscountAmount] = useState("0.00");

  const [relatedAppointments, setRelatedAppointments] =
    useState<RelatedAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && repairOrderId) {
      fetchRelatedAppointments();
    }
  }, [show, repairOrderId]);

  const fetchRelatedAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrderMngtService.getRelatedAppointments(
        repairOrderId
      );
      setRelatedAppointments(data);
    } catch (err) {
      console.error("Failed to fetch related appointments:", err);
      setError("Failed to load related appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completionNotes.trim()) {
      setError("Please enter completion notes");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const completionData: CompleteWorkData = {
        completion_notes: completionNotes,
        quality_check_passed: qualityPassed,
        notify_customer: notifyCustomer,
        discount_amount: discountAmount,
      };

      if (selectedAppointmentId) {
        completionData.target_appointment_id = selectedAppointmentId;
      }

      // Pass completion data to parent component for Redux handling
      onComplete(completionData);
      handleClose();
    } catch (err) {
      console.error("Failed to complete repair order:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete repair order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletionNotes("");
    setQualityPassed(true);
    setNotifyCustomer(true);
    setSelectedAppointmentId("");
    setDiscountAmount("0.00");
    setRelatedAppointments(null);
    setError(null);
    onHide();
  };

  const hasValidInput = completionNotes.trim().length > 0;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-check-circle me-2 text-success"></i>
          Complete Repair Order #{repairOrderId}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Form>
          {/* Completion Notes */}
          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Completion Notes *</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe the work completed, any issues encountered, recommendations for the customer..."
              required
              className={
                !hasValidInput && completionNotes.length > 0 ? "is-invalid" : ""
              }
            />
            <Form.Text className="text-muted">
              Please provide detailed notes about the work performed and any
              recommendations.
            </Form.Text>
            {!hasValidInput && completionNotes.length > 0 && (
              <div className="invalid-feedback">
                Completion notes are required
              </div>
            )}
          </Form.Group>

          {/* Quality Check */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="quality-check"
              label="Quality check passed"
              checked={qualityPassed}
              onChange={(e) => setQualityPassed(e.target.checked)}
            />
            <Form.Text className="text-muted">
              Confirm that all work has been inspected and meets quality
              standards.
            </Form.Text>
          </Form.Group>

          {/* Additional Discount */}
          <Form.Group className="mb-3">
            <Form.Label>Additional Discount (Optional)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0.00"
            />
            <Form.Text className="text-muted">
              Apply any additional discount to this repair order.
            </Form.Text>
          </Form.Group>

          {/* Customer Notification */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="notify-customer"
              label="Notify customer of completion"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
            />
            <Form.Text className="text-muted">
              Send notification to customer that their vehicle is ready for
              pickup.
            </Form.Text>
          </Form.Group>

          {/* Related Appointments */}
          {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading related appointments...
            </div>
          )}

          {relatedAppointments &&
            relatedAppointments.appointments.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="fas fa-calendar-check me-2"></i>
                    Related Appointments
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>
                      Mark appointment as completed (Optional)
                    </Form.Label>
                    <Form.Select
                      value={selectedAppointmentId}
                      onChange={(e) => setSelectedAppointmentId(e.target.value)}
                    >
                      <option value="">
                        Select appointment to mark as completed
                      </option>
                      {relatedAppointments.appointments.map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {appointment.description} -{" "}
                          {new Date(appointment.date).toLocaleDateString()} (
                          {appointment.status})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      This will update the selected appointment status to
                      "completed".
                    </Form.Text>
                  </Form.Group>

                  {/* Appointment List */}
                  <div className="mt-3">
                    <small className="text-muted">
                      All related appointments:
                    </small>
                    <ListGroup variant="flush">
                      {relatedAppointments.appointments.map((appointment) => (
                        <ListGroup.Item
                          key={appointment.id}
                          className="px-0 py-2 border-0"
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-bold">
                                {appointment.description}
                              </div>
                              <small className="text-muted">
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  appointment.date
                                ).toLocaleTimeString()}
                              </small>
                            </div>
                            <span
                              className={`badge bg-${getAppointmentStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </Card.Body>
              </Card>
            )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleComplete}
          disabled={!hasValidInput || submitting}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Completing...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i>
              Complete Repair Order
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Helper function for appointment status colors
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
