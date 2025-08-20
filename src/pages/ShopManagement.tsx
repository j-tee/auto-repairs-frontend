import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  isActive: boolean;
  employeeCount: number;
  revenue: number;
  createdAt: string;
}

export const ShopManagement: React.FC = () => {
  const { user, canManageShops } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!canManageShops()) {
      setError("Access denied. Owner privileges required for shop management.");
      setLoading(false);
      return;
    }
    loadShops();
  }, [canManageShops]);

  const loadShops = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockShops: Shop[] = [
        {
          id: "1",
          name: "Downtown Auto Repair",
          address: "123 Main St, Downtown",
          phone: "(555) 123-4567",
          email: "downtown@autorepairs.com",
          manager: "John Smith",
          isActive: true,
          employeeCount: 8,
          revenue: 125000,
          createdAt: "2023-01-15",
        },
        {
          id: "2",
          name: "Westside Service Center",
          address: "456 West Ave, Westside",
          phone: "(555) 234-5678",
          email: "westside@autorepairs.com",
          manager: "Jane Doe",
          isActive: true,
          employeeCount: 5,
          revenue: 98000,
          createdAt: "2023-03-22",
        },
      ];
      setShops(mockShops);
    } catch (err) {
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  if (!canManageShops()) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>
            You don't have permission to access shop management. Owner
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
        <p className="mt-2">Loading shop management...</p>
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
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">🏪 Shop Management</h1>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              ➕ Add New Shop
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{shops.length}</h3>
              <p className="mb-0">Total Shops</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">
                {shops.filter((s) => s.isActive).length}
              </h3>
              <p className="mb-0">Active Shops</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">
                {shops.reduce((sum, s) => sum + s.employeeCount, 0)}
              </h3>
              <p className="mb-0">Total Employees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">
                ${shops.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()}
              </h3>
              <p className="mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Shops Table */}
      <Card>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <strong>{shop.name}</strong>
                  </td>
                  <td>{shop.address}</td>
                  <td>
                    <div>
                      <div>{shop.phone}</div>
                      <small className="text-muted">{shop.email}</small>
                    </div>
                  </td>
                  <td>{shop.manager}</td>
                  <td>
                    <Badge bg="info">{shop.employeeCount}</Badge>
                  </td>
                  <td>${shop.revenue.toLocaleString()}</td>
                  <td>
                    <Badge bg={shop.isActive ? "success" : "danger"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button variant="outline-info" size="sm">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Shop Modal - Placeholder */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>🏪 Add New Shop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Shop creation form would go here...</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Create Shop</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
