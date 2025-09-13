import React, { useEffect } from 'react';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import type { TechnicianWorkload } from '../types/appointments';
import './TechnicianWorkloadDashboard.scss';

export const TechnicianWorkloadDashboard: React.FC = () => {
  const {
    technicianWorkload,
    loadTechnicianWorkload,
    loading,
    error
  } = useAutoRepairs();

  useEffect(() => {
    // Initial load
    loadTechnicianWorkload();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTechnicianWorkload();
    }, 30000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [loadTechnicianWorkload]);

  const handleManualRefresh = () => {
    loadTechnicianWorkload();
  };

  const getTechnicianStatusClass = (isAvailable: boolean) => {
    return isAvailable ? 'technician-available' : 'technician-busy';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return 'utilization-full';
    if (utilization >= 75) return 'utilization-high';
    if (utilization >= 50) return 'utilization-medium';
    return 'utilization-low';
  };

  const calculateUtilization = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  };

  if (loading.technicianWorkload && !technicianWorkload.technicians.length) {
    return (
      <div className="workload-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading technician workload...</p>
        </div>
      </div>
    );
  }

  if (error.technicianWorkload) {
    return (
      <div className="workload-dashboard error">
        <div className="error-message">
          <h3>Error Loading Workload Data</h3>
          <p>{error.technicianWorkload}</p>
          <button className="btn btn-primary" onClick={handleManualRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workload-dashboard">
      <div className="dashboard-header">
        <h2>Technician Workload Dashboard</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleManualRefresh}
            disabled={loading.technicianWorkload}
          >
            {loading.technicianWorkload ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Technicians</h3>
            <p className="card-value">
              {technicianWorkload.summary?.total_technicians || 0}
            </p>
          </div>
        </div>

        <div className="summary-card available">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Available</h3>
            <p className="card-value">
              {technicianWorkload.summary?.available_technicians || 0}
            </p>
          </div>
        </div>

        <div className="summary-card busy">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Busy</h3>
            <p className="card-value">
              {technicianWorkload.summary?.busy_technicians || 0}
            </p>
          </div>
        </div>

        <div className="summary-card utilization">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Utilization Rate</h3>
            <p className="card-value">
              {technicianWorkload.summary?.utilization_rate || '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Technician List */}
      <div className="technician-list">
        <h3>Individual Technician Status</h3>
        
        {technicianWorkload.technicians.length === 0 ? (
          <div className="no-technicians">
            <p>No technicians found</p>
          </div>
        ) : (
          <div className="technician-grid">
            {technicianWorkload.technicians.map((techData: TechnicianWorkload) => {
              const utilization = calculateUtilization(
                techData.workload.current_appointments,
                techData.workload.max_capacity
              );
              
              return (
                <div 
                  key={techData.technician.id} 
                  className={`technician-card ${getTechnicianStatusClass(techData.workload.is_available)}`}
                >
                  <div className="technician-header">
                    <div className="technician-info">
                      <h4>{techData.technician.first_name} {techData.technician.last_name}</h4>
                      <p className="technician-role">{techData.technician.position}</p>
                    </div>
                    
                    <div className="status-indicator">
                      <span className={`status-badge ${techData.workload.is_available ? 'available' : 'busy'}`}>
                        {techData.workload.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  <div className="workload-stats">
                    <div className="stat-item">
                      <span className="stat-label">Current Jobs:</span>
                      <span className="stat-value">
                        {techData.workload.current_appointments}/{techData.workload.max_capacity}
                      </span>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Today's Appointments:</span>
                      <span className="stat-value">
                        {techData.workload.appointments_today}
                      </span>
                    </div>

                    <div className="utilization-bar">
                      <div className="utilization-label">
                        Utilization: {utilization}%
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${getUtilizationColor(utilization)}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {techData.current_jobs.length > 0 && (
                    <div className="current-jobs">
                      <h5>Current Jobs:</h5>
                      <ul className="job-list">
                        {techData.current_jobs.map((job: {
                          appointment_id: number;
                          vehicle: string;
                          customer: string;
                          status: string;
                          assigned_at: string;
                          started_at: string | null;
                        }) => (
                          <li key={job.appointment_id} className="job-item">
                            <div className="job-info">
                              <span className="job-id">#{job.appointment_id}</span>
                              <span className="job-customer">{job.customer}</span>
                            </div>
                            <div className="job-details">
                              <span className="job-vehicle">{job.vehicle}</span>
                              <span className={`job-status status-${job.status.replace('_', '-')}`}>
                                {job.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="job-time">
                              Started: {new Date(job.assigned_at).toLocaleTimeString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <p className="last-updated">
          Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default TechnicianWorkloadDashboard;
