import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import type { ServiceFormData } from "../../types/entities";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchShops } from "../../store/slices/autoRepairsSlice";

interface AddServiceModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (service: ServiceFormData) => void;
  shopId?: number; // Pre-select shop if provided
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  show,
  onHide,
  onSuccess,
  shopId,
}) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux state
  const { 
    shops,
    loading: { shops: shopsLoading } 
  } = useAppSelector((state) => state.autoRepairs);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    shop: shopId || 0,
    name: "",
    description: "",
    labor_cost: 0,
    taxable: true,
    warranty_months: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && shops.length === 0) {
      dispatch(fetchShops());
    }
  }, [show, shops.length, dispatch]);

  useEffect(() => {
    if (shopId) {
      setFormData((prev) => ({ ...prev, shop: shopId }));
    }
  }, [shopId]);

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
        [name]:
          name === "shop" || name === "warranty_months"
            ? parseInt(value) || 0
            : name === "labor_cost"
            ? parseFloat(value) || 0
            : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Move to Redux when service management is implemented
      const { apiPost } = await import("../../utils/api");
      const response = await apiPost("/shop/services/", formData);
      onSuccess(response as ServiceFormData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      shop: shopId || 0,
      name: "",
      description: "",
      labor_cost: 0,
      taxable: true,
      warranty_months: 0,
    });
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Service</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Shop *</Form.Label>
            <Form.Select
              name="shop"
              value={formData.shop}
              onChange={handleInputChange}
              required
              disabled={!!shopId || shopsLoading}
            >
              <option value="">
                {shopsLoading ? "Loading shops..." : "Select a shop"}
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Oil Change, Brake Inspection"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the service"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Labor Cost *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="labor_cost"
                    value={formData.labor_cost}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Warranty (Months)</Form.Label>
                <Form.Control
                  type="number"
                  name="warranty_months"
                  value={formData.warranty_months}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="taxable"
              checked={formData.taxable}
              onChange={handleInputChange}
              label="This service is taxable"
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
            disabled={loading || !formData.shop}
          >
            {loading ? "Creating..." : "Create Service"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
