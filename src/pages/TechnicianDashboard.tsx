import React from 'react';
import { Container } from 'react-bootstrap';
import { TechnicianWorkDashboard } from '../components/TechnicianWorkDashboard';
import { useAuth } from '../hooks/useAuth';
import { PermissionGuard } from '../components/PermissionGuard';
import './TechnicianDashboard.scss';

/**
 * TechnicianDashboard - Main dashboard page for technicians and mechanics
 * Provides access to assigned work, job management, and status updates
 */
export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();

  // Ensure user is logged in and has technician access
  if (!user) {
    return (
      <Container className="text-center py-5">
        <h3>Access Denied</h3>
        <p>Please log in to access your technician dashboard.</p>
      </Container>
    );
  }

  // Check if user has technician access
  // Allow access for employees (which includes technicians/mechanics), owners, admins, and managers
  const hasAccess = user.role === 'employee' || user.role === 'owner' || user.role === 'admin' || user.role === 'manager' ||
                   user.role === 'technician' || user.role === 'mechanic';

  if (!hasAccess) {
    return (
      <Container className="text-center py-5">
        <h3>Access Restricted</h3>
        <p>This dashboard is only available for technicians and mechanics.</p>
      </Container>
    );
  }

  return (
    <div className="technician-dashboard-page">
      <Container fluid>
        <div className="page-header">
          <div className="welcome-section">
            <h1 className="page-title">
              <span className="icon">🔧</span>
              Technician Dashboard
            </h1>
            <p className="page-subtitle">
              Manage your assigned work and track progress
            </p>
          </div>
          
          <div className="user-info">
            <div className="user-badge">
              <div className="user-avatar">
                {user.first_name?.[0] || user.name?.[0] || 'T'}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.first_name} {user.last_name || user.name}
                </div>
                <div className="user-role">
                  {user.role?.toUpperCase() || 'EMPLOYEE'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Guard for additional security */}
        <PermissionGuard 
          requireEmployee
          fallback={
            <div className="text-center py-5">
              <h4>Insufficient Permissions</h4>
              <p>You don't have the required permissions to access technician features.</p>
            </div>
          }
        >
          <TechnicianWorkDashboard />
        </PermissionGuard>
      </Container>
    </div>
  );
};

export default TechnicianDashboard;