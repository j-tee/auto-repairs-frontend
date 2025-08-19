import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import {
  AddShopModal,
  AddCustomerModal,
  AddVehicleModal,
  AddVehicleProblemModal,
  AddServiceModal,
  AddPartModal,
  AddEmployeeModal,
  AddAppointmentModal,
  AddRepairOrderModal,
} from './modals';

export const ModalsDemo: React.FC = () => {
  // Modal visibility states
  const [showShopModal, setShowShopModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showVehicleProblemModal, setShowVehicleProblemModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showRepairOrderModal, setShowRepairOrderModal] = useState(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (entityType: string, data: any) => {
    setSuccessMessage(`${entityType} created successfully! ID: ${data.id}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const modalButtons = [
    {
      title: 'Shop',
      description: 'Create a new auto repair shop',
      icon: '🏪',
      onClick: () => setShowShopModal(true),
      color: 'primary'
    },
    {
      title: 'Customer',
      description: 'Add a new customer',
      icon: '👤',
      onClick: () => setShowCustomerModal(true),
      color: 'success'
    },
    {
      title: 'Vehicle',
      description: 'Register a customer vehicle',
      icon: '🚗',
      onClick: () => setShowVehicleModal(true),
      color: 'info'
    },
    {
      title: 'Vehicle Problem',
      description: 'Report a vehicle issue',
      icon: '⚠️',
      onClick: () => setShowVehicleProblemModal(true),
      color: 'warning'
    },
    {
      title: 'Service',
      description: 'Add a new service offering',
      icon: '🔧',
      onClick: () => setShowServiceModal(true),
      color: 'secondary'
    },
    {
      title: 'Part',
      description: 'Add inventory parts',
      icon: '⚙️',
      onClick: () => setShowPartModal(true),
      color: 'dark'
    },
    {
      title: 'Employee',
      description: 'Add shop staff member',
      icon: '👷',
      onClick: () => setShowEmployeeModal(true),
      color: 'primary'
    },
    {
      title: 'Appointment',
      description: 'Schedule vehicle service',
      icon: '📅',
      onClick: () => setShowAppointmentModal(true),
      color: 'success'
    },
    {
      title: 'Repair Order',
      description: 'Create comprehensive repair order',
      icon: '📋',
      onClick: () => setShowRepairOrderModal(true),
      color: 'danger'
    }
  ];

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-3">🚗 Auto Repair Management System</h1>
          <p className="text-center text-muted">
            Comprehensive modals for managing all aspects of your auto repair business
          </p>
        </Col>
      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {modalButtons.map((button, index) => (
          <Col md={6} lg={4} key={index} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <div style={{ fontSize: '3rem' }}>{button.icon}</div>
                </div>
                <Card.Title className="text-center">{button.title}</Card.Title>
                <Card.Text className="text-center flex-grow-1">
                  {button.description}
                </Card.Text>
                <Button 
                  variant={button.color} 
                  onClick={button.onClick}
                  className="mt-auto"
                >
                  Add {button.title}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h5>🔗 Relationship Information</h5>
              <ul className="mb-0">
                <li><strong>Shops</strong> can have multiple employees, services, and parts</li>
                <li><strong>Customers</strong> can own multiple vehicles</li>
                <li><strong>Vehicles</strong> can have multiple problems and appointments</li>
                <li><strong>Appointments</strong> can reference specific vehicle problems</li>
                <li><strong>Repair Orders</strong> combine multiple services and parts for a vehicle</li>
                <li><strong>Employees</strong> are linked to specific shops</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Modal Components */}
      <AddShopModal
        show={showShopModal}
        onHide={() => setShowShopModal(false)}
        onSuccess={(data: any) => handleSuccess('Shop', data)}
      />

      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={(data: any) => handleSuccess('Customer', data)}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={(data: any) => handleSuccess('Vehicle', data)}
      />

      <AddVehicleProblemModal
        show={showVehicleProblemModal}
        onHide={() => setShowVehicleProblemModal(false)}
        onSuccess={(data: any) => handleSuccess('Vehicle Problem', data)}
      />

      <AddServiceModal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        onSuccess={(data: any) => handleSuccess('Service', data)}
      />

      <AddPartModal
        show={showPartModal}
        onHide={() => setShowPartModal(false)}
        onSuccess={(data: any) => handleSuccess('Part', data)}
      />

      <AddEmployeeModal
        show={showEmployeeModal}
        onHide={() => setShowEmployeeModal(false)}
        onSuccess={(data: any) => handleSuccess('Employee', data)}
      />

      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        onSuccess={(data: any) => handleSuccess('Appointment', data)}
      />

      <AddRepairOrderModal
        show={showRepairOrderModal}
        onHide={() => setShowRepairOrderModal(false)}
        onSuccess={(data: any) => handleSuccess('Repair Order', data)}
      />
    </Container>
  );
};
