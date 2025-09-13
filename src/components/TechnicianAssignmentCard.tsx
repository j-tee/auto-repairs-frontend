import React, { useState, useEffect } from 'react';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import type { Appointment } from '../types/appointments';
import type { Employee } from '../types/employees';
import './TechnicianAssignmentCard.scss';

interface TechnicianAssignmentCardProps {
  appointment: Appointment;
}

export const TechnicianAssignmentCard: React.FC<TechnicianAssignmentCardProps> = ({ 
  appointment 
}) => {
  const {
    availableTechnicians,
    loadAvailableTechnicians,
    assignTechnicianToAppointment,
    startAppointmentWork,
    completeAppointmentWork,
    loading,
    error
  } = useAutoRepairs();

  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [showTechnicianSelector, setShowTechnicianSelector] = useState(false);

  // Load available technicians on component mount
  useEffect(() => {
    loadAvailableTechnicians();
  }, [loadAvailableTechnicians]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusDisplayName = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnicianId) return;
    
    try {
      await assignTechnicianToAppointment(appointment.id!, selectedTechnicianId);
      setShowTechnicianSelector(false);
      setSelectedTechnicianId('');
    } catch (error) {
      console.error('Failed to assign technician:', error);
    }
  };

  const handleStartWork = async () => {
    try {
      await startAppointmentWork(appointment.id!);
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  const handleCompleteWork = async () => {
    try {
      await completeAppointmentWork(appointment.id!);
    } catch (error) {
      console.error('Failed to complete work:', error);
    }
  };

  const canAssignTechnician = () => {
    return appointment.status === 'pending';
  };

  const canStartWork = () => {
    return appointment.status === 'assigned' && appointment.assigned_technician;
  };

  const canCompleteWork = () => {
    return appointment.status === 'in_progress';
  };

  const getActionButtons = () => {
    if (canAssignTechnician()) {
      return (
        <div className="action-section">
          {!showTechnicianSelector ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowTechnicianSelector(true)}
              disabled={loading.assignTechnician}
            >
              {loading.assignTechnician ? 'Assigning...' : 'Assign Technician'}
            </button>
          ) : (
            <div className="technician-selector">
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="form-select"
              >
                <option value="">Select a technician...</option>
                {availableTechnicians.map((tech: Employee) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.first_name} {tech.last_name} - {tech.position}
                  </option>
                ))}
              </select>
              <div className="selector-actions">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleAssignTechnician}
                  disabled={!selectedTechnicianId || loading.assignTechnician}
                >
                  Assign
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowTechnicianSelector(false);
                    setSelectedTechnicianId('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {error.assignTechnician && (
            <div className="error-message">
              {error.assignTechnician}
            </div>
          )}
        </div>
      );
    }

    if (canStartWork()) {
      return (
        <div className="action-section">
          <button 
            className="btn btn-warning"
            onClick={handleStartWork}
            disabled={loading.startWork}
          >
            {loading.startWork ? 'Starting...' : 'Start Work'}
          </button>
          {error.startWork && (
            <div className="error-message">
              {error.startWork}
            </div>
          )}
        </div>
      );
    }

    if (canCompleteWork()) {
      return (
        <div className="action-section">
          <button 
            className="btn btn-success"
            onClick={handleCompleteWork}
            disabled={loading.completeWork}
          >
            {loading.completeWork ? 'Completing...' : 'Complete Work'}
          </button>
          {error.completeWork && (
            <div className="error-message">
              {error.completeWork}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="technician-assignment-card">
      <div className="card-header">
        <div className="appointment-info">
          <h3 className="customer-name">{appointment.customer?.name || 'Unknown Customer'}</h3>
          <p className="vehicle-info">
            {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
          </p>
          <p className="license-plate">{appointment.vehicle?.license_plate}</p>
        </div>
        
        <div className="status-section">
          <span className={`status-badge ${getStatusColor(appointment.status || 'pending')}`}>
            {getStatusDisplayName(appointment.status || 'pending')}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="appointment-details">
          <p className="description">
            <strong>Service:</strong> {appointment.description || 'General Service'}
          </p>
          <p className="scheduled-time">
            <strong>Scheduled:</strong> {appointment.scheduledDate} at {appointment.scheduledTime}
          </p>
        </div>

        {appointment.assigned_technician && (
          <div className="technician-info">
            <h4>Assigned Technician</h4>
            <p className="technician-name">
              <strong>{appointment.assigned_technician.first_name} {appointment.assigned_technician.last_name}</strong>
            </p>
            <p className="technician-role">{appointment.assigned_technician.position}</p>
            
            {appointment.assigned_at && (
              <p className="assignment-time">
                Assigned: {new Date(appointment.assigned_at).toLocaleString()}
              </p>
            )}
            
            {appointment.started_at && (
              <p className="start-time">
                Started: {new Date(appointment.started_at).toLocaleString()}
              </p>
            )}
            
            {appointment.completed_at && (
              <p className="completion-time">
                Completed: {new Date(appointment.completed_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {getActionButtons()}
      </div>
    </div>
  );
};

export default TechnicianAssignmentCard;
