import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import type { Vehicle, Customer } from "../types/entities";
import { apiGet } from "../utils/api";
import {
  AddVehicleModal,
  AddCustomerModal,
  AddVehicleProblemModal,
} from "../components/modals";
import { formatVIN, formatPhoneNumber } from "../utils/validation";

export const VehicleManagement: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<
    (Vehicle & { customer_name: string })[]
  >([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<
    number | undefined
  >();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesResponse, customersResponse] = await Promise.all([
        apiGet<Vehicle[]>("/shop/vehicles/"),
        apiGet<Customer[]>("/shop/customers/"),
      ]);

      setCustomers(customersResponse);

      

      // ✅ Backend now provides customer_name directly - no need for complex lookup!
      const vehiclesWithCustomers = vehiclesResponse.map((vehicle) => {
        return {
          ...vehicle,
          customer_name: vehicle.customer_name || "Unknown Customer", // Use backend-provided customer_name
        };
      });

      setVehicles(vehiclesWithCustomers);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (entityType: string, _data: any) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    loadData(); // Refresh data
  };

  const handleReportProblem = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setShowProblemModal(true);
  };

  const getVehicleDisplayName = (
    vehicle: Vehicle & { customer_name: string }
  ) => {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading vehicles...</p>
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

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">🚗 Vehicle Management</h1>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => setShowCustomerModal(true)}
                className="d-flex align-items-center gap-2"
              >
                👤 Add Customer
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowVehicleModal(true)}
                className="d-flex align-items-center gap-2"
              >
                🚗 Add Vehicle
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-primary">{vehicles.length}</h2>
              <p className="mb-0">Total Vehicles</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-success">{customers.length}</h2>
              <p className="mb-0">Total Customers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-info">
                {customers.reduce(
                  (acc, customer) =>
                    acc +
                    vehicles.filter((v) => v.customer === customer.id).length,
                  0
                )}
              </h2>
              <p className="mb-0">Avg Vehicles/Customer</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vehicles Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🚗 Vehicle Registry</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {vehicles.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No vehicles registered yet</h5>
                  <p className="text-muted">
                    Start by adding your first vehicle!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowVehicleModal(true)}
                  >
                    Add First Vehicle
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>VIN</th>
                      <th>License Plate</th>
                      <th>Color</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <div>
                            <strong>{vehicle.customer_name}</strong>
                            <br />
                            <small className="text-muted">
                              {customers.find((c) => c.id === vehicle.customer)
                                ?.phone_number &&
                                formatPhoneNumber(
                                  customers.find(
                                    (c) => c.id === vehicle.customer
                                  )!.phone_number
                                )}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{getVehicleDisplayName(vehicle)}</strong>
                            <br />
                            <Badge bg="secondary">{vehicle.year}</Badge>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: "0.85em" }}>
                            {formatVIN(vehicle.vin)}
                          </code>
                        </td>
                        <td>
                          {vehicle.license_plate ? (
                            <Badge bg="info">{vehicle.license_plate}</Badge>
                          ) : (
                            <span className="text-muted">Not set</span>
                          )}
                        </td>
                        <td>
                          {vehicle.color ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: vehicle.color.toLowerCase(),
                                color: [
                                  "white",
                                  "yellow",
                                  "silver",
                                  "gray",
                                ].includes(vehicle.color.toLowerCase())
                                  ? "black"
                                  : "white",
                              }}
                            >
                              {vehicle.color}
                            </span>
                          ) : (
                            <span className="text-muted">Not specified</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleReportProblem(vehicle.id!)}
                              title="Report Problem"
                            >
                              ⚠️
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              title="Schedule Service"
                            >
                              📅
                            </Button>
                            <Button
                              size="sm"
                              variant="info"
                              title="View Details"
                            >
                              👁️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role-based information */}
      {user?.role === "customer" && (
        <Row className="mt-4">
          <Col>
            <Alert variant="info">
              <strong>Customer Portal:</strong> You can view your vehicles and
              report problems. Contact us to schedule service appointments.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSuccess={(data) => handleSuccess("Customer", data)}
      />

      <AddVehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        onSuccess={(data) => handleSuccess("Vehicle", data)}
      />

      <AddVehicleProblemModal
        show={showProblemModal}
        onHide={() => {
          setShowProblemModal(false);
          setSelectedVehicleId(undefined);
        }}
        onSuccess={(data) => handleSuccess("Problem Report", data)}
        vehicleId={selectedVehicleId}
      />
    </Container>
  );
};
