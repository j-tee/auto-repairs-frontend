import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { EmployeeFormData, Shop } from '../../types/entities';
import { apiPost, apiGet } from '../../utils/api';

interface AddEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (employee: any) => void;
  shopId?: number; // Pre-select shop if provided
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  show,
  onHide,
  onSuccess,
  shopId,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    shop: shopId || 0,
    name: '',
    role: '',
    phone_number: '',
    email: '',
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
      setFormData(prev => ({ ...prev, shop: shopId }));
    }
  }, [shopId]);

  const loadShops = async () => {
    setLoadingShops(true);
    try {
      const response = await apiGet<Shop[]>('/shops/');
      setShops(response);
    } catch (err) {
      setError('Failed to load shops');
    } finally {
      setLoadingShops(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shop' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost('/employees/', formData);
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      shop: shopId || 0,
      name: '',
      role: '',
      phone_number: '',
      email: '',
    });
    setError(null);
    onHide();
  };

  const roles = [
    'Mechanic',
    'Receptionist',
    'Manager',
    'Service Advisor',
    'Parts Specialist',
    'Technician',
    'Inspector',
    'Other'
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
              disabled={!!shopId || loadingShops}
            >
              <option value="">
                {loadingShops ? 'Loading shops...' : 'Select a shop'}
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
          <Button variant="primary" type="submit" disabled={loading || !formData.shop}>
            {loading ? 'Creating...' : 'Create Employee'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
