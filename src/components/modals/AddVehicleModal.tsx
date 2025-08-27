import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import type { VehicleFormData } from "../../types/entities";
import type { CreateVehicleData, Vehicle } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCustomers, createVehicle } from "../../store/slices/autoRepairsSlice";
import { AutomotiveValidation, formatVIN } from "../../utils/validation";

interface AddVehicleModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (vehicle: Vehicle) => void;
  customerId?: number; // Pre-select customer if provided
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  show,
  onHide,
  onSuccess,
  customerId,
}) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux state
  const { 
    customers, 
    loading: { customers: customersLoading, vehicles: vehiclesLoading },
    error: { customers: customersError, vehicles: vehiclesError }
  } = useAppSelector((state) => state.autoRepairs);
  
  const [formData, setFormData] = useState<VehicleFormData>({
    customer: customerId || 0,
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    license_plate: "",
    color: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    // Load customers if modal is shown and:
    // 1. No customers loaded yet, OR
    // 2. A specific customer is provided but we don't have their data
    if (show && (
      customers.length === 0 || 
      (customerId && !customers.find(c => Number(c.id) === customerId))
    )) {
      console.log('Loading customers because:', {
        show,
        customersLength: customers.length,
        customerId,
        hasCustomerData: customerId ? !!customers.find(c => Number(c.id) === customerId) : 'N/A'
      });
      dispatch(fetchCustomers({}));
    }
  }, [show, customers, customerId, dispatch]);

  useEffect(() => {
    if (customerId) {
      console.log('Setting customerId in formData:', customerId);
      setFormData((prev) => ({ ...prev, customer: customerId }));
    }
  }, [customerId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: name === "customer" || name === "year" ? parseInt(value) : value,
    };
    setFormData(newFormData);

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation for specific fields
    if (name === "vin") {
      const vinError = AutomotiveValidation.validateVIN(value);
      if (vinError) {
        setValidationErrors((prev) => ({ ...prev, vin: vinError }));
      }
    } else if (name === "license_plate") {
      const plateError = AutomotiveValidation.validateLicensePlate(value);
      if (plateError) {
        setValidationErrors((prev) => ({ ...prev, license_plate: plateError }));
      }
    } else if (name === "year") {
      const yearError = AutomotiveValidation.validateVehicleYear(
        parseInt(value)
      );
      if (yearError) {
        setValidationErrors((prev) => ({ ...prev, year: yearError }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const errors = AutomotiveValidation.validateForm("vehicle", formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Transform VehicleFormData to CreateVehicleData
      const createVehicleData: CreateVehicleData = {
        customerId: formData.customer,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        vin: formData.vin,
        license_plate: formData.license_plate,
        color: formData.color,
      };
      
      const resultAction = await dispatch(createVehicle(createVehicleData));
      if (createVehicle.fulfilled.match(resultAction)) {
        onSuccess(resultAction.payload);
        handleClose();
      } else {
        setError(resultAction.payload as string || "Failed to create vehicle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle");
    }
  };

  const handleClose = () => {
    setFormData({
      customer: customerId || 0,
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      license_plate: "",
      color: "",
    });
    setValidationErrors({});
    setError(null);
    onHide();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {customerId ? (
            (() => {
              const selectedCustomer = customers.find(c => Number(c.id) === customerId);
              return selectedCustomer 
                ? `Add Vehicle for ${selectedCustomer.name}`
                : "Add New Vehicle";
            })()
          ) : (
            "Add New Vehicle"
          )}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {(error || customersError || vehiclesError) && (
            <Alert variant="danger">
              {error || customersError || vehiclesError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Customer *</Form.Label>
            {customerId ? (
              // Show customer information when specific customer is provided
              (() => {
                console.log('Looking for customer with ID:', customerId, 'in customers:', customers.map(c => ({ id: c.id, name: c.name })));
                const selectedCustomer = customers.find(c => Number(c.id) === customerId);
                console.log('Found customer:', selectedCustomer);
                return selectedCustomer ? (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">{selectedCustomer.name}</h6>
                        <small className="text-muted">
                          📞 {selectedCustomer.phone_number}
                          {selectedCustomer.email && (
                            <span className="ms-2">📧 {selectedCustomer.email}</span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert variant="warning">
                    Customer information not found. Please try again.
                  </Alert>
                );
              })()
            ) : (
              // Show dropdown when no specific customer is provided
              <Form.Select
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                required
                disabled={customersLoading}
              >
                <option value="">
                  {customersLoading
                    ? "Loading customers..."
                    : "Select a customer"}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone_number}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Make *</Form.Label>
                <Form.Control
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Toyota, Ford, Honda"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Model *</Form.Label>
                <Form.Control
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Camry, F-150, Civic"
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Year *</Form.Label>
                <Form.Select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.year ? "is-invalid" : ""}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.year && (
                  <div className="invalid-feedback">
                    {validationErrors.year}
                  </div>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue, Red, White"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>VIN *</Form.Label>
            <Form.Control
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleInputChange}
              required
              placeholder="Vehicle Identification Number"
              maxLength={17}
              className={
                validationErrors.vin
                  ? "is-invalid"
                  : formData.vin.length === 17
                  ? "is-valid"
                  : ""
              }
              style={{ textTransform: "uppercase" }}
            />
            {validationErrors.vin && (
              <div className="invalid-feedback">{validationErrors.vin}</div>
            )}
            {formData.vin.length === 17 && !validationErrors.vin && (
              <div className="valid-feedback">VIN format looks good!</div>
            )}
            <Form.Text className="text-muted">
              17-character Vehicle Identification Number (formatted:{" "}
              {formatVIN(formData.vin)})
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>License Plate</Form.Label>
            <Form.Control
              type="text"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleInputChange}
              placeholder="License plate number"
              className={validationErrors.license_plate ? "is-invalid" : ""}
              style={{ textTransform: "uppercase" }}
            />
            {validationErrors.license_plate && (
              <div className="invalid-feedback">
                {validationErrors.license_plate}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={vehiclesLoading || !formData.customer}
          >
            {vehiclesLoading ? "Creating..." : "Create Vehicle"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
