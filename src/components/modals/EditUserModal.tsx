import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import {
  userMngtService,
  type AdminUser,
} from "../../services/userMngtService";
import type { UpdateUserData } from "../../types/userManagement";
import type { User } from "../../types";

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user: AdminUser | null;
  onSuccess: (user: AdminUser) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  onHide,
  user,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "customer",
    phone: "",
    address: "",
    department: "",
    employeeId: "",
    hireDate: "",
    manager: "",
    notes: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (user && show) {
      setFormData({
        id: String(user.id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        department: user.department || "",
        employeeId: user.employeeId || "",
        hireDate: user.hireDate || "",
        manager: user.manager || "",
        notes: user.notes || "",
        isActive: user.isActive,
      });
    }
  }, [user, show]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (formData.hireDate && new Date(formData.hireDate) > new Date()) {
      errors.hireDate = "Hire date cannot be in the future";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = <K extends keyof UpdateUserData>(
    field: K,
    value: UpdateUserData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userMngtService.updateUser(
        formData.id,
        formData
      );
      onSuccess(updatedUser);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    setError(null);
    onHide();
  };

  const isStaffRole = ["owner", "employee"].includes(
    formData.role || "customer"
  );
  if (!user) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          ✏️ Edit User - {user.firstName} {user.lastName}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Basic Information */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  isInvalid={!!validationErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    handleInputChange("role", e.target.value as User["role"])
                  }
                >
                  <option value="customer">Customer</option>
                  <option value="employee">Employee</option>
                  <option value="owner">Owner</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  isInvalid={!!validationErrors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  isInvalid={!!validationErrors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  isInvalid={!!validationErrors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.isActive?.toString()}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.value === "true")
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Staff-specific fields */}
            {isStaffRole && (
              <>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Employee ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hire Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) =>
                        handleInputChange("hireDate", e.target.value)
                      }
                      isInvalid={!!validationErrors.hireDate}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.hireDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.manager}
                      onChange={(e) =>
                        handleInputChange("manager", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* User Statistics */}
          <Row className="mt-3">
            <Col md={12}>
              <div className="bg-light p-3 rounded">
                <h6>User Information</h6>
                <Row>
                  <Col md={4}>
                    <small className="text-muted">User ID:</small>
                    <br />
                    <code>{user.id}</code>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted">Created:</small>
                    <br />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Col>
                  <Col md={4}>
                    <small className="text-muted">Last Login:</small>
                    <br />
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </Col>
                </Row>
                {user.loginAttempts && user.loginAttempts > 0 && (
                  <Row className="mt-2">
                    <Col md={12}>
                      <small className="text-muted">
                        Failed Login Attempts:
                      </small>
                      <br />
                      <span
                        className={
                          user.loginAttempts > 3
                            ? "text-danger"
                            : "text-warning"
                        }
                      >
                        {user.loginAttempts}
                      </span>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating User...
              </>
            ) : (
              "💾 Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
