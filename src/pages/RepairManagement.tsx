import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useAutoRepairs } from "../hooks/useAutoRepairs";
import { useAuth } from "../hooks/useAuth";
import { TechnicianAssignmentCard } from "../components/TechnicianAssignmentCard";
import { TechnicianDebugComponent } from "../components/TechnicianDebugComponent";

export const RepairManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    repairOrders,
    appointments,
    vehicles,
    customers,
    employees,
    loading,
    error,
    loadRepairOrders,
    loadAppointments,
    loadVehicles,
    loadCustomers,
    loadEmployees,
  } = useAutoRepairs();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View mode for appointments
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setSuccessMessage(null);

        // Use Redux slice actions to load data
        await Promise.all([
          loadRepairOrders(),
          loadAppointments(),
          loadVehicles(),
          loadCustomers(),
          loadEmployees(),
        ]);

        console.log("RepairManagement data loaded via Redux");
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional to run only on mount

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadRepairOrders(),
        loadAppointments(),
        loadVehicles(),
        loadCustomers(),
        loadEmployees(),
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  }, [loadRepairOrders, loadAppointments, loadVehicles, loadCustomers, loadEmployees]);

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  const getCustomerInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    console.log('Finding customer for vehicleId:', vehicleId, 'Found vehicle:', vehicle);
    if (!vehicle) return "Unknown Customer";
    const customer = customers.find((c) => c.id === vehicle.customer?.id);
    if (!customer) return "Unknown Customer";

    // Customer has a single 'name' field according to Django model
    return customer.name || "Unknown Customer";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "in-progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (
    loading.repairOrders ||
    loading.vehicles ||
    loading.customers
  ) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading repair data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {(error.repairOrders ||
        error.vehicles ||
        error.customers ||
        error.technicianWorkload) && (
        <Alert variant="danger" dismissible>
          {error.repairOrders ||
            error.vehicles ||
            error.customers ||
            error.technicianWorkload}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">🔧 Repair Management</h1>
          <p className="text-muted">Manage repair orders and appointments</p>
        </Col>
      </Row>

      {/* Debug Component - Remove after fixing */}
      <TechnicianDebugComponent />

      <Tabs defaultActiveKey="repair-orders" className="mb-4">
        <Tab eventKey="repair-orders" title="Repair Orders">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Repair Orders</h5>
              <Button
                variant="primary"
                size="sm"
                disabled
              >
                + New Repair Order
              </Button>
            </Card.Header>
            <Card.Body>
              {repairOrders.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No repair orders found
                </p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Estimated Cost</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{getVehicleInfo(order.vehicleId)}</td>
                        <td>{getCustomerInfo(order.vehicleId)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>${order.estimatedCost?.toFixed(2) || "0.00"}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="Appointments">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Appointments</h5>
              <div className="d-flex gap-2">
                {(user?.role === 'employee' || user?.role === 'owner' || user?.role === 'admin' || user?.role === 'manager') && (
                  <>
                    <Button
                      variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('cards')}
                      size="sm"
                    >
                      📋 Cards
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('table')}
                      size="sm"
                    >
                      📊 Table
                    </Button>
                  </>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  disabled
                >
                  + New Appointment
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {appointments.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No appointments scheduled
                </p>
              ) : (
                <>
                  {/* Employee/Owner View - Technician Assignment Interface */}
                  {(user?.role === 'employee' || user?.role === 'owner' || user?.role === 'admin' || user?.role === 'manager') && (
                    <>
                      {viewMode === 'cards' ? (
                        <Row>
                          {appointments.map((appointment) => (
                            <Col md={6} lg={4} key={appointment.id} className="mb-3">
                              <TechnicianAssignmentCard
                                appointment={appointment}
                                onUpdate={() => {
                                  refreshData();
                                  setSuccessMessage("Appointment updated successfully!");
                                  setTimeout(() => setSuccessMessage(null), 3000);
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Vehicle</th>
                              <th>Customer</th>
                              <th>Service Type</th>
                              <th>Status</th>
                              <th>Technician</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td>
                                  {new Date(
                                    appointment.appointmentDate || appointment.scheduledDate || ''
                                  ).toLocaleString()}
                                </td>
                                <td>{getVehicleInfo(appointment.vehicleId || appointment.vehicle_id || 0)}</td>
                                <td>{getCustomerInfo(appointment.vehicleId || appointment.vehicle_id || 0)}</td>
                                <td>{appointment.serviceType || "General Service"}</td>
                                <td>
                                  <Badge bg={getStatusBadgeVariant(appointment.status || 'pending')}>
                                    {appointment.status}
                                  </Badge>
                                </td>
                                <td>
                                  {appointment.assigned_technician ? 
                                    `${appointment.assigned_technician.first_name} ${appointment.assigned_technician.last_name}` : 
                                    <span className="text-muted">Unassigned</span>
                                  }
                                </td>
                                <td>
                                  <Button variant="outline-primary" size="sm">
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </>
                  )}
                  
                  {/* Customer View - Card Layout */}
                  {user?.role === 'customer' && (
                    <Row>
                      {appointments.map((appointment) => (
                        <Col md={6} lg={4} key={appointment.id} className="mb-3">
                          <Card className="h-100">
                            <Card.Header>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  {new Date(appointment.appointmentDate || appointment.scheduledDate || '').toLocaleDateString()}
                                </small>
                                <Badge bg={getStatusBadgeVariant(appointment.status || 'pending')}>
                                  {appointment.status}
                                </Badge>
                              </div>
                            </Card.Header>
                            <Card.Body>
                              <h6>{getVehicleInfo(appointment.vehicleId || appointment.vehicle_id || 0)}</h6>
                              <p className="text-muted mb-2">
                                {appointment.serviceType || "General Service"}
                              </p>
                              <small className="text-muted">
                                {new Date(appointment.appointmentDate || appointment.scheduledDate || '').toLocaleTimeString()}
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="technicians" title="Technician Management">
          {/* Check if user has technician management permissions */}
          {user && (user.role === 'owner' || user.role === 'employee' || user.role === 'admin' || user.role === 'manager') ? (
            <div>
              <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-success">
                      {(() => {
                        const totalTechnicians = employees.filter(emp => 
                          emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')
                        ).length;
                        const busyTechnicians = appointments.filter(apt => apt.assigned_technician).length;
                        return Math.max(0, totalTechnicians - busyTechnicians);
                      })()}
                    </h3>
                    <p className="mb-0">Available Technicians</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-warning">
                      {appointments.filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress')).length}
                    </h3>
                    <p className="mb-0">Busy Technicians</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-info">
                      {employees.filter(emp => 
                        emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')
                      ).length}
                    </h3>
                    <p className="mb-0">Total Technicians</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-primary">
                      {(() => {
                        const totalTechs = employees.filter(emp => 
                          emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')
                        ).length;
                        const busyTechs = appointments.filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress')).length;
                        return totalTechs > 0 ? `${Math.round((busyTechs / totalTechs) * 100)}%` : "0%";
                      })()}
                    </h3>
                    <p className="mb-0">Utilization Rate</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Unassigned Appointments Section */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">🔄 Unassigned Appointments</h5>
              </Card.Header>
              <Card.Body>
                {appointments.filter(apt => !apt.assigned_technician).length === 0 ? (
                  <p className="text-muted text-center py-3">
                    ✅ All appointments are assigned to technicians
                  </p>
                ) : (
                  <Row>
                    {appointments
                      .filter(apt => !apt.assigned_technician)
                      .map((appointment) => (
                        <Col md={6} lg={4} key={appointment.id} className="mb-3">
                          <TechnicianAssignmentCard
                            appointment={appointment}
                            onUpdate={() => {
                              // Only refresh data, success will be handled by component's Redux state
                              refreshData();
                            }}
                          />
                        </Col>
                      ))
                    }
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Active Assignments Section */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">⚡ Active Assignments</h5>
              </Card.Header>
              <Card.Body>
                {appointments.filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress')).length === 0 ? (
                  <p className="text-muted text-center py-3">
                    No active assignments
                  </p>
                ) : (
                  <Row>
                    {appointments
                      .filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress'))
                      .map((appointment) => (
                        <Col md={6} lg={4} key={appointment.id} className="mb-3">
                          <TechnicianAssignmentCard
                            appointment={appointment}
                            onUpdate={() => {
                              refreshData();
                              setSuccessMessage("Assignment updated successfully!");
                              setTimeout(() => setSuccessMessage(null), 3000);
                            }}
                          />
                        </Col>
                      ))
                    }
                  </Row>
                )}
              </Card.Body>
            </Card>



            {/* Technician Workload Dashboard */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">📊 Technician Workload Dashboard</h5>
              </Card.Header>
              <Card.Body>
                {employees.filter(emp => emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')).length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No technicians found
                  </p>
                ) : (
                  <Row>
                    {employees
                      .filter(emp => emp.role === 'technician' || emp.position?.toLowerCase().includes('tech'))
                      .map((technician) => {
                        const assignedJobs = appointments.filter(apt => 
                          apt.assigned_technician?.id === technician.id ||
                          apt.assigned_technician?.first_name === technician.first_name
                        );
                        const currentJobs = assignedJobs.filter(apt => 
                          apt.status === 'assigned' || apt.status === 'in_progress'
                        );
                        const isAvailable = currentJobs.length < 3; // Assume max 3 concurrent jobs

                        return (
                          <Col md={6} lg={4} key={technician.id} className="mb-3">
                            <Card className="h-100">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  {technician.first_name} {technician.last_name}
                                </h6>
                                <Badge bg={isAvailable ? "success" : "warning"}>
                                  {isAvailable ? "Available" : "Busy"}
                                </Badge>
                              </Card.Header>
                              <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                  <span>Current Jobs:</span>
                                  <strong>{currentJobs.length}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                  <span>Total Assignments:</span>
                                  <strong>{assignedJobs.length}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                  <span>Max Capacity:</span>
                                  <strong>3</strong>
                                </div>
                                
                                {currentJobs.length > 0 && (
                                  <>
                                    <h6 className="mb-2">Current Jobs:</h6>
                                    {currentJobs.map((job) => (
                                      <div key={job.id} className="border rounded p-2 mb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <small className="fw-bold">
                                            {getVehicleInfo(job.vehicleId || job.vehicle_id || 0)}
                                          </small>
                                          <Badge bg={getStatusBadgeVariant(job.status || 'pending')}>
                                            {job.status}
                                          </Badge>
                                        </div>
                                        <small className="text-muted d-block">
                                          {getCustomerInfo(job.vehicleId || job.vehicle_id || 0)}
                                        </small>
                                        <small className="text-muted">
                                          Service: {job.serviceType || 'General Service'}
                                        </small>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Quick Actions Section */}
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">⚡ Quick Management Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Button 
                      variant="primary" 
                      className="w-100 mb-2"
                      onClick={() => {
                        refreshData();
                        setSuccessMessage("Data refreshed!");
                        setTimeout(() => setSuccessMessage(null), 2000);
                      }}
                      disabled={loading.appointments}
                    >
                      🔄 Refresh All Data
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      variant="info" 
                      className="w-100 mb-2"
                      onClick={() => {
                        // Auto-assign logic could go here
                        alert("Auto-assignment feature coming soon!");
                      }}
                    >
                      🤖 Auto-Assign Available
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      variant="warning" 
                      className="w-100 mb-2"
                      onClick={() => {
                        // Workload balancing logic could go here
                        alert("Workload balancing feature coming soon!");
                      }}
                    >
                      ⚖️ Balance Workloads
                    </Button>
                  </Col>
                </Row>
                
                <div className="mt-3 pt-3 border-top">
                  <Row>
                    <Col md={6}>
                      <h6>📋 Today's Summary</h6>
                      <ul className="list-unstyled mb-0">
                        <li>• Total Appointments: {appointments.length}</li>
                        <li>• Unassigned Appointments: {appointments.filter(apt => !apt.assigned_technician).length}</li>
                        <li>• Total Repair Orders: {repairOrders.length}</li>
                        <li>• In Progress: {[...appointments, ...repairOrders].filter(item => item.status === 'in_progress').length}</li>
                        <li>• Completed: {[...appointments, ...repairOrders].filter(item => item.status === 'completed').length}</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6>👥 Technician Status</h6>
                      <ul className="list-unstyled mb-0">
                        <li>• Available: <Badge bg="success">
                          {(() => {
                            const totalTechnicians = employees.filter(emp => 
                              emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')
                            ).length;
                            const busyTechnicians = appointments.filter(apt => apt.assigned_technician).length;
                            return Math.max(0, totalTechnicians - busyTechnicians);
                          })()}
                        </Badge></li>
                        <li>• Busy: <Badge bg="warning">
                          {appointments.filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress')).length}
                        </Badge></li>
                        <li>• Utilization: <Badge bg="info">
                          {(() => {
                            const totalTechs = employees.filter(emp => 
                              emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')
                            ).length;
                            const busyTechs = appointments.filter(apt => apt.assigned_technician && (apt.status === 'assigned' || apt.status === 'in_progress')).length;
                            return totalTechs > 0 ? `${Math.round((busyTechs / totalTechs) * 100)}%` : "0%";
                          })()}
                        </Badge></li>
                      </ul>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            </div>
          ) : (
            <div>
              <div className="alert alert-warning mb-3" style={{fontSize: '12px'}}>
                ❌ Access denied - Role check failed for role: {user?.role || 'undefined'}
              </div>
              <Card>
                <Card.Body className="text-center py-5">
                  <h5>Access Restricted</h5>
                  <p className="text-muted">
                    Technician management is only available to shop employees and owners.
                  </p>
                </Card.Body>
              </Card>
            </div>
          )}
        </Tab>

        <Tab eventKey="dashboard" title="Dashboard">
          <Row>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{repairOrders.filter(repair => (repair.status ==='in_progress')).length}</h3>
                  <p className="mb-0">Active Repair Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">{appointments.length}</h3>
                  <p className="mb-0">Scheduled Appointments</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{vehicles.length}</h3>
                  <p className="mb-0">Total Vehicles</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{customers.length}</h3>
                  <p className="mb-0">Total Customers</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Add modals here when needed */}
    </Container>
  );
};
