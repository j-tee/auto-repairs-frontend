import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { userMngtService } from "../services/userMngtService";
import type { PasswordPolicy } from "../types/userManagement";

export const SystemSettings: React.FC = () => {
  const { hasPermission } = useAuth();
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    preventReuse: 5,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission("owner")) {
      setError("Access denied. Owner privileges required.");
      return;
    }

    loadPasswordPolicy();
  }, [hasPermission]);

  const loadPasswordPolicy = async () => {
    setLoading(true);
    try {
      const policy = await userMngtService.getPasswordPolicy();
      setPasswordPolicy(policy);
    } catch (err) {
      setError("Failed to load password policy");
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (field: keyof PasswordPolicy, value: any) => {
    setPasswordPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePasswordPolicy = async () => {
    setSaving(true);
    setError(null);

    try {
      await userMngtService.updatePasswordPolicy(passwordPolicy);
      setSuccessMessage("Password policy updated successfully");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update password policy");
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission("owner")) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>
            You don't have permission to access system settings. Owner
            privileges are required.
          </p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading system settings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">⚙️ System Settings</h1>
          <p className="text-muted">
            Configure system-wide settings and policies
          </p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="password-policy" className="mb-4">
        <Tab eventKey="password-policy" title="🔒 Password Policy">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Password Security Policy</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Password Length</Form.Label>
                    <Form.Control
                      type="number"
                      min="6"
                      max="50"
                      value={passwordPolicy.minLength}
                      onChange={(e) =>
                        handlePolicyChange(
                          "minLength",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Form.Text className="text-muted">
                      Minimum number of characters required (6-50)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password Expiry (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="365"
                      value={passwordPolicy.passwordExpiry}
                      onChange={(e) =>
                        handlePolicyChange(
                          "passwordExpiry",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Form.Text className="text-muted">
                      Days before password expires (0 = never expires)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prevent Password Reuse</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="20"
                      value={passwordPolicy.preventReuse}
                      onChange={(e) =>
                        handlePolicyChange(
                          "preventReuse",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Form.Text className="text-muted">
                      Number of previous passwords to remember (0 = allow reuse)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password Requirements</Form.Label>
                    <div className="mt-2">
                      <Form.Check
                        type="checkbox"
                        id="requireUppercase"
                        label="Require uppercase letters (A-Z)"
                        checked={passwordPolicy.requireUppercase}
                        onChange={(e) =>
                          handlePolicyChange(
                            "requireUppercase",
                            e.target.checked
                          )
                        }
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="requireLowercase"
                        label="Require lowercase letters (a-z)"
                        checked={passwordPolicy.requireLowercase}
                        onChange={(e) =>
                          handlePolicyChange(
                            "requireLowercase",
                            e.target.checked
                          )
                        }
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="requireNumbers"
                        label="Require numbers (0-9)"
                        checked={passwordPolicy.requireNumbers}
                        onChange={(e) =>
                          handlePolicyChange("requireNumbers", e.target.checked)
                        }
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="requireSpecialChars"
                        label="Require special characters (!@#$%^&*)"
                        checked={passwordPolicy.requireSpecialChars}
                        onChange={(e) =>
                          handlePolicyChange(
                            "requireSpecialChars",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Password Policy Preview */}
              <Row className="mt-4">
                <Col md={12}>
                  <Card className="bg-light">
                    <Card.Header>
                      <h6 className="mb-0">Policy Preview</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="mb-0">
                        <li>
                          Minimum {passwordPolicy.minLength} characters long
                        </li>
                        {passwordPolicy.requireUppercase && (
                          <li>Must contain uppercase letters</li>
                        )}
                        {passwordPolicy.requireLowercase && (
                          <li>Must contain lowercase letters</li>
                        )}
                        {passwordPolicy.requireNumbers && (
                          <li>Must contain numbers</li>
                        )}
                        {passwordPolicy.requireSpecialChars && (
                          <li>Must contain special characters</li>
                        )}
                        {passwordPolicy.passwordExpiry > 0 && (
                          <li>
                            Expires every {passwordPolicy.passwordExpiry} days
                          </li>
                        )}
                        {passwordPolicy.preventReuse > 0 && (
                          <li>
                            Cannot reuse last {passwordPolicy.preventReuse}{" "}
                            passwords
                          </li>
                        )}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={12}>
                  <Button
                    variant="primary"
                    onClick={handleSavePasswordPolicy}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      "💾 Save Password Policy"
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="security" title="🔐 Security Settings">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Security Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h6>🚧 Coming Soon</h6>
                <p className="mb-0">
                  Advanced security settings including session timeout, IP
                  restrictions, and two-factor authentication policies will be
                  available in a future update.
                </p>
              </Alert>

              <Row>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>🕐 Session Management</h6>
                      <p className="small text-muted mb-0">
                        Configure session timeout, concurrent sessions, and
                        automatic logout policies.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>🌐 IP Restrictions</h6>
                      <p className="small text-muted mb-0">
                        Set up IP whitelisting and geo-blocking for enhanced
                        security.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>🔐 Two-Factor Authentication</h6>
                      <p className="small text-muted mb-0">
                        Configure 2FA requirements and supported authentication
                        methods.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>📊 Audit Logging</h6>
                      <p className="small text-muted mb-0">
                        Configure detailed logging for security events and user
                        activities.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="notifications" title="📧 Notifications">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h6>🚧 Coming Soon</h6>
                <p className="mb-0">
                  Email templates, notification preferences, and automated
                  alerts configuration will be available in a future update.
                </p>
              </Alert>

              <Row>
                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>📧 Email Templates</h6>
                      <p className="small text-muted mb-0">
                        Customize welcome emails, password reset notifications,
                        and system alerts.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>⚠️ System Alerts</h6>
                      <p className="small text-muted mb-0">
                        Configure automatic notifications for system events and
                        errors.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>📱 SMS Configuration</h6>
                      <p className="small text-muted mb-0">
                        Set up SMS notifications for critical alerts and 2FA
                        codes.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="backup" title="💾 Backup & Recovery">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Backup and Recovery</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h6>🚧 Coming Soon</h6>
                <p className="mb-0">
                  Automated backup scheduling, data export/import tools, and
                  disaster recovery configuration will be available in a future
                  update.
                </p>
              </Alert>

              <Row>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>⏰ Automated Backups</h6>
                      <p className="small text-muted mb-0">
                        Schedule regular database backups and configure
                        retention policies.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>📤 Data Export</h6>
                      <p className="small text-muted mb-0">
                        Export system data in various formats for analysis or
                        migration.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};
