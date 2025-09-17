import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import type { Appointment } from '../types/appointments';

interface CustomerServiceStatusProps {
  dashboardData: { activeAppointments: number; upcomingServices: number } | null;
  onRefresh: () => void;
  loading: boolean;
}

export const CustomerServiceStatus: React.FC<CustomerServiceStatusProps> = ({
  dashboardData,
  onRefresh,
  loading
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load detailed appointment information
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoadingAppointments(true);
        setError(null);
        
        // For now, show a placeholder message since customer-specific endpoints don't exist yet
        // TODO: Use appointmentMngtService.getAppointments() with customer filter when backend is ready
        setError('Customer appointment endpoints are not yet implemented. Please contact support to check your appointment status.');
        setAppointments([]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
        setError(errorMessage);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (dashboardData) {
      loadAppointments();
    }
  }, [dashboardData]);



  if (loadingAppointments && !appointments.length) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your service status...</p>
      </div>
    );
  }

  return (
    <div className="customer-service-status">
      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Active Services */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🔄 Active Services</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading || loadingAppointments}
                >
                  {loading || loadingAppointments ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    '🔄 Refresh'
                  )}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>🚗</div>
                <h6>Service Status Unavailable</h6>
                <p className="text-muted">
                  Customer service tracking requires backend implementation.<br />
                  Please contact our service department for appointment status updates.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="primary" size="sm">
                    📞 Call Service Dept
                  </Button>
                  <Button variant="outline-info" size="sm">
                    📧 Email Support  
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Backend Requirements Notice */}
      <Row>
        <Col>
          <Card className="border-warning">
            <Card.Header className="bg-warning bg-opacity-10">
              <h6 className="mb-0 text-warning">⚠️ Backend Implementation Required</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                To enable customer service tracking, the following backend endpoints need to be implemented:
              </p>
              <ul className="mb-3">
                <li><code>GET /api/customers/profile/</code> - Get current customer profile</li>
                <li><code>GET /api/customers/appointments/</code> - Get customer's appointments</li>
                <li><code>GET /api/customers/vehicles/</code> - Get customer's vehicles</li>
                <li><code>GET /api/customers/history/</code> - Get customer's service history</li>
              </ul>
              <p className="text-muted small mb-0">
                See <code>CUSTOMER_DASHBOARD_BACKEND_REQUIREMENTS.md</code> for complete implementation details.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerServiceStatus;