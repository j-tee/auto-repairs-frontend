import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import {
  appointmentMngtService,
  customerMngtService,
  vehicleMngtService,
  vehicleProblemMngtService,
} from "../../services";
import type { 
  CreateAppointmentData, 
  Customer, 
  VehicleProblem, 
  Appointment 
} from "../../types";
import type { Vehicle } from "../../types/vehicles";
import { ApiError } from "../../utils/api";

interface AddAppointmentModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (appointment: Appointment) => void;
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
    reportedProblemId: "",
    vehicle: 0,
    date: "",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleProblems, setVehicleProblems] = useState<VehicleProblem[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // New problem creation state
  const [showNewProblemForm, setShowNewProblemForm] = useState(false);
  const [newProblemDescription, setNewProblemDescription] = useState("");
  const [creatingNewProblem, setCreatingNewProblem] = useState(false);

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
        loadCustomerVehicles(String(formData.customerId));
      }
      if (formData.vehicleId) {
        loadVehicleProblems(String(formData.vehicleId));
      }
    }
  }, [show]); // Remove formData.customerId dependency to avoid infinite loop

  // Separate effect for loading vehicles when customer changes
  useEffect(() => {
    if (show && formData.customerId) {
      loadCustomerVehicles(String(formData.customerId));
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
      date: "", // Required field
      duration: 60,
      priority: "medium",
      description: "",
      notes: "",
      estimatedCost: 0,
      reportedProblemId: "",
    });
    setError(null);
    setCustomers([]);
    setVehicles([]);
    setVehicleProblems([]);

    // Reset new problem creation state
    setShowNewProblemForm(false);
    setNewProblemDescription("");
    setCreatingNewProblem(false);
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
    } catch (error: unknown) {
      console.error("Error loading customers:", error);

      // Set user-friendly error messages based on error type
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError("Authentication required. Please log in again.");
        } else if (error.status === 403) {
          setError("You don't have permission to view customer data.");
        } else if (error.status && error.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            `Failed to load customers: ${error.message || "Unknown error"}`
          );
        }
      } else if (error instanceof Error) {
        setError(`Failed to load customers: ${error.message}`);
      } else {
        setError("Failed to load customers: Unknown error");
      }
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadCustomerVehicles = async (customerId: string) => {
    if (!customerId) {
      setVehicles([]);
      setVehicleProblems([]);
      return;
    }

    try {
      setLoadingVehicles(true);
      console.log(`Loading vehicles for customer: ${customerId}`);

      // Use the specialized method that handles filtering
      const customerVehicles = await vehicleMngtService.getCustomerVehicles(
        customerId
      );

      console.log(
        `Found ${customerVehicles.length} vehicles for customer ${customerId}:`,
        customerVehicles
      );
      setVehicles(customerVehicles);
    } catch (error: unknown) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
      // Could set a specific error for vehicles if needed
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadVehicleProblems = async (vehicleId: string) => {
    if (!vehicleId) {
      setVehicleProblems([]);
      return;
    }

    try {
      setLoadingProblems(true);
      console.log(`Loading problems for vehicle: ${vehicleId}`);
      const problems = await vehicleProblemMngtService.getVehicleProblems({
        vehicleId: vehicleId,
        status: 'open'
      });
      console.log("Vehicle problems response:", problems);
      setVehicleProblems(problems || []);
    } catch (error: unknown) {
      console.error("Error loading vehicle problems:", error);
      setVehicleProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Create a new vehicle problem
  const createNewVehicleProblem = async (): Promise<string | null> => {
    if (!formData.vehicleId || !newProblemDescription.trim()) {
      return null;
    }

    try {
      setCreatingNewProblem(true);
      console.log(
        `Creating new problem for vehicle ${formData.vehicleId}: ${newProblemDescription}`
      );

      const newProblem = await vehicleProblemMngtService.createVehicleProblem({
        vehicleId: String(formData.vehicleId),
        description: newProblemDescription.trim(),
      });

      console.log("New problem created:", newProblem);

      // Add the new problem to the existing list
      setVehicleProblems((prev) => [newProblem, ...prev]);

      // Clear the new problem form
      setNewProblemDescription("");
      setShowNewProblemForm(false);

      return String(newProblem.id);
    } catch (error: unknown) {
      console.error("Error creating new vehicle problem:", error);
      throw error;
    } finally {
      setCreatingNewProblem(false);
    }
  };

  // Handle problem selection change
  const handleProblemSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;

    if (value === "CREATE_NEW") {
      setShowNewProblemForm(true);
      setFormData((prev) => ({ ...prev, reportedProblemId: "" }));
    } else {
      setShowNewProblemForm(false);
      setFormData((prev) => ({ ...prev, reportedProblemId: value }));
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
      setFormData((prev) => ({
        ...prev,
        vehicleId: "",
        reportedProblemId: "",
      })); // Reset vehicle and problem selection
      loadCustomerVehicles(String(value));
      setVehicleProblems([]);

      // Reset new problem form
      setShowNewProblemForm(false);
      setNewProblemDescription("");
    }

    // When vehicle changes, load vehicle problems
    if (name === "vehicleId") {
      setFormData((prev) => ({ ...prev, reportedProblemId: "" })); // Reset problem selection
      loadVehicleProblems(value);

      // Reset new problem form
      setShowNewProblemForm(false);
      setNewProblemDescription("");
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

      // Check if we need to create a new problem
      let problemId: string | undefined =
        typeof formData.reportedProblemId === "number"
          ? String(formData.reportedProblemId)
          : formData.reportedProblemId;
      if (showNewProblemForm && newProblemDescription.trim()) {
        console.log("Creating new problem before appointment...");
        const newProblemId = await createNewVehicleProblem();
        if (!newProblemId) {
          throw new Error("Failed to create new vehicle problem");
        }
        problemId = newProblemId;
      }

      // Validate that we have either a problem or a description
      if (!problemId && !formData.description) {
        throw new Error(
          "Please provide a description for the service or select/create a vehicle problem"
        );
      }

      // Create appointment with the problem ID (new or existing)
      const appointmentData = {
        ...formData,
        reportedProblemId: problemId || "",
      };

      const newAppointment = await appointmentMngtService.createAppointment(
        appointmentData
      );

      onSuccess(newAppointment);
      onHide();
      resetForm();
    } catch (error: unknown) {
      console.error("Error creating appointment:", error);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create appointment");
      }
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
                          `${customer.firstName || ""} ${
                            customer.lastName || ""
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
                      {vehicle.license_plate || 'No plate'}
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

          {/* Vehicle Problem Selection - Show when vehicle is selected */}
          {formData.vehicleId && (
            <>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Problem (Optional)</Form.Label>
                    <Form.Select
                      name="reportedProblemId"
                      value={
                        showNewProblemForm
                          ? "CREATE_NEW"
                          : formData.reportedProblemId
                      }
                      onChange={handleProblemSelectionChange}
                      disabled={loadingProblems}
                    >
                      <option value="">
                        {loadingProblems
                          ? "Loading problems..."
                          : vehicleProblems.length > 0
                          ? "Select existing problem or leave blank for general service"
                          : "No reported problems - General service appointment"}
                      </option>
                      {vehicleProblems.map((problem) => (
                        <option key={problem.id} value={problem.id}>
                          {problem.description}
                          {problem.resolved
                            ? " (Previously Resolved)"
                            : " (Unresolved)"}
                          {problem.reportedDate && 
                            " - Reported: " +
                            new Date(problem.reportedDate).toLocaleDateString()}
                        </option>
                      ))}
                      <option
                        value="CREATE_NEW"
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#e3f2fd",
                        }}
                      >
                        ➕ Create New Problem for this Vehicle
                      </option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {vehicleProblems.length > 0
                        ? "Select a specific problem to address, create a new problem, or leave blank for general maintenance"
                        : "Create a new problem for this vehicle or leave blank for general maintenance"}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* New Problem Creation Form */}
              {showNewProblemForm && (
                <Row>
                  <Col md={12}>
                    <div className="border p-3 rounded bg-light mb-3">
                      <h6 className="mb-3">
                        <i className="fas fa-plus-circle me-2"></i>
                        Create New Vehicle Problem
                      </h6>
                      <Form.Group className="mb-3">
                        <Form.Label>Problem Description *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={newProblemDescription}
                          onChange={(e) =>
                            setNewProblemDescription(e.target.value)
                          }
                          placeholder="Describe the vehicle problem in detail..."
                          required={showNewProblemForm}
                          disabled={creatingNewProblem}
                        />
                        <Form.Text className="text-muted">
                          This problem will be saved and linked to the
                          appointment
                        </Form.Text>
                      </Form.Group>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setShowNewProblemForm(false);
                            setNewProblemDescription("");
                            setFormData((prev) => ({
                              ...prev,
                              reportedProblemId: "",
                            }));
                          }}
                          disabled={creatingNewProblem}
                        >
                          Cancel
                        </Button>
                        {creatingNewProblem && (
                          <Button variant="outline-primary" size="sm" disabled>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              className="me-2"
                            />
                            Creating...
                          </Button>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}

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
            <Form.Label>
              Description{" "}
              {!formData.reportedProblemId && (
                <span className="text-danger">*</span>
              )}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={
                formData.reportedProblemId
                  ? "Additional details about the service (optional)..."
                  : "Describe the service needed (required if no problem selected)..."
              }
              required={!formData.reportedProblemId}
            />
            {formData.reportedProblemId && (
              <Form.Text className="text-muted">
                Since you selected a specific problem, this description is
                optional.
              </Form.Text>
            )}
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
