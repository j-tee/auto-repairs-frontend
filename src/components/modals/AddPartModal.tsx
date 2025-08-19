import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import type { PartFormData, Shop } from "../../types/entities";
import { apiPost, apiGet } from "../../utils/api";

interface AddPartModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (part: any) => void;
  shopId?: number; // Pre-select shop if provided
}

export const AddPartModal: React.FC<AddPartModalProps> = ({
  show,
  onHide,
  onSuccess,
  shopId,
}) => {
  const [formData, setFormData] = useState<PartFormData>({
    shop: shopId || 0,
    name: "",
    category: "new",
    part_number: "",
    description: "",
    manufacturer: "",
    unit_price: 0,
    taxable: true,
    warranty_months: 0,
    stock_quantity: 0,
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      loadShops();
    }
  }, [show]);

  useEffect(() => {
    if (shopId) {
      setFormData((prev) => ({ ...prev, shop: shopId }));
    }
  }, [shopId]);

  const loadShops = async () => {
    setLoadingShops(true);
    try {
      const response = await apiGet<Shop[]>("/shops/");
      setShops(response);
    } catch (err) {
      setError("Failed to load shops");
    } finally {
      setLoadingShops(false);
    }
  };

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
          name === "shop" ||
          name === "warranty_months" ||
          name === "stock_quantity"
            ? parseInt(value) || 0
            : name === "unit_price"
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
      const response = await apiPost("/parts/", formData);
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create part");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      shop: shopId || 0,
      name: "",
      category: "new",
      part_number: "",
      description: "",
      manufacturer: "",
      unit_price: 0,
      taxable: true,
      warranty_months: 0,
      stock_quantity: 0,
    });
    setError(null);
    onHide();
  };

  const categories = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "refurbished", label: "Refurbished" },
  ];

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Part</Modal.Title>
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
              disabled={!!shopId || loadingShops}
            >
              <option value="">
                {loadingShops ? "Loading shops..." : "Select a shop"}
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="row">
            <div className="col-md-8">
              <Form.Group className="mb-3">
                <Form.Label>Part Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Brake Pads, Oil Filter"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Part Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleInputChange}
                  required
                  placeholder="Unique part number"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Manufacturer</Form.Label>
                <Form.Control
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota, Bosch, ACDelco"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the part"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Unit Price *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
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
              label="This part is taxable"
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
            {loading ? "Creating..." : "Create Part"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
