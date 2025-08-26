/**
 * Simple Toyota Search Fix - Minimal Implementation
 * This component demonstrates the corrected search functionality
 * without modifying existing code
 */

import React, { useState } from "react";
import { Card, Button, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { apiClient } from "../utils/api";
import type { Vehicle } from "../types";

interface SearchResult {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
}

export const ToyotaSearchFix: React.FC = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>({
    vehicles: [],
    isLoading: false,
    error: null,
  });

  const searchVehicles = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setResult({ vehicles: [], isLoading: true, error: null });

    try {
      console.log(`🔍 Searching for: "${searchQuery}"`);

      // Direct API call with proper endpoint
      const response = await apiClient.get(
        `/shop/vehicles/?search=${encodeURIComponent(searchQuery.trim())}`
      );
      const vehicles = response.data || [];

      console.log(`✅ Search completed:`, {
        query: searchQuery,
        resultCount: vehicles.length,
        vehicles: vehicles.map(
          (v: Vehicle) => `${v.year} ${v.make} ${v.model}`
        ),
      });

      setResult({
        vehicles,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("❌ Search failed:", error);
      setResult({
        vehicles: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchVehicles(query);
  };

  const testToyotaSearch = () => {
    setQuery("toyota");
    searchVehicles("toyota");
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">🔧 Toyota Search Fix - Minimal Implementation</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row align-items-end">
            <div className="col-md-8">
              <Form.Group>
                <Form.Label>Search Vehicles</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter search term..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={result.isLoading}
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={result.isLoading || !query.trim()}
                >
                  {result.isLoading && <Spinner size="sm" className="me-1" />}
                  Search
                </Button>
                <Button
                  type="button"
                  variant="success"
                  onClick={testToyotaSearch}
                  disabled={result.isLoading}
                >
                  Test Toyota
                </Button>
              </div>
            </div>
          </div>
        </Form>

        {result.error && (
          <Alert variant="danger" className="mt-3">
            {result.error}
          </Alert>
        )}

        {result.vehicles.length > 0 && (
          <div className="mt-4">
            <h6>
              Search Results for "{query}"
              <Badge bg="primary" className="ms-2">
                {result.vehicles.length} vehicles
              </Badge>
            </h6>

            <div className="row">
              {result.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="col-md-6 mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h6>
                      <div className="text-muted">
                        <small>VIN: {vehicle.vin}</small>
                        <br />
                        {vehicle.license_plate && (
                          <small>License: {vehicle.license_plate}</small>
                        )}
                      </div>
                      {(vehicle as any).customer_email && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-info">
                            Owner: {(vehicle as any).customer_email}
                          </small>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result.isLoading &&
          !result.error &&
          result.vehicles.length === 0 &&
          query && (
            <div className="mt-3 text-muted text-center">
              No vehicles found for "{query}"
            </div>
          )}
      </Card.Body>
    </Card>
  );
};

export default ToyotaSearchFix;
