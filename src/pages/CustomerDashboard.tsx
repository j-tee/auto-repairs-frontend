import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Tab, Tabs, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { CustomerServiceStatus, CustomerVehicleList } from '../components';
// import { CustomerAppointmentHistory } from '../components/CustomerAppointmentHistory';
// import { CustomerNotificationSettings } from '../components/CustomerNotificationSettings';
import { customerMngtService } from '../services';
import type { Customer } from '../types/customers';
import '../styles/CustomerDashboard.scss';

// Simple dashboard summary interface using existing types
interface CustomerDashboardSummary {
  customer: Customer | null;
  activeAppointments: number;
  totalVehicles: number;
  upcomingServices: number;
  lastServiceDate: string | null;
}

/**
 * CustomerDashboard - Main dashboard page for customers
 * Allows customers to view their vehicles, appointments, and service status
 */
export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<CustomerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load customer dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get customer profile (this will show backend requirement message if not available)
        let customer: Customer | null = null;
        try {
          customer = await customerMngtService.getMyProfile();
        } catch (profileError) {
          console.warn('Customer profile not available:', profileError);
          // Continue without profile for now
        }
        
        // Create a basic dashboard summary
        const data: CustomerDashboardSummary = {
          customer,
          activeAppointments: 0, // TODO: Load from appointmentMngtService when customer endpoints exist
          totalVehicles: 0, // TODO: Load from vehicleMngtService when customer endpoints exist  
          upcomingServices: 0, // TODO: Calculate from appointments
          lastServiceDate: null // TODO: Get from customer history
        };
        
        setDashboardData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(errorMessage);
        console.error('Customer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'customer') {
      loadDashboardData();
    }
  }, [user]);

  // Refresh data function
  const refreshData = async () => {
    if (user?.role === 'customer') {
      setLoading(true);
      try {
        // Try to get customer profile
        let customer: Customer | null = null;
        try {
          customer = await customerMngtService.getMyProfile();
        } catch (profileError) {
          console.warn('Customer profile not available:', profileError);
        }
        
        // Create a basic dashboard summary
        const data: CustomerDashboardSummary = {
          customer,
          activeAppointments: 0,
          totalVehicles: 0,
          upcomingServices: 0,
          lastServiceDate: null
        };
        
        setDashboardData(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Check if user is a customer
  if (!user || user.role !== 'customer') {
    return (
      <Container className="text-center py-5">
        <h3>Access Denied</h3>
        <p>This page is only available for customers. Please log in with your customer account.</p>
      </Container>
    );
  }

  // Loading state
  if (loading && !dashboardData) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h4>Loading Your Dashboard</h4>
        <p className="text-muted">Please wait while we load your service information...</p>
      </Container>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Unable to Load Dashboard</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            This may be because your user account is not yet linked to a customer profile. 
            Please contact our service department for assistance.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="customer-dashboard">
      <Container fluid>
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <Row>
            <Col>
              <div className="welcome-section">
                <h1 className="page-title">
                  <span className="icon">🚗</span>
                  Welcome Back, {dashboardData?.customer?.name || user.firstName}
                </h1>
                <p className="page-subtitle">
                  Track your vehicle services and manage your appointments
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Error Alert (for refresh errors) */}
        {error && dashboardData && (
          <Alert variant="warning" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        {dashboardData && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center stats-card">
                <Card.Body>
                  <h3 className="text-primary">{dashboardData.totalVehicles}</h3>
                  <p className="mb-0">My Vehicles</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card">
                <Card.Body>
                  <h3 className="text-warning">{dashboardData.activeAppointments}</h3>
                  <p className="mb-0">Active Services</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card">
                <Card.Body>
                  <h3 className="text-success">0</h3>
                  <p className="mb-0">Completed Services</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card">
                <Card.Body>
                  <h3 className="text-info">$0</h3>
                  <p className="mb-0">Total Invested</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Dashboard Content */}
        <Tabs
          activeKey={activeTab}
          onSelect={(tab) => setActiveTab(tab || 'overview')}
          className="mb-4"
        >
          <Tab eventKey="overview" title="📊 Service Overview">
            <CustomerServiceStatus 
              dashboardData={dashboardData}
              onRefresh={refreshData}
              loading={loading}
            />
          </Tab>

          <Tab eventKey="vehicles" title="🚗 My Vehicles">
            <CustomerVehicleList 
              onScheduleService={(vehicleId) => {
                console.log('Schedule service for vehicle:', vehicleId);
                // TODO: Implement service scheduling when backend is ready
              }}
            />
          </Tab>

          <Tab eventKey="history" title="📋 History">
            <Card>
              <Card.Body className="text-center py-5">
                <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
                <h5>Service History</h5>
                <p className="text-muted">
                  Service history tracking requires backend implementation.<br />
                  Contact support for your complete service records.
                </p>
                <Button variant="primary" size="sm">
                  📞 Request History
                </Button>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="settings" title="⚙️ Settings">
            <Card>
              <Card.Body className="text-center py-5">
                <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>⚙️</div>
                <h5>Account Settings</h5>
                <p className="text-muted">
                  Account settings require backend implementation.<br />
                  Contact support to update your preferences.
                </p>
                <Button variant="primary" size="sm">
                  📞 Contact Support
                </Button>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Backend Requirements Notice */}
        <Row className="mt-4">
          <Col>
            <Alert variant="info">
              <Alert.Heading>� Development Status</Alert.Heading>
              <p>
                The customer dashboard is ready for use once the backend implements the required endpoints.
                All frontend components are built using the existing service architecture and type system.
              </p>
              <hr />
              <p className="mb-0">
                See <strong>CUSTOMER_DASHBOARD_BACKEND_REQUIREMENTS.md</strong> for implementation details.
              </p>
            </Alert>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">🚀 Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="quick-actions">
                  <button 
                    className="btn btn-primary me-2 mb-2"
                    onClick={() => setActiveTab('vehicles')}
                  >
                    📅 Schedule Service
                  </button>
                  <button 
                    className="btn btn-outline-primary me-2 mb-2"
                    onClick={() => setActiveTab('history')}
                  >
                    📋 View History  
                  </button>
                  <button 
                    className="btn btn-outline-info me-2 mb-2"
                    onClick={refreshData}
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : '🔄'} Refresh
                  </button>
                  <a 
                    href="tel:+15551234567" 
                    className="btn btn-outline-success mb-2"
                  >
                    📞 Contact Service
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default CustomerDashboard;