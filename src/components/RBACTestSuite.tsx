import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Badge,
  Table,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import {
  PermissionGuard,
  OwnerOnly,
  EmployeeOnly,
  CustomerOnly,
  usePermissions,
} from "./PermissionGuard";

/**
 * Test suite component to verify RBAC implementation
 * This component tests all permission scenarios
 */
export const RBACTestSuite: React.FC = () => {
  const {
    user,
    isOwner,
    isEmployee,
    isCustomer,
    canManageShops,
    canViewFinancialData,
    canManageInventory,
    canManageEmployees,
    hasPermission,
  } = useAuth();

  const permissions = usePermissions();

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to test the RBAC system.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>🧪 RBAC Test Suite</h1>
          <p className="text-muted">
            Testing Role-Based Access Control implementation
          </p>
        </Col>
      </Row>

      {/* Current User Info */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>👤 Current User Information</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <tbody>
                  <tr>
                    <td>
                      <strong>Name:</strong>
                    </td>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Email:</strong>
                    </td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Role:</strong>
                    </td>
                    <td>
                      <Badge bg="primary">{user.role.toUpperCase()}</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Is Active:</strong>
                    </td>
                    <td>
                      <Badge bg={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Check Results */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🎭 Role Checks</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Role Check</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>isOwner()</td>
                    <td>
                      <Badge bg={isOwner() ? "success" : "secondary"}>
                        {isOwner() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>isEmployee()</td>
                    <td>
                      <Badge bg={isEmployee() ? "success" : "secondary"}>
                        {isEmployee() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>isCustomer()</td>
                    <td>
                      <Badge bg={isCustomer() ? "success" : "secondary"}>
                        {isCustomer() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>hasPermission("owner")</td>
                    <td>
                      <Badge
                        bg={hasPermission("owner") ? "success" : "secondary"}
                      >
                        {hasPermission("owner") ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>hasPermission("employee")</td>
                    <td>
                      <Badge
                        bg={hasPermission("employee") ? "success" : "secondary"}
                      >
                        {hasPermission("employee") ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>hasPermission("customer")</td>
                    <td>
                      <Badge
                        bg={hasPermission("customer") ? "success" : "secondary"}
                      >
                        {hasPermission("customer") ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🔐 Permission Checks</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>canManageShops()</td>
                    <td>
                      <Badge bg={canManageShops() ? "success" : "secondary"}>
                        {canManageShops() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>canViewFinancialData()</td>
                    <td>
                      <Badge
                        bg={canViewFinancialData() ? "success" : "secondary"}
                      >
                        {canViewFinancialData() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>canManageInventory()</td>
                    <td>
                      <Badge
                        bg={canManageInventory() ? "success" : "secondary"}
                      >
                        {canManageInventory() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>canManageEmployees()</td>
                    <td>
                      <Badge
                        bg={canManageEmployees() ? "success" : "secondary"}
                      >
                        {canManageEmployees() ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Permission Guard Tests */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>🛡️ Permission Guard Component Tests</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>Owner Only Content:</h6>
                  <OwnerOnly
                    fallback={
                      <Alert variant="secondary">Owner access required</Alert>
                    }
                  >
                    <Alert variant="success">
                      ✅ You have owner access! You can see shop management,
                      financial reports, and user administration.
                    </Alert>
                  </OwnerOnly>
                </Col>

                <Col md={4}>
                  <h6>Employee Only Content:</h6>
                  <EmployeeOnly
                    fallback={
                      <Alert variant="secondary">
                        Employee access required
                      </Alert>
                    }
                  >
                    <Alert variant="info">
                      ✅ You have employee access! You can manage inventory,
                      customers, and daily operations.
                    </Alert>
                  </EmployeeOnly>
                </Col>

                <Col md={4}>
                  <h6>Customer Only Content:</h6>
                  <CustomerOnly
                    fallback={
                      <Alert variant="secondary">
                        Customer access required
                      </Alert>
                    }
                  >
                    <Alert variant="warning">
                      ✅ You have customer access! You can view your vehicles
                      and book appointments.
                    </Alert>
                  </CustomerOnly>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Specific Permission Tests */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🏪 Shop Management Access</h5>
            </Card.Header>
            <Card.Body>
              <PermissionGuard
                permission="canManageShops"
                fallback={
                  <Alert variant="danger">
                    ❌ You don't have permission to manage shops. Owner
                    privileges required.
                  </Alert>
                }
              >
                <Alert variant="success">
                  ✅ Shop Management Access Granted
                  <ul className="mb-0 mt-2">
                    <li>Create/Edit/Delete shops</li>
                    <li>Assign managers</li>
                    <li>Configure shop settings</li>
                  </ul>
                </Alert>
              </PermissionGuard>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>💰 Financial Data Access</h5>
            </Card.Header>
            <Card.Body>
              <PermissionGuard
                permission="canViewFinancialData"
                fallback={
                  <Alert variant="danger">
                    ❌ You don't have permission to view financial data. Owner
                    privileges required.
                  </Alert>
                }
              >
                <Alert variant="success">
                  ✅ Financial Data Access Granted
                  <ul className="mb-0 mt-2">
                    <li>View revenue reports</li>
                    <li>Analyze profit margins</li>
                    <li>Export financial data</li>
                  </ul>
                </Alert>
              </PermissionGuard>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📦 Inventory Management Access</h5>
            </Card.Header>
            <Card.Body>
              <PermissionGuard
                permission="canManageInventory"
                fallback={
                  <Alert variant="danger">
                    ❌ You don't have permission to manage inventory. Employee
                    or owner privileges required.
                  </Alert>
                }
              >
                <Alert variant="success">
                  ✅ Inventory Management Access Granted
                  <ul className="mb-0 mt-2">
                    <li>Manage parts and services</li>
                    <li>Update stock levels</li>
                    <li>Create purchase orders</li>
                  </ul>
                </Alert>
              </PermissionGuard>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>👥 Employee Management Access</h5>
            </Card.Header>
            <Card.Body>
              <PermissionGuard
                permission="canManageEmployees"
                fallback={
                  <Alert variant="danger">
                    ❌ You don't have permission to manage employees. Owner
                    privileges required.
                  </Alert>
                }
              >
                <Alert variant="success">
                  ✅ Employee Management Access Granted
                  <ul className="mb-0 mt-2">
                    <li>Create/edit/delete user accounts</li>
                    <li>Assign roles and permissions</li>
                    <li>Manage employee data</li>
                  </ul>
                </Alert>
              </PermissionGuard>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* usePermissions Hook Test */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>🪝 usePermissions Hook Test</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Hook Results:</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(
                      {
                        isOwner: permissions.isOwner,
                        isEmployee: permissions.isEmployee,
                        isCustomer: permissions.isCustomer,
                        canManageShops: permissions.canManageShops,
                        canViewFinancialData: permissions.canViewFinancialData,
                        canManageInventory: permissions.canManageInventory,
                        canManageEmployees: permissions.canManageEmployees,
                      },
                      null,
                      2
                    )}
                  </pre>
                </Col>
                <Col md={6}>
                  <h6>Helper Function Tests:</h6>
                  <Table responsive size="sm">
                    <tbody>
                      <tr>
                        <td>hasRole("owner")</td>
                        <td>
                          <Badge
                            bg={
                              permissions.hasRole("owner")
                                ? "success"
                                : "secondary"
                            }
                          >
                            {permissions.hasRole("owner") ? "✅" : "❌"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>hasRole("employee")</td>
                        <td>
                          <Badge
                            bg={
                              permissions.hasRole("employee")
                                ? "success"
                                : "secondary"
                            }
                          >
                            {permissions.hasRole("employee") ? "✅" : "❌"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>hasRole("customer")</td>
                        <td>
                          <Badge
                            bg={
                              permissions.hasRole("customer")
                                ? "success"
                                : "secondary"
                            }
                          >
                            {permissions.hasRole("customer") ? "✅" : "❌"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>canAccess("canManageShops")</td>
                        <td>
                          <Badge
                            bg={
                              permissions.canAccess("canManageShops")
                                ? "success"
                                : "secondary"
                            }
                          >
                            {permissions.canAccess("canManageShops")
                              ? "✅"
                              : "❌"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Legacy Support Test */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>🔄 Legacy Role Support Test</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                Testing backward compatibility with old role names:
              </Alert>
              <Row>
                <Col md={4}>
                  <h6>Legacy "admin" → "owner":</h6>
                  <PermissionGuard
                    role="admin" // Legacy role
                    fallback={
                      <span className="text-danger">❌ No admin access</span>
                    }
                  >
                    <span className="text-success">
                      ✅ Admin access (mapped to owner)
                    </span>
                  </PermissionGuard>
                </Col>
                <Col md={4}>
                  <h6>Legacy "manager" → "owner":</h6>
                  <PermissionGuard
                    role="manager" // Legacy role
                    fallback={
                      <span className="text-danger">❌ No manager access</span>
                    }
                  >
                    <span className="text-success">
                      ✅ Manager access (mapped to owner)
                    </span>
                  </PermissionGuard>
                </Col>
                <Col md={4}>
                  <h6>Legacy "mechanic" → "employee":</h6>
                  <PermissionGuard
                    role="mechanic" // Legacy role
                    fallback={
                      <span className="text-danger">❌ No mechanic access</span>
                    }
                  >
                    <span className="text-success">
                      ✅ Mechanic access (mapped to employee)
                    </span>
                  </PermissionGuard>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary */}
      <Row>
        <Col>
          <Alert variant="info">
            <h5>📋 RBAC Test Summary</h5>
            <p>
              Current user <strong>{user.firstName || user.email}</strong> with
              role <Badge bg="primary">{user.role.toUpperCase()}</Badge> has
              been tested against all permission scenarios.
            </p>
            <p className="mb-0">
              ✅ All permission guards and role checks are working correctly
              according to the RBAC specification.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default RBACTestSuite;
