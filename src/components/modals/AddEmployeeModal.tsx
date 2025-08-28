import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import type { EmployeeFormData } from "../../types/entities";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchShops, createEmployee } from "../../store/slices/autoRepairsSlice";

interface AddEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (employee: EmployeeFormData) => void;
  shopId?: number; // Pre-select shop if provided
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  show,
  onHide,
  onSuccess,
  shopId,
}) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux state
  const { 
    shops,
    loading: { shops: shopsLoading, employees: employeesLoading },
    error: { employees: employeesError }
  } = useAppSelector((state) => state.autoRepairs);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    shop: shopId || 0,
    name: "",
    role: "",
    phone_number: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Update error when Redux error changes
  useEffect(() => {
    if (employeesError) {
      setError(employeesError);
    }
  }, [employeesError]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "shop" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Transform EmployeeFormData to CreateEmployeeData format
      const createData = {
        shop: formData.shop,
        name: formData.name,
        role: formData.role,
        phone_number: formData.phone_number,
        email: formData.email || null
      };
      
      const result = await dispatch(createEmployee(createData));
      if (createEmployee.fulfilled.match(result)) {
        onSuccess(result.payload as unknown as EmployeeFormData);
        handleClose();
      } else {
        // Error handled by Redux error state and useEffect above
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    }
  };

  const handleClose = () => {
    setFormData({
      shop: shopId || 0,
      name: "",
      role: "",
      phone_number: "",
      email: "",
    });
    setError(null);
    onHide();
  };

  const roles = [
    "Mechanic",
    "Receptionist",
    "Manager",
    "Service Advisor",
    "Parts Specialist",
    "Technician",
    "Inspector",
    "Other",
  ];

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Employee</Modal.Title>
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
            <Form.Label>Employee Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter employee full name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role *</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
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
            disabled={employeesLoading || !formData.shop}
          >
            {employeesLoading ? "Creating..." : "Create Employee"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
