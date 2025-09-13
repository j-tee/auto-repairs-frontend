import React, { useEffect, useState } from 'react';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import { TechnicianAssignmentCard, TechnicianWorkloadDashboard } from '../components';
import type { Appointment } from '../types/appointments';
import { APPOINTMENT_STATUSES } from '../types/appointments';
import './TechnicianManagementPage.scss';

/**
 * TechnicianManagementPage - Example implementation of the Technician Assignment System
 * 
 * This page demonstrates how to integrate the new technician assignment workflow
 * with your existing AutoRepairDashboard and Redux implementation.
 * 
 * Key Features:
 * - View appointments by status (pending, assigned, in_progress, completed)
 * - Assign technicians to appointments
 * - Track work progress (start work, complete work)
 * - Monitor technician workload in real-time
 */
export const TechnicianManagementPage: React.FC = () => {
  const {
    appointments,
    loading,
    error,
    loadAppointments,
    loadTechnicianWorkload,
    loadAvailableTechnicians
  } = useAutoRepairs();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'appointments' | 'workload'>('appointments');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load appointments (you can add filters based on your needs)
        await loadAppointments();
        
        // Load technician-related data
        await loadTechnicianWorkload();
        await loadAvailableTechnicians();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [loadAppointments, loadTechnicianWorkload, loadAvailableTechnicians]);

  // Filter appointments by status
  const filteredAppointments = React.useMemo(() => {
    if (selectedStatus === 'all') return appointments;
    return appointments.filter(apt => apt.status === selectedStatus);
  }, [appointments, selectedStatus]);

  // Group appointments by status for overview
  const appointmentsByStatus = React.useMemo(() => {
    return {
      pending: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.PENDING),
      assigned: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.ASSIGNED),
      in_progress: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.IN_PROGRESS),
      completed: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.COMPLETED),
      cancelled: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.CANCELLED),
    };
  }, [appointments]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  if (loading.appointments && appointments.length === 0) {
    return (
      <div className="technician-management-page loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error.appointments) {
    return (
      <div className="technician-management-page error">
        <div className="error-container">
          <h2>Error Loading Appointments</h2>
          <p>{error.appointments}</p>
          <button 
            className="btn btn-primary"
            onClick={() => loadAppointments()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-management-page">
      <div className="page-header">
        <h1>Technician Management</h1>
        <p className="page-description">
          Manage technician assignments and monitor workload across all appointments
        </p>
        
        <div className="view-toggle">
          <button 
            className={`btn ${viewMode === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`btn ${viewMode === 'workload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('workload')}
          >
            👥 Workload Dashboard
          </button>
        </div>
      </div>

      {viewMode === 'appointments' ? (
        <div className="appointments-view">
          {/* Status Overview Cards */}
          <div className="status-overview">
            <div className="status-cards">
              <div 
                className={`status-card ${selectedStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                <h3>All Appointments</h3>
                <p className="count">{appointments.length}</p>
              </div>
              
              <div 
                className={`status-card pending ${selectedStatus === 'pending' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('pending')}
              >
                <h3>Pending Assignment</h3>
                <p className="count">{appointmentsByStatus.pending.length}</p>
              </div>
              
              <div 
                className={`status-card assigned ${selectedStatus === 'assigned' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('assigned')}
              >
                <h3>Assigned</h3>
                <p className="count">{appointmentsByStatus.assigned.length}</p>
              </div>
              
              <div 
                className={`status-card in-progress ${selectedStatus === 'in_progress' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('in_progress')}
              >
                <h3>In Progress</h3>
                <p className="count">{appointmentsByStatus.in_progress.length}</p>
              </div>
              
              <div 
                className={`status-card completed ${selectedStatus === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('completed')}
              >
                <h3>Completed</h3>
                <p className="count">{appointmentsByStatus.completed.length}</p>
              </div>
            </div>
          </div>

          {/* Appointment Cards */}
          <div className="appointments-container">
            <div className="section-header">
              <h2>
                {selectedStatus === 'all' 
                  ? 'All Appointments' 
                  : `${selectedStatus.replace('_', ' ').toUpperCase()} Appointments`
                }
              </h2>
              <p className="count-info">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </p>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>No appointments found for the selected status.</p>
              </div>
            ) : (
              <div className="appointment-grid">
                {filteredAppointments.map((appointment: Appointment) => (
                  <TechnicianAssignmentCard 
                    key={appointment.id} 
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="workload-view">
          <TechnicianWorkloadDashboard />
        </div>
      )}
    </div>
  );
};

export default TechnicianManagementPage;
