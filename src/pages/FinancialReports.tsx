import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Form,
  Button,
  Table,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import { usePermissions } from "../hooks/usePermissions";

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  topServices: Array<{
    service: string;
    revenue: number;
    count: number;
  }>;
  shopPerformance: Array<{
    shopName: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export const FinancialReports: React.FC = () => {
  const { canViewFinancialData } = usePermissions();
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    if (!canViewFinancialData) {
      setError(
        "Access denied. Owner privileges required for financial reports."
      );
      setLoading(false);
      return;
    }
    loadFinancialData();
  }, [canViewFinancialData, dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Mock financial data - replace with actual API call
      const mockData: FinancialData = {
        totalRevenue: 450000,
        totalExpenses: 325000,
        netProfit: 125000,
        monthlyRevenue: [
          { month: "Jan", revenue: 35000, expenses: 25000, profit: 10000 },
          { month: "Feb", revenue: 42000, expenses: 28000, profit: 14000 },
          { month: "Mar", revenue: 38000, expenses: 26000, profit: 12000 },
          { month: "Apr", revenue: 45000, expenses: 32000, profit: 13000 },
          { month: "May", revenue: 52000, expenses: 35000, profit: 17000 },
          { month: "Jun", revenue: 48000, expenses: 31000, profit: 17000 },
        ],
        topServices: [
          { service: "Oil Change", revenue: 85000, count: 850 },
          { service: "Brake Repair", revenue: 75000, count: 150 },
          { service: "Engine Diagnostic", revenue: 65000, count: 130 },
          { service: "Transmission Service", revenue: 55000, count: 55 },
          { service: "Tire Replacement", revenue: 45000, count: 180 },
        ],
        shopPerformance: [
          {
            shopName: "Downtown Auto Repair",
            revenue: 275000,
            expenses: 195000,
            profit: 80000,
          },
          {
            shopName: "Westside Service Center",
            revenue: 175000,
            expenses: 130000,
            profit: 45000,
          },
        ],
      };
      setFinancialData(mockData);
    } catch (error) {
      console.error("Failed to load financial data:", error);
      setError("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  if (!canViewFinancialData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>
            You don't have permission to access financial reports. Owner
            privileges are required.
          </p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading financial reports...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">💰 Financial Reports</h1>
            <div className="d-flex gap-2">
              <Form.Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ width: "auto" }}
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </Form.Select>
              <Button variant="outline-primary">📊 Export Report</Button>
            </div>
          </div>
        </Col>
      </Row>

      {financialData && (
        <>
          {/* Key Metrics */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-success">
                    ${financialData.totalRevenue.toLocaleString()}
                  </h3>
                  <p className="mb-0">Total Revenue</p>
                  <small className="text-muted">Last {dateRange} days</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-warning">
                    ${financialData.totalExpenses.toLocaleString()}
                  </h3>
                  <p className="mb-0">Total Expenses</p>
                  <small className="text-muted">Last {dateRange} days</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-primary">
                    ${financialData.netProfit.toLocaleString()}
                  </h3>
                  <p className="mb-0">Net Profit</p>
                  <small className="text-muted">Last {dateRange} days</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="overview" className="mb-4">
            <Tab eventKey="overview" title="📈 Overview">
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5>Monthly Performance</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Revenue</th>
                            <th>Expenses</th>
                            <th>Profit</th>
                            <th>Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialData.monthlyRevenue.map((month) => (
                            <tr key={month.month}>
                              <td>
                                <strong>{month.month}</strong>
                              </td>
                              <td className="text-success">
                                ${month.revenue.toLocaleString()}
                              </td>
                              <td className="text-warning">
                                ${month.expenses.toLocaleString()}
                              </td>
                              <td className="text-primary">
                                ${month.profit.toLocaleString()}
                              </td>
                              <td>
                                <Badge bg="info">
                                  {(
                                    (month.profit / month.revenue) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="services" title="🔧 Services">
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5>Top Performing Services</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Revenue</th>
                            <th>Count</th>
                            <th>Avg. Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialData.topServices.map((service, index) => (
                            <tr key={service.service}>
                              <td>
                                <Badge bg="secondary" className="me-2">
                                  #{index + 1}
                                </Badge>
                                <strong>{service.service}</strong>
                              </td>
                              <td className="text-success">
                                ${service.revenue.toLocaleString()}
                              </td>
                              <td>{service.count}</td>
                              <td>
                                ${(service.revenue / service.count).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="shops" title="🏪 Shops">
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5>Shop Performance Comparison</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Shop</th>
                            <th>Revenue</th>
                            <th>Expenses</th>
                            <th>Profit</th>
                            <th>Margin</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialData.shopPerformance.map((shop) => (
                            <tr key={shop.shopName}>
                              <td>
                                <strong>{shop.shopName}</strong>
                              </td>
                              <td className="text-success">
                                ${shop.revenue.toLocaleString()}
                              </td>
                              <td className="text-warning">
                                ${shop.expenses.toLocaleString()}
                              </td>
                              <td className="text-primary">
                                ${shop.profit.toLocaleString()}
                              </td>
                              <td>
                                <Badge bg="info">
                                  {((shop.profit / shop.revenue) * 100).toFixed(
                                    1
                                  )}
                                  %
                                </Badge>
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    shop.profit > 50000 ? "success" : "warning"
                                  }
                                >
                                  {shop.profit > 50000 ? "Excellent" : "Good"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};
