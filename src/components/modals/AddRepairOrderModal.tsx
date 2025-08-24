import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Table,
  InputGroup,
  Badge,
} from "react-bootstrap";
import type {
  RepairOrderFormData,
  Vehicle,
  Service,
  Part,
} from "../../types/entities";
import { apiPost, apiGet } from "../../utils/api";

interface AddRepairOrderModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (repairOrder: any) => void;
  vehicleId?: number; // Pre-select vehicle if provided
}

interface SelectedPart {
  part: Part;
  quantity: number;
  warranty_override_months?: number;
}

export const AddRepairOrderModal: React.FC<AddRepairOrderModalProps> = ({
  show,
  onHide,
  onSuccess,
  vehicleId,
}) => {
  const [formData, setFormData] = useState<RepairOrderFormData>({
    vehicle: vehicleId || 0,
    services: [],
    parts: [],
    discount_amount: 0,
    discount_percent: 0,
    tax_percent: 8.25, // Default tax rate
    notes: "",
  });

  const [vehicles, setVehicles] = useState<
    (Vehicle & { customer_name: string })[]
  >([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      loadData();
    }
  }, [show]);

  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicle: vehicleId }));
    }
  }, [vehicleId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [vehiclesResponse, servicesResponse, partsResponse] =
        await Promise.all([
          apiGet<Vehicle[]>("/shop/vehicles/"),
          apiGet<Service[]>("/shop/services/"),
          apiGet<Part[]>("/shop/parts/"),
        ]);

      // ✅ Backend now provides customer_name directly - no need for manual combination!
      setVehicles(vehiclesResponse as (Vehicle & { customer_name: string })[]);
      setAvailableServices(servicesResponse);
      setAvailableParts(partsResponse.filter((p) => p.stock_quantity > 0)); // Only show parts in stock
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "vehicle"
          ? parseInt(value) || 0
          : ["discount_amount", "discount_percent", "tax_percent"].includes(
              name
            )
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const addService = (serviceId: number) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (service && !selectedServices.find((s) => s.id === serviceId)) {
      setSelectedServices((prev) => [...prev, service]);
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, serviceId],
      }));
    }
  };

  const removeService = (serviceId: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((id) => id !== serviceId),
    }));
  };

  const addPart = (partId: number, quantity: number = 1) => {
    const part = availableParts.find((p) => p.id === partId);
    if (part && quantity > 0 && quantity <= part.stock_quantity) {
      const existingIndex = selectedParts.findIndex(
        (sp) => sp.part.id === partId
      );

      if (existingIndex >= 0) {
        // Update existing part quantity
        const newSelectedParts = [...selectedParts];
        newSelectedParts[existingIndex].quantity = quantity;
        setSelectedParts(newSelectedParts);
      } else {
        // Add new part
        setSelectedParts((prev) => [...prev, { part, quantity }]);
      }

      updatePartsInFormData();
    }
  };

  const removePart = (partId: number) => {
    setSelectedParts((prev) => prev.filter((sp) => sp.part.id !== partId));
    updatePartsInFormData();
  };

  const updatePartsInFormData = () => {
    setFormData((prev) => ({
      ...prev,
      parts: selectedParts.map((sp) => ({
        part: sp.part.id!,
        quantity: sp.quantity,
        warranty_override_months: sp.warranty_override_months,
      })),
    }));
  };

  const calculateSubtotal = () => {
    const servicesTotal = selectedServices.reduce(
      (sum, service) => sum + parseFloat(service.labor_cost),
      0
    );
    const partsTotal = selectedParts.reduce(
      (sum, sp) => sum + parseFloat(sp.part.unit_price) * sp.quantity,
      0
    );
    return servicesTotal + partsTotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = formData.discount_percent || 0;
    const discountAmount = formData.discount_amount || 0;
    const taxPercent = formData.tax_percent || 0;

    const discount =
      discountPercent > 0 ? (subtotal * discountPercent) / 100 : discountAmount;
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * taxPercent) / 100;
    return afterDiscount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update parts data before submitting
      const finalFormData = {
        ...formData,
        parts: selectedParts.map((sp) => ({
          part: sp.part.id!,
          quantity: sp.quantity,
          warranty_override_months: sp.warranty_override_months,
        })),
      };

      const response = await apiPost("/shop/repair-orders/", finalFormData);
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create repair order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicle: vehicleId || 0,
      services: [],
      parts: [],
      discount_amount: 0,
      discount_percent: 0,
      tax_percent: 8.25,
      notes: "",
    });
    setSelectedServices([]);
    setSelectedParts([]);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Create New Repair Order</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Vehicle Selection */}
          <Form.Group className="mb-4">
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

          {/* Services Section */}
          <div className="mb-4">
            <h5>Services</h5>
            <Form.Group className="mb-3">
              <Form.Label>Add Service</Form.Label>
              <Form.Select
                onChange={(e) =>
                  e.target.value && addService(parseInt(e.target.value))
                }
                value=""
              >
                <option value="">Select a service to add</option>
                {availableServices
                  .filter(
                    (service) =>
                      !selectedServices.find((s) => s.id === service.id)
                  )
                  .map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.labor_cost}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            {selectedServices.length > 0 && (
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Cost</th>
                    <th>Taxable</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedServices.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>${service.labor_cost}</td>
                      <td>
                        {service.taxable ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="secondary">No</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeService(service.id!)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* Parts Section */}
          <div className="mb-4">
            <h5>Parts</h5>
            <Form.Group className="mb-3">
              <Form.Label>Add Part</Form.Label>
              <Form.Select
                onChange={(e) =>
                  e.target.value && addPart(parseInt(e.target.value))
                }
                value=""
              >
                <option value="">Select a part to add</option>
                {availableParts
                  .filter(
                    (part) =>
                      !selectedParts.find((sp) => sp.part.id === part.id)
                  )
                  .map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name} - ${part.unit_price} (Stock:{" "}
                      {part.stock_quantity})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            {selectedParts.length > 0 && (
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedParts.map((selectedPart) => (
                    <tr key={selectedPart.part.id}>
                      <td>{selectedPart.part.name}</td>
                      <td>${selectedPart.part.unit_price}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={selectedPart.quantity}
                          min="1"
                          max={selectedPart.part.stock_quantity}
                          onChange={(e) =>
                            addPart(
                              selectedPart.part.id!,
                              parseInt(e.target.value) || 1
                            )
                          }
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td>
                        $
                        {(
                          parseFloat(selectedPart.part.unit_price) *
                          selectedPart.quantity
                        ).toFixed(2)}
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removePart(selectedPart.part.id!)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* Pricing Section */}
          <div className="row mb-4">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Discount Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="discount_amount"
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    disabled={(formData.discount_percent || 0) > 0}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Discount Percent</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="discount_percent"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={(formData.discount_amount || 0) > 0}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Tax Percent</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="tax_percent"
                    value={formData.tax_percent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="mb-4 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <strong>Subtotal: ${calculateSubtotal().toFixed(2)}</strong>
              </div>
              <div className="col-md-6 text-end">
                <strong>Total: ${calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about this repair order..."
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
            disabled={
              loading ||
              !formData.vehicle ||
              (selectedServices.length === 0 && selectedParts.length === 0)
            }
          >
            {loading ? "Creating..." : "Create Repair Order"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
