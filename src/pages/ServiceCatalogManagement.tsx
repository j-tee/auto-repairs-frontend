import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import type { Service } from "../types/entities";
import { apiGet } from "../utils/api";

export const ServiceCatalogManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for services
  const [services, setServices] = useState<Service[]>([]);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);


      const servicesResponse = await apiGet<Service[]>("/shop/services/");

      setServices(servicesResponse);
    } catch (err) {
      setError(
        `Failed to load services: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (entityType: string, _data: any) => {
    setSuccessMessage(`${entityType} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    loadData(); // Refresh data
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading service catalog...</p>
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
          <h1 className="mb-0">⚙️ Service Catalog</h1>
          <p className="text-muted">Manage your shop's service offerings</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowServiceModal(true)}>
            + Add Service
          </Button>
        </Col>
      </Row>

      {/* Services Grid */}
      <Row>
        {services.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <h5>No services defined</h5>
                <p className="text-muted">Add your first service offering!</p>
                <Button
                  variant="info"
                  onClick={() => setShowServiceModal(true)}
                >
                  Add First Service
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          services.map((service) => (
            <Col key={service.id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">⚙️ {service.name}</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h4 className="text-success">
                      $
                      {service.price
                        ? parseFloat(service.price.toString()).toFixed(2)
                        : service.labor_cost
                        ? parseFloat(service.labor_cost).toFixed(2)
                        : "0.00"}
                    </h4>
                  </div>
                  {service.description && (
                    <p className="text-muted">{service.description}</p>
                  )}
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Category:</strong> {service.category || "General"}
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Warranty:</strong> {service.warranty_months}{" "}
                      months
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Taxable:</strong> {service.taxable ? "Yes" : "No"}
                    </small>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-light">
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="flex-grow-1"
                      title="Edit Service"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      title="Delete Service"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Role-based access information */}
      {user?.role === "customer" && (
        <Row className="mt-4">
          <Col>
            <Alert variant="info">
              <strong>Customer View:</strong> You can view available services
              and schedule appointments. Contact the shop to create custom
              service requests.
            </Alert>
          </Col>
        </Row>
      )}

      {user?.role === "employee" && (
        <Row className="mt-4">
          <Col>
            <Alert variant="warning">
              <strong>Employee Access:</strong> You can view and schedule
              services. Contact your shop owner to add or modify service
              offerings.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};
