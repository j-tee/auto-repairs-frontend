import React, { useState, useEffect } from "react";
import {
  Modal,
  Row,
  Col,
  Badge,
  Button,
  Card,
  Tab,
  Tabs,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import { UserManagementAPI } from "../../services/userManagementAPI";
import type {
  AdminUser,
  UserActivityLog,
  UserSession,
} from "../../types/userManagement";

interface UserDetailsModalProps {
  show: boolean;
  onHide: () => void;
  user: AdminUser | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  show,
  onHide,
  user,
}) => {
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && show) {
      loadUserDetails();
    }
  }, [user, show]);

  const loadUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [logs, sessions, userPermissions] = await Promise.all([
        UserManagementAPI.getUserActivityLogs(user.id, 20),
        UserManagementAPI.getUserSessions(user.id),
        UserManagementAPI.getUserPermissions(user.id),
      ]);

      setActivityLogs(logs.logs);
      setUserSessions(sessions);
      setPermissions(userPermissions);
    } catch (err: any) {
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "manager":
        return "warning";
      case "mechanic":
        return "info";
      case "customer":
        return "secondary";
      default:
        return "light";
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "login":
        return "success";
      case "logout":
        return "secondary";
      case "password_change":
        return "warning";
      case "profile_update":
        return "info";
      case "role_change":
        return "primary";
      case "activation":
        return "success";
      case "deactivation":
        return "danger";
      default:
        return "light";
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to terminate this session?")) {
      return;
    }

    try {
      await UserManagementAPI.terminateUserSession(sessionId);
      await loadUserDetails(); // Refresh the sessions
    } catch (err) {
      setError("Failed to terminate session");
    }
  };

  const sendWelcomeEmail = async () => {
    if (!user) return;

    try {
      await UserManagementAPI.sendWelcomeEmail(user.id);
      // You might want to show a success message here
    } catch (err) {
      setError("Failed to send welcome email");
    }
  };

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          👤 User Details - {user.firstName} {user.lastName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Row>
              {/* Basic Information */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Basic Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Full Name:</strong>
                      </Col>
                      <Col sm={8}>
                        {user.firstName} {user.lastName}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Email:</strong>
                      </Col>
                      <Col sm={8}>
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Role:</strong>
                      </Col>
                      <Col sm={8}>
                        <Badge bg={getRoleBadgeVariant(user.role)}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Status:</strong>
                      </Col>
                      <Col sm={8}>
                        <Badge bg={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Col>
                    </Row>
                    {user.phone && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Phone:</strong>
                        </Col>
                        <Col sm={8}>
                          <a href={`tel:${user.phone}`}>{user.phone}</a>
                        </Col>
                      </Row>
                    )}
                    {user.address && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Address:</strong>
                        </Col>
                        <Col sm={8}>{user.address}</Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Employment Information */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Employment Information</h6>
                  </Card.Header>
                  <Card.Body>
                    {user.employeeId && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Employee ID:</strong>
                        </Col>
                        <Col sm={8}>
                          <code>{user.employeeId}</code>
                        </Col>
                      </Row>
                    )}
                    {user.department && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Department:</strong>
                        </Col>
                        <Col sm={8}>{user.department}</Col>
                      </Row>
                    )}
                    {user.manager && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Manager:</strong>
                        </Col>
                        <Col sm={8}>{user.manager}</Col>
                      </Row>
                    )}
                    {user.hireDate && (
                      <Row className="mb-2">
                        <Col sm={4}>
                          <strong>Hire Date:</strong>
                        </Col>
                        <Col sm={8}>
                          {new Date(user.hireDate).toLocaleDateString()}
                        </Col>
                      </Row>
                    )}
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Created:</strong>
                      </Col>
                      <Col sm={8}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={4}>
                        <strong>Last Login:</strong>
                      </Col>
                      <Col sm={8}>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Security Information */}
              <Col md={12}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Security Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <strong>Login Attempts:</strong>
                        <br />
                        <span
                          className={
                            user.loginAttempts && user.loginAttempts > 3
                              ? "text-danger"
                              : "text-success"
                          }
                        >
                          {user.loginAttempts || 0}
                        </span>
                      </Col>
                      <Col md={3}>
                        <strong>2FA Enabled:</strong>
                        <br />
                        <Badge
                          bg={user.twoFactorEnabled ? "success" : "warning"}
                        >
                          {user.twoFactorEnabled ? "Yes" : "No"}
                        </Badge>
                      </Col>
                      <Col md={3}>
                        <strong>Password Changed:</strong>
                        <br />
                        {user.lastPasswordChange
                          ? new Date(
                              user.lastPasswordChange
                            ).toLocaleDateString()
                          : "Unknown"}
                      </Col>
                      <Col md={3}>
                        <strong>Password Expires:</strong>
                        <br />
                        {user.passwordExpiresAt
                          ? new Date(
                              user.passwordExpiresAt
                            ).toLocaleDateString()
                          : "Never"}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Notes */}
              {user.notes && (
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">Notes</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-0">{user.notes}</p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </Tab>

          <Tab eventKey="activity" title="Activity Log">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Loading activity logs...</p>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-5">
                <p>No activity logs found for this user.</p>
              </div>
            ) : (
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <Badge bg={getActionBadgeVariant(log.action)}>
                          {log.action.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td>{log.details || "-"}</td>
                      <td>
                        <code>{log.ipAddress || "-"}</code>
                      </td>
                      <td>{log.performedBy || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          <Tab eventKey="sessions" title="Active Sessions">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Loading sessions...</p>
              </div>
            ) : userSessions.length === 0 ? (
              <div className="text-center py-5">
                <p>No active sessions found for this user.</p>
              </div>
            ) : (
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Login Time</th>
                    <th>Last Activity</th>
                    <th>IP Address</th>
                    <th>Device/Browser</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userSessions.map((session) => (
                    <tr key={session.id}>
                      <td>{new Date(session.loginTime).toLocaleString()}</td>
                      <td>{new Date(session.lastActivity).toLocaleString()}</td>
                      <td>
                        <code>{session.ipAddress}</code>
                      </td>
                      <td>
                        <small>{session.userAgent?.substring(0, 50)}...</small>
                        {session.device && (
                          <>
                            <br />
                            <Badge bg="info" className="mt-1">
                              {session.device}
                            </Badge>
                          </>
                        )}
                      </td>
                      <td>{session.location || "Unknown"}</td>
                      <td>
                        <Badge bg={session.isActive ? "success" : "secondary"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        {session.isActive && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            Terminate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          <Tab eventKey="permissions" title="Permissions">
            <Row>
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">User Permissions</h6>
                  </Card.Header>
                  <Card.Body>
                    {permissions.length === 0 ? (
                      <p className="text-muted">
                        No specific permissions assigned. Using role-based
                        permissions.
                      </p>
                    ) : (
                      <div>
                        {permissions.map((permission, index) => (
                          <Badge key={index} bg="info" className="me-2 mb-2">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-primary" onClick={sendWelcomeEmail}>
          📧 Send Welcome Email
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
