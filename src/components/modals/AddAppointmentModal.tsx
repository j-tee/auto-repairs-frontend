import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import type {
  Vehicle,
  VehicleProblem,
  AppointmentFormData,
} from "../../types/entities";
import { apiPost, apiGet } from "../../utils/api";

interface AddAppointmentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (appointment: any) => void;
  vehicleId?: number; // Pre-select vehicle if provided
  problemId?: number; // Pre-select problem if provided
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  show,
  onHide,
  onSuccess,
  vehicleId,
  problemId,
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    vehicle: vehicleId || 0,
    reported_problem: problemId,
    description: "",
    date: "",
    status: "pending",
  });
  const [vehicles, setVehicles] = useState<
    (Vehicle & { customer_name: string })[]
  >([]);
  const [problems, setProblems] = useState<VehicleProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      loadVehicles();
    }
  }, [show]);

  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicle: vehicleId }));
      loadProblemsForVehicle(vehicleId);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (problemId) {
      setFormData((prev) => ({ ...prev, reported_problem: problemId }));
    }
  }, [problemId]);

  const loadVehicles = async () => {
    setLoadingData(true);
    try {
      // ✅ Backend now provides customer_name directly - no need for separate customer API call!
      const vehiclesResponse = await apiGet<Vehicle[]>("/shop/vehicles/");

      // Backend provides customer_name, customer_email, customer_phone directly
      setVehicles(vehiclesResponse as (Vehicle & { customer_name: string })[]);
    } catch (err) {
      setError("Failed to load vehicles");
    } finally {
      setLoadingData(false);
    }
  };

  const loadProblemsForVehicle = async (vehicleId: number) => {
    try {
      const response = await apiGet<VehicleProblem[]>(
        `/vehicles/${vehicleId}/problems/`
      );
      setProblems(response.filter((p) => !p.resolved)); // Only show unresolved problems
    } catch (err) {
      // If endpoint doesn't exist, try getting all problems and filter
      try {
        const allProblems = await apiGet<VehicleProblem[]>(
          "/vehicle-problems/"
        );
        setProblems(
          allProblems.filter((p) => p.vehicle === vehicleId && !p.resolved)
        );
      } catch {
        setProblems([]);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "vehicle") {
      const vehicleId = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: vehicleId,
        reported_problem: undefined, // Reset problem when vehicle changes
      }));
      if (vehicleId) {
        loadProblemsForVehicle(vehicleId);
      } else {
        setProblems([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "reported_problem" ? parseInt(value) || undefined : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost("/shop/appointments/", formData);
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicle: vehicleId || 0,
      reported_problem: problemId,
      description: "",
      date: "",
      status: "pending",
    });
    setProblems([]);
    setError(null);
    onHide();
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Generate date/time input default (tomorrow at 9 AM)
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Schedule New Appointment</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Vehicle *</Form.Label>
            <Form.Select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              required
              disabled={!!vehicleId || loadingData}
            >
              <option value="">
                {loadingData ? "Loading vehicles..." : "Select a vehicle"}
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.customer_name} - {vehicle.make} {vehicle.model} (
                  {vehicle.license_plate || vehicle.vin})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {formData.vehicle > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Related Problem (Optional)</Form.Label>
              <Form.Select
                name="reported_problem"
                value={formData.reported_problem || ""}
                onChange={handleInputChange}
                disabled={!!problemId}
              >
                <option value="">No specific problem selected</option>
                {problems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    {problem.description.substring(0, 80)}
                    {problem.description.length > 80 ? "..." : ""}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select a previously reported problem for this vehicle
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Appointment Date & Time *</Form.Label>
            <Form.Control
              type="datetime-local"
              name="date"
              value={formData.date || getDefaultDateTime()}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any additional information about the appointment..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !formData.vehicle}
          >
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
