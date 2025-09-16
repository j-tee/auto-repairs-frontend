import React, { useState, useEffect } from 'react';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import type { RepairOrder } from '../types/repairOrders';
import type { Employee } from '../types/employees';
import './TechnicianAssignmentCard.scss'; // Reuse the same styles

interface RepairOrderAssignmentCardProps {
  repairOrder: RepairOrder;
  onUpdate?: () => void;
}

export const RepairOrderAssignmentCard: React.FC<RepairOrderAssignmentCardProps> = ({ 
  repairOrder,
  onUpdate
}) => {
  const {
    availableTechnicians,
    loadAvailableTechnicians,
    assignTechnicianToAppointment, // Use appointment assignment instead of repair order
    startRepairOrderWork,
    completeRepairOrderWork,
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
      case 'approved': return 'status-approved';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'on_hold': return 'status-on-hold';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusDisplayName = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnicianId) {
      return;
    }

    if (!repairOrder.appointmentId) {
      return;
    }
    
    try {
      // Use appointment assignment since repair order status is stored in appointments
      const result = await assignTechnicianToAppointment(repairOrder.appointmentId, selectedTechnicianId);
      
      // Only close selector and refresh if assignment was successful
      if (result && result.type?.includes('fulfilled')) {
        setShowTechnicianSelector(false);
        setSelectedTechnicianId('');
        onUpdate?.();
      }
      // If assignment failed, error state will be shown via Redux error handling
    } catch (error) {
      // Error will be handled by Redux and displayed in UI
    }
  };

  const handleStartWork = async () => {
    if (!repairOrder.id) return;
    
    try {
      await startRepairOrderWork(repairOrder.id.toString());
      onUpdate?.();
    } catch (error) {
    }
  };

  const handleCompleteWork = async () => {
    if (!repairOrder.id) return;
    
    try {
      await completeRepairOrderWork(repairOrder.id.toString());
      onUpdate?.();
    } catch (error) {
    }
  };

  const canAssignTechnician = () => {
    return (repairOrder.status === 'pending' || repairOrder.status === 'approved') 
      && !repairOrder.assignedTechnician 
      && repairOrder.appointmentId; // Ensure appointment ID exists for assignment
  };

  const canReassignTechnician = () => {
    return (repairOrder.status === 'pending' || repairOrder.status === 'approved') 
      && repairOrder.assignedTechnician 
      && repairOrder.appointmentId; // Ensure appointment ID exists for reassignment
  };

  const canStartWork = () => {
    return repairOrder.status === 'approved' && repairOrder.assignedTechnician;
  };

  const canCompleteWork = () => {
    return repairOrder.status === 'in_progress';
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

    if (canReassignTechnician()) {
      return (
        <div className="action-section">
          {!showTechnicianSelector ? (
            <div className="d-flex gap-2">
              <button 
                className="btn btn-warning"
                onClick={handleStartWork}
                disabled={loading.repairOrders}
              >
                {loading.repairOrders ? 'Starting...' : 'Start Work'}
              </button>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowTechnicianSelector(true)}
                disabled={loading.repairOrders}
              >
                Reassign
              </button>
            </div>
          ) : (
            <div className="technician-selector">
              <label className="form-label">Reassign to:</label>
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
              <div className="selector-actions mt-2">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleAssignTechnician}
                  disabled={!selectedTechnicianId || loading.assignTechnician}
                >
                  Reassign
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
            disabled={loading.repairOrders}
          >
            {loading.repairOrders ? 'Starting...' : 'Start Work'}
          </button>
          {error.repairOrders && (
            <div className="error-message">
              {error.repairOrders}
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
            disabled={loading.repairOrders}
          >
            {loading.repairOrders ? 'Completing...' : 'Complete Work'}
          </button>
          {error.repairOrders && (
            <div className="error-message">
              {error.repairOrders}
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
          <h3 className="customer-name">
            {repairOrder.customer?.name || 'Unknown Customer'}
          </h3>
          <p className="vehicle-info">
            {repairOrder.vehicle?.year} {repairOrder.vehicle?.make} {repairOrder.vehicle?.model}
          </p>
          <p className="license-plate">{repairOrder.vehicle?.licensePlate}</p>
          <p className="order-number">Order: {repairOrder.orderNumber}</p>
        </div>
        
        <div className="status-section">
          <span className={`status-badge ${getStatusColor(repairOrder.status || 'pending')}`}>
            {getStatusDisplayName(repairOrder.status || 'pending')}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="appointment-details">
          <p className="description">
            <strong>Service:</strong> {repairOrder.description || 'Repair Service'}
          </p>
          {repairOrder.diagnosis && (
            <p className="diagnosis">
              <strong>Diagnosis:</strong> {repairOrder.diagnosis}
            </p>
          )}
          <p className="priority">
            <strong>Priority:</strong> 
            <span className={`priority-badge priority-${repairOrder.priority}`}>
              {repairOrder.priority?.toUpperCase()}
            </span>
          </p>
          <p className="total-cost">
            <strong>Total:</strong> ${repairOrder.total?.toFixed(2)}
          </p>
          {repairOrder.estimatedCompletionDate && (
            <p className="estimated-completion">
              <strong>Est. Completion:</strong> {new Date(repairOrder.estimatedCompletionDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {repairOrder.technician && (
          <div className="technician-info">
            <h4>Assigned Technician</h4>
            <p className="technician-name">
              <strong>{repairOrder.technician.firstName} {repairOrder.technician.lastName}</strong>
            </p>
            
            {repairOrder.createdAt && (
              <p className="assignment-time">
                Created: {new Date(repairOrder.createdAt).toLocaleString()}
              </p>
            )}
            
            {repairOrder.actualCompletionDate && (
              <p className="completion-time">
                Completed: {new Date(repairOrder.actualCompletionDate).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {getActionButtons()}

        

        {/* Warning when appointment ID is missing */}
        {!repairOrder.appointmentId && (repairOrder.status === 'pending' || repairOrder.status === 'approved') && (
          <div className="alert alert-warning mt-3">
            <strong>⚠️ Notice:</strong> This repair order is not linked to an appointment. 
            Technician assignment requires a linked appointment. Please contact your administrator.
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairOrderAssignmentCard;
