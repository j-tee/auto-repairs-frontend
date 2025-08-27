import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import type { VehicleProblemFormData } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchVehicles } from "../../store/slices/autoRepairsSlice";

interface AddVehicleProblemModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (problem: VehicleProblemFormData) => void;
  vehicleId?: number; // Pre-select vehicle if provided
}

export const AddVehicleProblemModal: React.FC<AddVehicleProblemModalProps> = ({
  show,
  onHide,
  onSuccess,
  vehicleId,
}) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux state
  const { 
    vehicles, 
    loading: { vehicles: vehiclesLoading } 
  } = useAppSelector((state) => state.autoRepairs);
  
  const [formData, setFormData] = useState<VehicleProblemFormData>({
    vehicle: vehicleId || 0,
    description: "",
    resolved: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (show && vehicles.length === 0) {
      dispatch(fetchVehicles({}));
    }
  }, [show, vehicles.length, dispatch]);

  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicle: vehicleId }));
    }
  }, [vehicleId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "vehicle" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      // TODO: Move to Redux when vehicle problem management is implemented
      const { apiPost } = await import("../../utils/api");
      const response = await apiPost("/vehicle-problems/", formData);
      onSuccess(response as VehicleProblemFormData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report problem");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicle: vehicleId || 0,
      description: "",
      resolved: false,
    });
    setError(null);
    setSubmitLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Report Vehicle Problem</Modal.Title>
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
              disabled={!!vehicleId || vehiclesLoading}
            >
              <option value="">
                {vehiclesLoading ? "Loading vehicles..." : "Select a vehicle"}
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.customer_name} - {vehicle.make} {vehicle.model} (
                  {vehicle.license_plate || vehicle.vin})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Problem Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the problem with the vehicle in detail..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="resolved"
              checked={formData.resolved}
              onChange={handleInputChange}
              label="Mark as resolved (usually left unchecked for new problems)"
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
            disabled={submitLoading || !formData.vehicle}
          >
            {submitLoading ? "Reporting..." : "Report Problem"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
