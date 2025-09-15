import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import type { Appointment } from '../types/appointments';
import type { Employee } from '../types/employees';

interface TechnicianAssignmentModalProps {
  show: boolean;
  onHide: () => void;
  appointment: Appointment;
  availableTechnicians: Employee[];
  onSuccess?: () => void;
}

export const TechnicianAssignmentModal: React.FC<TechnicianAssignmentModalProps> = ({
  show,
  onHide,
  appointment,
  availableTechnicians,
  onSuccess
}) => {
  const { assignTechnicianToAppointment, loading, error } = useAutoRepairs();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTechnicianId) {
      setLocalError('Please select a technician');
      return;
    }

    try {
      setLocalError(null);
      await assignTechnicianToAppointment(appointment.id!, selectedTechnicianId);
      
      onSuccess?.();
      onHide();
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleClose = () => {
    setSelectedTechnicianId('');
    setLocalError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Technician</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {(error.assignTechnician || localError) && (
            <Alert variant="danger">
              {error.assignTechnician || localError}
            </Alert>
          )}

          <div className="mb-3">
            <h6>Appointment Details</h6>
            <p className="text-muted mb-1">
              <strong>Customer:</strong> {appointment.customer?.name}
            </p>
            <p className="text-muted mb-1">
              <strong>Vehicle:</strong> {appointment.vehicle ? 
                `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}` : 
                'Unknown Vehicle'
              }
            </p>
            <p className="text-muted mb-1">
              <strong>Service:</strong> {appointment.serviceType || 'General Service'}
            </p>
            <p className="text-muted">
              <strong>Date:</strong> {new Date(appointment.appointmentDate || appointment.scheduledDate || '').toLocaleString()}
            </p>
          </div>

          <Form.Group>
            <Form.Label>Select Technician</Form.Label>
            <Form.Select
              value={selectedTechnicianId}
              onChange={(e) => setSelectedTechnicianId(e.target.value)}
              required
            >
              <option value="">Choose a technician...</option>
              {availableTechnicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.first_name} {tech.last_name}
                  {tech.specialties && tech.specialties.length > 0 && 
                    ` - ${tech.specialties.join(', ')}`
                  }
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading.assignTechnician || !selectedTechnicianId}
          >
            {loading.assignTechnician ? (
              <>
                <Spinner size="sm" className="me-2" />
                Assigning...
              </>
            ) : (
              'Assign Technician'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
