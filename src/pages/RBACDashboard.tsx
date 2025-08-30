import React from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import {
  PermissionGuard,
  OwnerOnly,
  EmployeeOnly,
  CustomerOnly,
} from "../components/PermissionGuard";

export const RBACDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to access the dashboard.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                Welcome back, {user.first_name || user.email}! 👋
              </h1>
              <p className="text-muted mb-0">
                Role:{" "}
                <span className="badge bg-primary">
                  {user.role.toUpperCase()}
                </span>
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Last login:{" "}
                {user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "First time"}
              </small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Owner Dashboard */}
      <OwnerOnly>
        <Alert variant="info" className="mb-4">
          <strong>Owner Dashboard:</strong> You have full access to all system
          features including shop management, financial reports, and user
          administration.
        </Alert>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">2</h3>
                <p className="mb-0">Total Shops</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">13</h3>
                <p className="mb-0">Total Employees</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">$450K</h3>
                <p className="mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">125</h3>
                <p className="mb-0">Active Customers</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>🏪 Shop Performance</Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Downtown Auto Repair</strong>
                  <div className="d-flex justify-content-between">
                    <span>Revenue: $275K</span>
                    <span className="text-success">📈 +15%</span>
                  </div>
                </div>
                <div>
                  <strong>Westside Service Center</strong>
                  <div className="d-flex justify-content-between">
                    <span>Revenue: $175K</span>
                    <span className="text-success">📈 +8%</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>💰 Financial Summary</Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span>Monthly Revenue:</span>
                    <strong className="text-success">$52K</strong>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span>Monthly Expenses:</span>
                    <strong className="text-warning">$35K</strong>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between">
                    <span>Net Profit:</span>
                    <strong className="text-primary">$17K</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </OwnerOnly>

      {/* Employee Dashboard */}
      <EmployeeOnly fallback={<></>}>
        <PermissionGuard role="employee">
          <Alert variant="primary" className="mb-4">
            <strong>Employee Dashboard:</strong> You can manage daily
            operations, customers, and inventory for your shop.
          </Alert>

          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">24</h3>
                  <p className="mb-0">Pending Repairs</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">18</h3>
                  <p className="mb-0">Completed Today</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">8</h3>
                  <p className="mb-0">Waiting Parts</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-danger">3</h3>
                  <p className="mb-0">Overdue</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>🔧 Today's Schedule</Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>9:00 AM</strong> - Oil change (Toyota Camry)
                  </div>
                  <div className="mb-2">
                    <strong>10:30 AM</strong> - Brake inspection (Honda Civic)
                  </div>
                  <div className="mb-2">
                    <strong>2:00 PM</strong> - Engine diagnostic (Ford F-150)
                  </div>
                  <div>
                    <strong>3:30 PM</strong> - Transmission service (BMW X5)
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>📦 Inventory Alerts</Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <span className="badge bg-warning me-2">Low Stock</span>
                    Engine Oil (5W-30) - 8 units left
                  </div>
                  <div className="mb-2">
                    <span className="badge bg-danger me-2">Critical</span>
                    Brake Pads (Toyota) - 2 units left
                  </div>
                  <div>
                    <span className="badge bg-info me-2">Reorder</span>
                    Air Filters - Need to reorder
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </PermissionGuard>
      </EmployeeOnly>

      {/* Customer Dashboard */}
      <CustomerOnly>
        <Alert variant="success" className="mb-4">
          <strong>Customer Portal:</strong> Track your vehicle repairs and
          schedule new appointments.
        </Alert>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">2</h3>
                <p className="mb-0">My Vehicles</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">1</h3>
                <p className="mb-0">Active Repairs</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">8</h3>
                <p className="mb-0">Completed Services</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">$1,245</h3>
                <p className="mb-0">Total Spent</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>🚗 My Vehicles</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>2019 Honda Civic</strong>
                  <div className="text-muted">License: ABC-1234</div>
                  <small className="text-success">✅ Up to date</small>
                </div>
                <div>
                  <strong>2021 Toyota RAV4</strong>
                  <div className="text-muted">License: XYZ-5678</div>
                  <small className="text-warning">
                    ⚠️ Service due in 2 weeks
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>🔧 Recent Services</Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Oil Change</strong> - Honda Civic
                  <div className="text-muted">Completed 2 weeks ago</div>
                </div>
                <div className="mb-2">
                  <strong>Brake Inspection</strong> - Toyota RAV4
                  <div className="text-warning">In Progress</div>
                </div>
                <div>
                  <strong>Tire Rotation</strong> - Honda Civic
                  <div className="text-muted">Completed last month</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </CustomerOnly>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>⚡ Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                <PermissionGuard role="owner">
                  <button className="btn btn-primary btn-sm">
                    👥 Manage Users
                  </button>
                  <button className="btn btn-success btn-sm">
                    🏪 Manage Shops
                  </button>
                  <button className="btn btn-info btn-sm">
                    💰 View Reports
                  </button>
                </PermissionGuard>

                <PermissionGuard role="employee">
                  <button className="btn btn-warning btn-sm">
                    🔧 New Repair
                  </button>
                  <button className="btn btn-info btn-sm">
                    👥 View Customers
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    📦 Check Inventory
                  </button>
                </PermissionGuard>

                <PermissionGuard role="customer">
                  <button className="btn btn-primary btn-sm">
                    📅 Book Appointment
                  </button>
                  <button className="btn btn-success btn-sm">
                    🚗 Add Vehicle
                  </button>
                  <button className="btn btn-info btn-sm">
                    📋 View History
                  </button>
                </PermissionGuard>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
