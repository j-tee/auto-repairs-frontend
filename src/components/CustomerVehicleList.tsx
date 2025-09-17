import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Alert, Spinner, Collapse } from 'react-bootstrap';
import type { Vehicle } from '../types/vehicles';
import type { Appointment } from '../types/appointments';

interface CustomerVehicleListProps {
  onScheduleService?: (vehicleId: string) => void;
}

export const CustomerVehicleList: React.FC<CustomerVehicleListProps> = ({
  onScheduleService
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<Record<string, Appointment[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, show a message since customer-specific vehicle endpoints don't exist yet
      setError('Customer vehicle endpoints are not yet implemented. Please contact support to view your vehicles.');
      setVehicles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleHistory = async (vehicleId: string) => {
    if (vehicleHistory[vehicleId]) return; // Already loaded

    try {
      setLoadingHistory(prev => ({ ...prev, [vehicleId]: true }));
      // TODO: Use appointmentMngtService with customer+vehicle filter when endpoints are ready
      console.warn('Vehicle history endpoints not implemented yet');
      setVehicleHistory(prev => ({ ...prev, [vehicleId]: [] }));
    } catch (err) {
      console.error('Failed to load vehicle history:', err);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [vehicleId]: false }));
    }
  };

  const handleVehicleExpand = (vehicleId: string) => {
    if (expandedVehicle === vehicleId) {
      setExpandedVehicle(null);
    } else {
      setExpandedVehicle(vehicleId);
      loadVehicleHistory(vehicleId);
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'in_service': return 'warning';
      default: return 'light';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMaintenanceStatus = (vehicle: Vehicle) => {
    const now = new Date();
    const lastService = vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate) : null;
    
    if (!lastService) {
      return { status: 'unknown', message: 'No service history', color: 'secondary' };
    }

    const daysSinceService = Math.floor((now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceService > 180) { // 6 months
      return { status: 'overdue', message: 'Service overdue', color: 'danger' };
    } else if (daysSinceService > 120) { // 4 months
      return { status: 'due_soon', message: 'Service due soon', color: 'warning' };
    } else {
      return { status: 'good', message: 'Up to date', color: 'success' };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Vehicles</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" size="sm" onClick={loadVehicles}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="customer-vehicle-list">
      {vehicles.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <div className="mb-3" style={{ fontSize: '4rem', opacity: 0.3 }}>🚗</div>
            <h5>No Vehicles Found</h5>
            <p className="text-muted">
              You don't have any vehicles registered with us yet.
            </p>
            <Button variant="primary">
              📝 Register Your Vehicle
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {vehicles.map((vehicle) => {
            const maintenance = getMaintenanceStatus(vehicle);
            const isExpanded = expandedVehicle === vehicle.id;
            const history = vehicleHistory[vehicle.id] || [];
            const loadingVehicleHistory = loadingHistory[vehicle.id] || false;

            return (
              <Col lg={6} key={vehicle.id} className="mb-4">
                <Card className="vehicle-card h-100">
                  <Card.Body>
                    {/* Vehicle Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={getVehicleStatusColor(vehicle.isActive ? 'active' : 'inactive')}>
                            {vehicle.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                          <Badge bg={maintenance.color}>
                            {maintenance.message}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="vehicle-icon" style={{ fontSize: '2rem' }}>
                          {vehicle.make.toLowerCase().includes('toyota') ? '🚗' : 
                           vehicle.make.toLowerCase().includes('ford') ? '🚙' : 
                           vehicle.make.toLowerCase().includes('honda') ? '🚗' : 
                           vehicle.make.toLowerCase().includes('chevrolet') ? '🚐' : '🚗'}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="vehicle-details mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted">License Plate</small>
                          <div className="fw-bold">{vehicle.licensePlate}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">VIN</small>
                          <div className="font-monospace small">
                            {vehicle.vin ? `${vehicle.vin.slice(0, 8)}...` : 'N/A'}
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Mileage</small>
                          <div>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Last Service</small>
                          <div>
                            {vehicle.lastServiceDate 
                              ? formatDate(vehicle.lastServiceDate)
                              : 'Never'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Actions */}
                    <div className="vehicle-actions mb-3">
                      <Row className="g-2">
                        <Col>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-100"
                            onClick={() => onScheduleService?.(vehicle.id)}
                          >
                            📅 Schedule Service
                          </Button>
                        </Col>
                        <Col>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="w-100"
                            onClick={() => handleVehicleExpand(vehicle.id)}
                          >
                            {isExpanded ? '⬆️ Hide History' : '📋 View History'}
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    {/* Maintenance Reminders */}
                    {vehicle.nextServiceDue && (
                      <Alert variant="info" className="py-2 px-3 mb-3">
                        <small>
                          <strong>Upcoming:</strong> Service due by {' '}
                          {formatDate(vehicle.nextServiceDue)}
                        </small>
                      </Alert>
                    )}

                    {/* Service History Collapse */}
                    <Collapse in={isExpanded}>
                      <div className="vehicle-history">
                        <hr />
                        <h6 className="mb-3">📋 Service History</h6>
                        
                        {loadingVehicleHistory ? (
                          <div className="text-center py-3">
                            <Spinner animation="border" size="sm" />
                            <small className="ms-2 text-muted">Loading history...</small>
                          </div>
                        ) : history.length === 0 ? (
                          <div className="text-center py-3">
                            <small className="text-muted">No service history found</small>
                          </div>
                        ) : (
                          <div className="history-list">
                            {history.slice(0, 5).map((appointment) => (
                              <div key={appointment.id} className="history-item mb-2 pb-2 border-bottom">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-bold small">{appointment.description}</div>
                                    <div className="text-muted small">
                                      {appointment.appointmentDate && formatDate(appointment.appointmentDate)}
                                    </div>
                                  </div>
                                  <Badge 
                                    bg={appointment.status === 'completed' ? 'success' : 'secondary'}
                                    className="small"
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                                
                                <div className="text-muted small mt-1">
                                  Service appointment scheduled
                                </div>

                                {appointment.estimatedCost && (
                                  <div className="text-success small mt-1">
                                    Estimated: ${appointment.estimatedCost.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {history.length > 5 && (
                              <div className="text-center mt-3">
                                <Button variant="outline-primary" size="sm">
                                  View All {history.length} Records
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default CustomerVehicleList;