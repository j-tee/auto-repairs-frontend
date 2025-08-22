import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import {
  appointmentMngtService,
  customerMngtService,
  vehicleMngtService,
  type CreateAppointmentData,
} from "../../services";

interface AddAppointmentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (appointment: any) => void;
  preSelectedCustomerId?: string;
  preSelectedVehicleId?: string;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  show,
  onHide,
  onSuccess,
  preSelectedCustomerId,
  preSelectedVehicleId,
}) => {
  const { user } = useAuth();

  // Form data state
  const [formData, setFormData] = useState<CreateAppointmentData>({
    customerId: preSelectedCustomerId || "",
    vehicleId: preSelectedVehicleId || "",
    serviceType: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    priority: "medium",
    description: "",
    notes: "",
    estimatedCost: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Service types (could be fetched from API in the future)
  const serviceTypes = [
    "Oil Change",
    "Brake Service",
    "Tire Service",
    "Engine Diagnostic",
    "Transmission Service",
    "Air Conditioning",
    "Battery Service",
    "General Maintenance",
    "Inspection",
    "Custom Service",
  ];

  // Load customers and vehicles when modal opens
  useEffect(() => {
    if (show) {
      loadCustomers();
      if (formData.customerId) {
        loadCustomerVehicles(formData.customerId);
      }
    }
  }, [show]); // Remove formData.customerId dependency to avoid infinite loop

  // Separate effect for loading vehicles when customer changes
  useEffect(() => {
    if (show && formData.customerId) {
      loadCustomerVehicles(formData.customerId);
    }
  }, [formData.customerId, show]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setFormData({
      customerId: preSelectedCustomerId || "",
      vehicleId: preSelectedVehicleId || "",
      serviceType: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      priority: "medium",
      description: "",
      notes: "",
      estimatedCost: 0,
    });
    setError(null);
    setCustomers([]);
    setVehicles([]);
  };

  const loadCustomers = async () => {
    // Check if user is authenticated
    if (!user) {
      setError("Please log in to access customer data");
      return;
    }

    if (user?.role === "customer") {
      // For customers, only show their own data
      return;
    }

    try {
      setLoadingCustomers(true);
      setError(null); // Clear any previous errors
      const response = await customerMngtService.getCustomers({ limit: 1000 });

      // Debug logging to see the actual response structure
      console.log("Service response:", response);
      console.log("Response.customers:", response.customers);
      console.log("Customers array length:", response.customers?.length || 0);

      // The service already returns a CustomerListResponse with customers array
      const customerList = response.customers || [];

      console.log("Final customer list:", customerList);
      console.log("Customer count:", customerList.length);

      setCustomers(customerList);

      // Force a re-render by ensuring React sees this as a state change
      if (customerList.length > 0) {
        console.log(
          "Setting customers state with",
          customerList.length,
          "customers"
        );
        console.log("First customer:", customerList[0]);
      }
    } catch (error: any) {
      console.error("Error loading customers:", error);

      // Set user-friendly error messages based on error type
      if (error?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else if (error?.status === 403) {
        setError("You don't have permission to view customer data.");
      } else if (error?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          `Failed to load customers: ${error?.message || "Unknown error"}`
        );
      }
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadCustomerVehicles = async (customerId: string) => {
    if (!customerId) {
      setVehicles([]);
      return;
    }

    try {
      setLoadingVehicles(true);
      console.log(`Loading vehicles for customer: ${customerId}`);
      const response = await vehicleMngtService.getVehicles({
        customerId,
        limit: 1000,
      });
      console.log("Vehicle service response:", response);
      console.log("Response.vehicles:", response.vehicles);
      console.log("Vehicles array length:", response.vehicles?.length || 0);
      setVehicles(response.vehicles || []);
    } catch (error: any) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
      // Could set a specific error for vehicles if needed
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When customer changes, load their vehicles
    if (name === "customerId") {
      setFormData((prev) => ({ ...prev, vehicleId: "" })); // Reset vehicle selection
      loadCustomerVehicles(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.customerId) {
        throw new Error("Please select a customer");
      }
      if (!formData.vehicleId) {
        throw new Error("Please select a vehicle");
      }
      if (!formData.serviceType) {
        throw new Error("Please select a service type");
      }
      if (!formData.scheduledDate) {
        throw new Error("Please select a date");
      }
      if (!formData.scheduledTime) {
        throw new Error("Please select a time");
      }

      // Create appointment
      const newAppointment = await appointmentMngtService.createAppointment(
        formData
      );

      onSuccess(newAppointment);
      onHide();
      resetForm();
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      setError(error.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📅 Schedule Appointment</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Customer Selection - Only show for employees/owners */}
            {user?.role !== "customer" && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer *</Form.Label>
                  <Form.Select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    required
                    disabled={loadingCustomers}
                  >
                    <option value="">
                      {loadingCustomers
                        ? "Loading customers..."
                        : customers.length > 0
                        ? `Select Customer (${customers.length} available)`
                        : "No customers available"}
                    </option>
                    {customers.map((customer, index) => (
                      <option key={customer.id || index} value={customer.id}>
                        {customer.name ||
                          `${customer.first_name || ""} ${
                            customer.last_name || ""
                          }`.trim() ||
                          "Unknown"}{" "}
                        - {customer.email}
                      </option>
                    ))}
                  </Form.Select>
                  {customers.length === 0 && !loadingCustomers && (
                    <Form.Text className="text-warning">
                      {error
                        ? "Failed to load customers - please check your connection"
                        : "No customers found in database. Please add customers first using the 'New Customer' button on the dashboard."}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            )}

            {/* Vehicle Selection */}
            <Col md={user?.role === "customer" ? 12 : 6}>
              <Form.Group className="mb-3">
                <Form.Label>Vehicle *</Form.Label>
                <Form.Select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  required
                  disabled={
                    loadingVehicles ||
                    (!formData.customerId && user?.role !== "customer")
                  }
                >
                  <option value="">
                    {loadingVehicles ? "Loading vehicles..." : "Select Vehicle"}
                  </option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} -{" "}
                      {vehicle.licensePlate}
                    </option>
                  ))}
                </Form.Select>
                {user?.role !== "customer" && !formData.customerId && (
                  <Form.Text className="text-muted">
                    Please select a customer first
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Service Type */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service Type *</Form.Label>
                <Form.Select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Priority */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Date */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                />
              </Form.Group>
            </Col>

            {/* Time */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Time *</Form.Label>
                <Form.Select
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Duration */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  step="15"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the service needed..."
            />
          </Form.Group>

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Internal Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Internal notes (not visible to customer)..."
            />
          </Form.Group>

          {/* Estimated Cost */}
          <Form.Group className="mb-3">
            <Form.Label>Estimated Cost ($)</Form.Label>
            <Form.Control
              type="number"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          {customers.length === 0 && !loadingCustomers ? (
            <Button variant="info" onClick={onHide}>
              Add Customers First
            </Button>
          ) : (
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Creating...
                </>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
