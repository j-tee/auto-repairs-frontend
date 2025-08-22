import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { appointmentMngtService, vehicleProblemService } from "../services";
import "./DashboardStats.scss";

interface DashboardStatsProps {
  className?: string;
}

interface StatsData {
  appointments: {
    totalAppointments: number;
    todaysAppointments: number;
    upcomingAppointments: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
    appointmentsByStatus: {
      scheduled: number;
      confirmed: number;
      in_progress: number;
      completed: number;
      cancelled: number;
      no_show: number;
    };
    revenueThisMonth: number;
  };
  problems: {
    totalProblems: number;
    unresolvedProblems: number;
    resolvedProblems: number;
    recentProblems: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  className,
}) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load appointment and problem stats in parallel for better performance
        const [appointmentStats, problemStats] = await Promise.all([
          appointmentMngtService.getAppointmentStats(),
          vehicleProblemService.getProblemStats(),
        ]);

        setStats({
          appointments: appointmentStats,
          problems: problemStats,
        });
      } catch (err: any) {
        console.error("Error loading dashboard stats:", err);
        setError(err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={`dashboard-stats ${className || ""}`}>
        <div className="text-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-stats ${className || ""}`}>
        <Alert variant="danger">
          <Alert.Heading>Error Loading Statistics</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`dashboard-stats ${className || ""}`}>
        <Alert variant="warning">No statistics data available</Alert>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className={`dashboard-stats ${className || ""}`}>
      {/* Main Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card stat-card-primary">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="stat-value">
                {stats.appointments.totalAppointments}
              </h3>
              <p className="stat-label">Total Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-success">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-calendar-day"></i>
              </div>
              <h3 className="stat-value">
                {stats.appointments.todaysAppointments}
              </h3>
              <p className="stat-label">Today's Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-warning">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="stat-value">
                {stats.appointments.upcomingAppointments}
              </h3>
              <p className="stat-label">Upcoming</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-info">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3 className="stat-value">
                {formatCurrency(stats.appointments.revenueThisMonth)}
              </h3>
              <p className="stat-label">Revenue This Month</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card stat-card-secondary">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="stat-value">
                {stats.appointments.completedThisMonth}
              </h3>
              <p className="stat-label">Completed This Month</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-danger">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="stat-value">
                {stats.problems.unresolvedProblems}
              </h3>
              <p className="stat-label">Unresolved Problems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-success">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-wrench"></i>
              </div>
              <h3 className="stat-value">{stats.problems.resolvedProblems}</h3>
              <p className="stat-label">Resolved Problems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-warning">
            <Card.Body className="text-center">
              <div className="stat-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="stat-value">{stats.problems.recentProblems}</h3>
              <p className="stat-label">Recent Problems (7 days)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Appointment Status Breakdown */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Appointments by Status
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(stats.appointments.appointmentsByStatus).map(
                  ([status, count]) => (
                    <Col md={2} key={status} className="text-center mb-3">
                      <div className={`status-stat status-${status}`}>
                        <div className="status-count">{count}</div>
                        <div className="status-label">
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace("_", " ")}
                        </div>
                      </div>
                    </Col>
                  )
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardStats;
