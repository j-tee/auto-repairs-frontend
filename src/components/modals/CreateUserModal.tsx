import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { UserManagementAPI } from "../../services/userManagementAPI";
import type { CreateUserData } from "../../types/userManagement";
import type { User } from "../../store/slices/authSlice";

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (user: any) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
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
    sendWelcomeEmail: true,
    temporaryPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (
      formData.employeeId &&
      formData.role !== "customer" &&
      !formData.employeeId.trim()
    ) {
      errors.employeeId = "Employee ID is required for staff members";
    }

    if (formData.hireDate && new Date(formData.hireDate) > new Date()) {
      errors.hireDate = "Hire date cannot be in the future";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserData, value: any) => {
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
      const userData = { ...formData };

      // Generate temporary password if not provided
      if (!userData.temporaryPassword) {
        userData.temporaryPassword = generateTemporaryPassword();
      }

      const newUser = await UserManagementAPI.createUser(userData);
      onSuccess(newUser);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const generateTemporaryPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleClose = () => {
    setFormData({
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
      sendWelcomeEmail: true,
      temporaryPassword: "",
    });
    setValidationErrors({});
    setError(null);
    onHide();
  };

  const isStaffRole = ["owner", "employee"].includes(formData.role);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>👥 Create New User</Modal.Title>
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
                  placeholder="user@company.com"
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
                  placeholder="John"
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
                  placeholder="Doe"
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
                  placeholder="+1 (555) 123-4567"
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
                  value={formData.isActive.toString()}
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
                    <Form.Label>Employee ID {isStaffRole && "*"}</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                      isInvalid={!!validationErrors.employeeId}
                      placeholder="EMP001"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.employeeId}
                    </Form.Control.Feedback>
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
                      placeholder="Service Department"
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
                      placeholder="Manager Name"
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
                  placeholder="123 Main St, City, State, ZIP"
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
                  placeholder="Additional notes about the user..."
                />
              </Form.Group>
            </Col>

            {/* Password and Email Options */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Temporary Password</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.temporaryPassword}
                  onChange={(e) =>
                    handleInputChange("temporaryPassword", e.target.value)
                  }
                  placeholder="Leave empty to auto-generate"
                />
                <Form.Text className="text-muted">
                  User will be required to change this on first login
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Options</Form.Label>
                <Form.Check
                  type="checkbox"
                  id="sendWelcomeEmail"
                  label="Send welcome email with login credentials"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) =>
                    handleInputChange("sendWelcomeEmail", e.target.checked)
                  }
                />
              </Form.Group>
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
                Creating User...
              </>
            ) : (
              "👥 Create User"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
