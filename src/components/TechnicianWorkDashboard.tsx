import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import './TechnicianWorkDashboard.scss';

/**
 * TechnicianWorkDashboard - A specialized dashboard for technicians and mechanics
 * to view and manage their own assigned work
 */
export const TechnicianWorkDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    repairOrders,
    loading,
    error,
    loadMyAssignments,
    loadRepairOrders,
    startAppointmentWork,
    completeAppointmentWork,
    editRepairOrder
  } = useAutoRepairs();

  const [activeTab, setActiveTab] = useState<'appointments' | 'repairs'>('appointments');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load technician's assigned work on component mount
  useEffect(() => {
    // Load technician-specific assignments using the dedicated endpoint
    loadMyAssignments();
    loadRepairOrders();
  }, [loadMyAssignments, loadRepairOrders]);

  // Appointments are already filtered by the backend /my-assignments/ endpoint
  const myAppointments = appointments;
  console.log('My Appointments:', myAppointments);
  // Filter repair orders for this technician
  const myRepairOrders = repairOrders.filter(ro => {
    // Similar logic for repair orders
    if (ro.assigned_technician && typeof ro.assigned_technician === 'object' && 'email' in ro.assigned_technician) {
      return ro.assigned_technician.email === user?.email;
    }
    return ro.assigned_technician?.id === user?.id || ro.assigned_technician_id === user?.id;
  });

  const handleStartWork = async (appointmentId: string) => {
    try {
      await startAppointmentWork(appointmentId);
      setSuccessMessage('Work started successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  const handleCompleteWork = async (appointmentId: string) => {
    try {
      await completeAppointmentWork(appointmentId);
      setSuccessMessage('Work completed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to complete work:', error);
    }
  };

  const handleUpdateRepairStatus = async (repairOrderId: string, status: string) => {
    try {
      await editRepairOrder(repairOrderId, { status });
      setSuccessMessage(`Repair order status updated to ${status}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update repair status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'light';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  if (loading.appointments || loading.repairOrders) {
    return (
      <div className="technician-dashboard loading">
        <Spinner animation="border" />
        <p>Loading your assignments...</p>
      </div>
    );
  }

  return (
    <div className="technician-work-dashboard">
      <div className="dashboard-header">
        <h2>My Work Dashboard</h2>
        <p className="text-muted">
          Welcome back, {user?.firstName || user?.email}! Here are your current assignments.
        </p>
      </div>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {(error.appointments || error.repairOrders) && (
        <Alert variant="danger">
          {error.appointments || error.repairOrders}
        </Alert>
      )}

      {/* Work Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center summary-card">
            <Card.Body>
              <h3 className="text-info">{myAppointments.filter(a => a.status === 'scheduled' || a.status === 'assigned').length}</h3>
              <p className="mb-0">Ready to Start</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center summary-card">
            <Card.Body>
              <h3 className="text-warning">{myAppointments.filter(a => a.status === 'in_progress').length}</h3>
              <p className="mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center summary-card">
            <Card.Body>
              <h3 className="text-success">{myAppointments.filter(a => a.status === 'completed').length}</h3>
              <p className="mb-0">Completed Today</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center summary-card">
            <Card.Body>
              <h3 className="text-primary">{myAppointments.length + myRepairOrders.length}</h3>
              <p className="mb-0">Total Assignments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tab Navigation */}
      <div className="tab-navigation mb-4">
        <Button 
          variant={activeTab === 'appointments' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('appointments')}
          className="me-2"
        >
          📅 My Appointments ({myAppointments.length})
        </Button>
        <Button 
          variant={activeTab === 'repairs' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('repairs')}
        >
          🔧 My Repair Orders ({myRepairOrders.length})
        </Button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="appointments-section">
          {myAppointments.length === 0 ? (
            <Card className="text-center">
              <Card.Body>
                <h5>No appointments assigned</h5>
                <p className="text-muted">You don't have any appointments assigned to you at the moment.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {myAppointments.map((appointment) => (
                <Col lg={6} xl={4} key={appointment.id} className="mb-3">
                  <Card className="appointment-card">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>#{appointment.id?.slice(-6)}</strong>
                        <div className="text-muted small">
                          {appointment.scheduledDate} at {appointment.scheduledTime}
                        </div>
                      </div>
                      <Badge bg={getStatusColor(appointment.status)}>
                        {appointment.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="customer-info mb-2">
                        <strong>{appointment.customer?.name}</strong>
                        <div className="text-muted small">{appointment.customer?.phoneNumber}</div>
                      </div>
                      
                      <div className="vehicle-info mb-2">
                        <div className="fw-bold">
                          {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
                        </div>
                        <div className="text-muted small">VIN: {appointment.vehicle?.vin || 'N/A'}</div>
                      </div>

                      <div className="service-info mb-3">
                        <div className="fw-bold">Service:</div>
                        <div>{appointment.service_type || 'General Service'}</div>
                        {appointment.notes && (
                          <div className="text-muted small mt-1">Notes: {appointment.notes}</div>
                        )}
                      </div>

                      <div className="actions d-flex gap-2">
                        {appointment.status === 'assigned' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStartWork(appointment.id!)}
                            disabled={loading.startWork}
                          >
                            🚀 Start Work
                          </Button>
                        )}
                        
                        {appointment.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCompleteWork(appointment.id!)}
                            disabled={loading.completeWork}
                          >
                            ✅ Complete Work
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* Repair Orders Tab */}
      {activeTab === 'repairs' && (
        <div className="repair-orders-section">
          {myRepairOrders.length === 0 ? (
            <Card className="text-center">
              <Card.Body>
                <h5>No repair orders assigned</h5>
                <p className="text-muted">You don't have any repair orders assigned to you at the moment.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {myRepairOrders.map((repairOrder) => (
                <Col lg={6} xl={4} key={repairOrder.id} className="mb-3">
                  <Card className="repair-order-card">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>RO #{repairOrder.orderNumber || repairOrder.id?.slice(-6)}</strong>
                        {repairOrder.priority && (
                          <Badge bg={getPriorityColor(repairOrder.priority)} className="ms-2">
                            {repairOrder.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <Badge bg={getStatusColor(repairOrder.status)}>
                        {repairOrder.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="customer-info mb-2">
                        <strong>{repairOrder.customer_name}</strong>
                      </div>
                      
                      <div className="vehicle-info mb-2">
                        <div className="fw-bold">
                          {repairOrder.vehicle_year} {repairOrder.vehicle_make} {repairOrder.vehicle_model}
                        </div>
                      </div>

                      <div className="description mb-3">
                        <div className="fw-bold">Description:</div>
                        <div>{repairOrder.description}</div>
                      </div>

                      <div className="actions d-flex gap-2 flex-wrap">
                        {repairOrder.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleUpdateRepairStatus(repairOrder.id!, 'in_progress')}
                          >
                            🚀 Start Repair
                          </Button>
                        )}
                        
                        {repairOrder.status === 'in_progress' && (
                          <>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleUpdateRepairStatus(repairOrder.id!, 'waiting_for_parts')}
                            >
                              ⏳ Waiting for Parts
                            </Button>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleUpdateRepairStatus(repairOrder.id!, 'completed')}
                            >
                              ✅ Complete
                            </Button>
                          </>
                        )}
                        
                        {repairOrder.status === 'waiting_for_parts' && (
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleUpdateRepairStatus(repairOrder.id!, 'in_progress')}
                          >
                            🔄 Resume Work
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianWorkDashboard;