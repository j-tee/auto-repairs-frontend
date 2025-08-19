import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Form, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import type { RepairOrder, Appointment, Service, Vehicle, Customer } from '../types/entities';
import { apiGet } from '../utils/api';
import { AddRepairOrderModal, AddAppointmentModal, AddServiceModal } from '../components/modals';

export const ServiceManagement: React.FC = () => {
  const { user } = useAuth();
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('repair-orders');

  // Modal states
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        repairOrdersResponse,
        appointmentsResponse,
        servicesResponse,
        vehiclesResponse,
        customersResponse
      ] = await Promise.all([
        apiGet<RepairOrder[]>('/repair-orders/'),
        apiGet<Appointment[]>('/appointments/'),
        apiGet<Service[]>('/services/'),
        apiGet<Vehicle[]>('/vehicles/'),
        apiGet<Customer[]>('/customers/')
      ]);

      setRepairOrders(repairOrdersResponse);
      setAppointments(appointmentsResponse);
      setServices(servicesResponse);
      setVehicles(vehiclesResponse);
      setCustomers(customersResponse);
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

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getCustomerInfo = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Unknown Customer';
    const customer = customers.find(c => c.id === vehicle.customer);
    return customer?.name || 'Unknown Customer';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'scheduled': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading service data...</p>
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
            <h1 className="mb-0">🔧 Service Management</h1>
            <div className="d-flex gap-2">
              <Button 
                variant="info" 
                onClick={() => setShowServiceModal(true)}
                className="d-flex align-items-center gap-2"
              >
                ⚙️ Add Service
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowAppointmentModal(true)}
                className="d-flex align-items-center gap-2"
              >
                📅 Schedule Appointment
              </Button>
              <Button 
                variant="success" 
                onClick={() => setShowRepairOrderModal(true)}
                className="d-flex align-items-center gap-2"
              >
                📋 Create Repair Order
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{repairOrders.filter(ro => ro.status === 'pending').length}</h3>
              <p className="mb-0">Pending Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{repairOrders.filter(ro => ro.status === 'in_progress').length}</h3>
              <p className="mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{appointments.filter(apt => apt.status === 'scheduled').length}</h3>
              <p className="mb-0">Scheduled</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{services.length}</h3>
              <p className="mb-0">Available Services</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'repair-orders')}
        className="mb-4"
      >
        <Tab eventKey="repair-orders" title="🔧 Repair Orders">
          <Card>
            <Card.Body className="p-0">
              {repairOrders.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No repair orders yet</h5>
                  <p className="text-muted">Start by creating your first repair order!</p>
                  <Button 
                    variant="success" 
                    onClick={() => setShowRepairOrderModal(true)}
                  >
                    Create First Repair Order
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>
                        <td>{getCustomerInfo(order.vehicle)}</td>
                        <td>{getVehicleInfo(order.vehicle)}</td>
                        <td>
                          <strong>${order.total_amount.toFixed(2)}</strong>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          {new Date(order.created_date).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-primary" title="View Details">
                              👁️
                            </Button>
                            <Button size="sm" variant="outline-warning" title="Edit Order">
                              ✏️
                            </Button>
                            <Button size="sm" variant="outline-success" title="Update Status">
                              🔄
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="📅 Appointments">
          <Card>
            <Card.Body className="p-0">
              {appointments.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No appointments scheduled</h5>
                  <p className="text-muted">Schedule the first appointment!</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <div>
                            <strong>{new Date(appointment.date).toLocaleDateString()}</strong><br />
                            <small className="text-muted">{appointment.time}</small>
                          </div>
                        </td>
                        <td>{getCustomerInfo(appointment.vehicle)}</td>
                        <td>{getVehicleInfo(appointment.vehicle)}</td>
                        <td>
                          {services.find(s => s.id === appointment.service)?.name || 'Unknown Service'}
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          {appointment.notes ? (
                            <span title={appointment.notes}>
                              {appointment.notes.length > 30 
                                ? `${appointment.notes.substring(0, 30)}...` 
                                : appointment.notes
                              }
                            </span>
                          ) : (
                            <span className="text-muted">No notes</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-primary" title="View Details">
                              👁️
                            </Button>
                            <Button size="sm" variant="outline-warning" title="Reschedule">
                              📅
                            </Button>
                            <Button size="sm" variant="outline-success" title="Complete">
                              ✅
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="services" title="⚙️ Services">
          <Row>
            {services.length === 0 ? (
              <Col>
                <Card>
                  <Card.Body className="text-center py-5">
                    <h5>No services defined</h5>
                    <p className="text-muted">Add your first service offering!</p>
                    <Button 
                      variant="info" 
                      onClick={() => setShowServiceModal(true)}
                    >
                      Add First Service
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              services.map((service) => (
                <Col key={service.id} md={6} lg={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Header className="bg-info text-white">
                      <h6 className="mb-0">⚙️ {service.name}</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <h4 className="text-success">${service.price.toFixed(2)}</h4>
                      </div>
                      {service.description && (
                        <p className="text-muted">{service.description}</p>
                      )}
                      <div className="mb-2">
                        <small className="text-muted">
                          <strong>Category:</strong> {service.category || 'General'}
                        </small>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-light">
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" className="flex-grow-1">
                          📅 Schedule
                        </Button>
                        <Button size="sm" variant="outline-secondary" title="Edit Service">
                          ✏️
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>
      </Tabs>

      {/* Role-based access information */}
      {user?.role === 'customer' && (
        <Row className="mt-4">
          <Col>
            <Alert variant="info">
              <strong>Customer View:</strong> You can view your appointments and service history. 
              Contact us to schedule new services or check repair order status.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Modals */}
      <AddServiceModal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        onSuccess={(data) => handleSuccess('Service', data)}
      />

      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        onSuccess={(data) => handleSuccess('Appointment', data)}
      />

      <AddRepairOrderModal
        show={showRepairOrderModal}
        onHide={() => setShowRepairOrderModal(false)}
        onSuccess={(data) => handleSuccess('Repair Order', data)}
      />
    </Container>
  );
};
