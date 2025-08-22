/**
 * Rebuilt Dashboard Search Component
 * Clean implementation using the new Dashboard Hook
 */

import React, { useState, useCallback } from "react";
import { Button, Form, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { useDashboard } from "../hooks/useDashboard";
import type { Vehicle, Customer } from "../types/entities";

// TODO: Replace this with the correct import if RepairJob is exported elsewhere
export type RepairJob = {
  id: number;
  description: string;
  vehicleId: number;
  estimatedCost: number;
  status: "completed" | "in-progress" | "cancelled" | string;
};

// Vehicle Card Component
const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  // Determine customer display info
  const hasCustomerInfo =
    vehicle.customer_name || vehicle.customer_email || vehicle.customer_phone;
  const customerDisplayName = vehicle.customer_name || "Customer";

  return (
    <Card className="mb-2">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h6>
            <small className="text-muted">VIN: {vehicle.vin}</small>
            {vehicle.license_plate && (
              <div>
                <small className="text-muted">
                  License: {vehicle.license_plate}
                </small>
              </div>
            )}
            {hasCustomerInfo && (
              <div className="mt-2 pt-2 border-top">
                <strong className="text-primary">
                  Owner: {customerDisplayName}
                </strong>
                {vehicle.customer_email && (
                  <div>
                    <small className="text-muted">
                      📧 {vehicle.customer_email}
                    </small>
                  </div>
                )}
                {vehicle.customer_phone && (
                  <div>
                    <small className="text-muted">
                      📞 {vehicle.customer_phone}
                    </small>
                  </div>
                )}
              </div>
            )}
            {!hasCustomerInfo && typeof vehicle.customer === "number" && (
              <div className="mt-2 pt-2 border-top">
                <small className="text-muted">
                  Customer ID: {vehicle.customer}
                </small>
              </div>
            )}
          </div>
          <Badge bg="secondary">{vehicle.id}</Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

// Customer Card Component
const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => (
  <Card className="mb-2">
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{customer.name}</h6>
          <small className="text-muted">{customer.email}</small>
          {customer.phone_number && (
            <div>
              <small className="text-muted">
                Phone: {customer.phone_number}
              </small>
            </div>
          )}
        </div>
        <Badge bg="info">{customer.id}</Badge>
      </div>
    </Card.Body>
  </Card>
);

// Repair Job Card Component
const RepairJobCard: React.FC<{ job: RepairJob }> = ({ job }) => (
  <Card className="mb-2">
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{job.description}</h6>
          <small className="text-muted">Vehicle ID: {job.vehicleId}</small>
          <div>
            <small className="text-muted">
              Estimated: ${job.estimatedCost}
            </small>
          </div>
        </div>
        <Badge
          bg={
            job.status === "completed"
              ? "success"
              : job.status === "in-progress"
              ? "warning"
              : job.status === "cancelled"
              ? "danger"
              : "primary"
          }
        >
          {job.status}
        </Badge>
      </div>
    </Card.Body>
  </Card>
);

// Main Dashboard Component
export const RebuildDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    error,
    lastSearchQuery,
    search,
    loadAll,
    clearResults,
  } = useDashboard();

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        await search(searchQuery.trim());
      }
    },
    [searchQuery, search]
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    clearResults();
    loadAll();
  }, [clearResults, loadAll]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">🔄 Dashboard Search</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <div className="row align-items-end">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Global Search</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search vehicles, customers, or repair jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !searchQuery.trim()}
                      >
                        {isLoading ? (
                          <Spinner size="sm" className="me-1" />
                        ) : null}
                        Search
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClear}
                        disabled={isLoading}
                      >
                        Clear Results
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {data && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>
                      {lastSearchQuery ? (
                        <>Search Results for "{lastSearchQuery}"</>
                      ) : (
                        <>All Records</>
                      )}
                    </h5>
                    <div className="d-flex gap-3">
                      <Badge bg="primary">
                        Vehicles: {data.totalCounts.vehicles}
                      </Badge>
                      <Badge bg="info">
                        Customers: {data.totalCounts.customers}
                      </Badge>
                      <Badge bg="warning">
                        Jobs: {data.totalCounts.repairOrders}
                      </Badge>
                    </div>
                  </div>

                  <div className="row">
                    {/* Vehicles Section */}
                    <div className="col-md-4">
                      <h6 className="border-bottom pb-2">
                        🚗 Vehicles ({data.vehicles.length})
                      </h6>
                      {data.vehicles.length > 0 ? (
                        data.vehicles.map((vehicle) => (
                          <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))
                      ) : (
                        <p className="text-muted">No vehicles found</p>
                      )}
                    </div>

                    {/* Customers Section */}
                    <div className="col-md-4">
                      <h6 className="border-bottom pb-2">
                        👤 Customers ({data.customers.length})
                      </h6>
                      {data.customers.length > 0 ? (
                        data.customers.map((customer) => (
                          <CustomerCard key={customer.id} customer={customer} />
                        ))
                      ) : (
                        <p className="text-muted">No customers found</p>
                      )}
                    </div>

                    {/* Repair Jobs Section */}
                    <div className="col-md-4">
                      <h6 className="border-bottom pb-2">
                        🔧 Repair Jobs ({data.repairOrders.length})
                      </h6>
                      {data.repairOrders.length > 0 ? (
                        data.repairOrders.map((job: any) => (
                          <RepairJobCard key={job.id} job={job} />
                        ))
                      ) : (
                        <p className="text-muted">No repair jobs found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RebuildDashboard;
