/**
 * Rebuilt Dashboard Search Component
 * Clean implementation using the new Dashboard Hook
 */

import React, { useState, useCallback } from "react";
import { Button, Form, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { useDashboard, useDashboardTest } from "../hooks/useDashboard";
import type { Vehicle, Customer } from "../types/entities";
import type { RepairJob } from "../services/dataAccessLayer";

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
  const { data, isLoading, error, search, loadAll, clearResults } =
    useDashboard();

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

  const handleTestToyota = useCallback(async () => {
    setSearchQuery("toyota");
    await search("toyota");
  }, [search]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">🔄 Rebuilt Dashboard Search</h4>
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
                        variant="success"
                        onClick={handleTestToyota}
                        disabled={isLoading}
                      >
                        Test: Search Toyota
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
                      {data.searchQuery ? (
                        <>Search Results for "{data.searchQuery}"</>
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
                        Jobs: {data.totalCounts.repairJobs}
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
                        🔧 Repair Jobs ({data.repairJobs.length})
                      </h6>
                      {data.repairJobs.length > 0 ? (
                        data.repairJobs.map((job) => (
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

// Test Component for debugging individual APIs
export const DashboardTestComponent: React.FC = () => {
  const [testQuery, setTestQuery] = useState("toyota");
  const {
    isLoading,
    lastResult,
    error,
    testVehicleSearch,
    testCustomerSearch,
    testRepairJobSearch,
    testHealthCheck,
  } = useDashboardTest();

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">🧪 API Test Panel</h5>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Test Query</Form.Label>
              <Form.Control
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Enter search query..."
              />
            </Form.Group>
            <div className="d-flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => testVehicleSearch(testQuery)}
                disabled={isLoading}
              >
                Test Vehicles
              </Button>
              <Button
                size="sm"
                variant="outline-info"
                onClick={() => testCustomerSearch(testQuery)}
                disabled={isLoading}
              >
                Test Customers
              </Button>
              <Button
                size="sm"
                variant="outline-warning"
                onClick={() => testRepairJobSearch(testQuery)}
                disabled={isLoading}
              >
                Test Repair Jobs
              </Button>
              <Button
                size="sm"
                variant="outline-success"
                onClick={testHealthCheck}
                disabled={isLoading}
              >
                Health Check
              </Button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light p-3 rounded">
              <strong>Test Result:</strong>
              {isLoading && (
                <div>
                  <Spinner size="sm" className="me-2" />
                  Testing...
                </div>
              )}
              {error && <div className="text-danger">Error: {error}</div>}
              {lastResult && (
                <div>
                  <div className="small text-success mb-2">
                    {lastResult.results
                      ? `Found ${lastResult.results.length} results`
                      : "Response received"}
                  </div>
                  <pre
                    className="mt-2 mb-0"
                    style={{
                      fontSize: "0.8em",
                      maxHeight: "200px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RebuildDashboard;
