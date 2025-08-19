import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import type { Customer, Vehicle } from '../types/entities';
import { apiGet } from '../utils/api';
import { AddCustomerModal, AddVehicleModal } from '../components/modals';
import { formatPhoneNumber } from '../utils/validation';

export const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersResponse, vehiclesResponse] = await Promise.all([
        apiGet<Customer[]>('/customers/'),
        apiGet<Vehicle[]>('/vehicles/')
      ]);

      setCustomers(customersResponse);
      setVehicles(vehiclesResponse);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (entityType: string, _data: any) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    loadData(); // Refresh data
  };

  const getCustomerVehicles = (customerId: number) => {
    return vehicles.filter(v => v.customer === customerId);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.phone_number.includes(searchTerm)
  );

  const handleAddVehicleForCustomer = (_customerId: number) => {
    setShowVehicleModal(true);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading customers...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">👥 Customer Management</h1>
            <Button 
              variant="success" 
              onClick={() => setShowCustomerModal(true)}
              className="d-flex align-items-center gap-2"
            >
              👤 Add Customer
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Statistics */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="🔍 Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Row>
            <Col sm={6}>
              <Card className="text-center">
                <Card.Body className="py-2">
                  <h4 className="text-primary mb-0">{customers.length}</h4>
                  <small>Total Customers</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="text-center">
                <Card.Body className="py-2">
                  <h4 className="text-success mb-0">{vehicles.length}</h4>
                  <small>Total Vehicles</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Customer Cards */}
      <Row>
        <Col>
          {filteredCustomers.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h5>
                  {searchTerm ? 'No customers found matching your search' : 'No customers registered yet'}
                </h5>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first customer!'}
                </p>
                {!searchTerm && (
                  <Button 
                    variant="success" 
                    onClick={() => setShowCustomerModal(true)}
                  >
                    Add First Customer
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredCustomers.map((customer) => {
                const customerVehicles = getCustomerVehicles(customer.id!);
                return (
                  <Col key={customer.id} lg={6} xl={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">👤 {customer.name}</h6>
                        <Badge bg="light" text="dark">
                          {customerVehicles.length} vehicle{customerVehicles.length !== 1 ? 's' : ''}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="mb-2">
                            <strong>📧 Email:</strong><br />
                            <a href={`mailto:${customer.email}`} className="text-decoration-none">
                              {customer.email}
                            </a>
                          </div>
                          <div className="mb-2">
                            <strong>📞 Phone:</strong><br />
                            <a href={`tel:${customer.phone_number}`} className="text-decoration-none">
                              {formatPhoneNumber(customer.phone_number)}
                            </a>
                          </div>
                          {customer.address && (
                            <div className="mb-2">
                              <strong>🏠 Address:</strong><br />
                              <small className="text-muted">{customer.address}</small>
                            </div>
                          )}
                        </div>

                        {/* Customer's Vehicles */}
                        {customerVehicles.length > 0 ? (
                          <div className="mb-3">
                            <strong>🚗 Vehicles:</strong>
                            <div className="mt-2">
                              {customerVehicles.map((vehicle) => (
                                <div key={vehicle.id} className="border rounded p-2 mb-2 bg-light">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong><br />
                                      <small className="text-muted">
                                        VIN: {vehicle.vin.slice(-8)}
                                        {vehicle.license_plate && ` • ${vehicle.license_plate}`}
                                      </small>
                                    </div>
                                    {vehicle.color && (
                                      <Badge 
                                        style={{ 
                                          backgroundColor: vehicle.color.toLowerCase(),
                                          color: ['white', 'yellow', 'silver', 'gray'].includes(vehicle.color.toLowerCase()) ? 'black' : 'white'
                                        }}
                                      >
                                        {vehicle.color}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <Alert variant="info" className="py-2 mb-0">
                              <small>No vehicles registered for this customer</small>
                            </Alert>
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-light">
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAddVehicleForCustomer(customer.id!)}
                            className="flex-grow-1"
                          >
                            🚗 Add Vehicle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            title="View History"
                          >
                            📋
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            title="Contact Customer"
                          >
                            💬
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>

      {/* Search Results Info */}
      {searchTerm && (
        <Row className="mt-3">
          <Col>
            <Alert variant="info" className="mb-0">
              Showing {filteredCustomers.length} of {customers.length} customers matching "{searchTerm}"
            </Alert>
          </Col>
        </Row>
      )}

      {/* Role-based information */}
      {user?.role === 'customer' && (
        <Row className="mt-4">
          <Col>
            <Alert variant="warning">
              <strong>Limited Access:</strong> As a customer, you can only view your own profile. 
              Contact our staff for account updates.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={(data) => handleSuccess('Customer', data)}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={(data) => handleSuccess('Vehicle', data)}
      />
    </Container>
  );
};
