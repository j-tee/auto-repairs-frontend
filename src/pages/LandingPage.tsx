import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import './LandingPage.scss';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <Container>
          <div className="nav-content">
            <div className="logo-section">
              <h2 className="brand-title">🔧 AutoRepair Pro</h2>
              <span className="brand-subtitle">Professional Shop Management</span>
            </div>
            <div className="nav-actions">
              <Link to="/login" className="btn btn-outline-primary me-2">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100 py-5">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Streamline Your Auto Repair Business
                  <span className="text-primary"> Effortlessly</span>
                </h1>
                <p className="hero-description">
                  Comprehensive management system designed specifically for auto repair shops. 
                  Manage customers, vehicles, appointments, repair orders, and staff all in one place.
                </p>
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-lg me-3">
                    Start Free Trial
                  </Link>
                  <Link to="/demo" className="btn btn-outline-secondary btn-lg">
                    Watch Demo
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat">
                    <strong>500+</strong>
                    <span>Active Shops</span>
                  </div>
                  <div className="stat">
                    <strong>50,000+</strong>
                    <span>Vehicles Managed</span>
                  </div>
                  <div className="stat">
                    <strong>99.9%</strong>
                    <span>Uptime</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="dashboard-preview">
                  <div className="preview-header">
                    <div className="preview-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span className="preview-title">AutoRepair Pro Dashboard</span>
                  </div>
                  <div className="preview-content">
                    <div className="preview-sidebar">
                      <div className="sidebar-item active">📊 Dashboard</div>
                      <div className="sidebar-item">👥 Customers</div>
                      <div className="sidebar-item">🚗 Vehicles</div>
                      <div className="sidebar-item">📅 Appointments</div>
                      <div className="sidebar-item">🔧 Repair Orders</div>
                    </div>
                    <div className="preview-main">
                      <div className="preview-cards">
                        <div className="preview-card">
                          <span className="card-number">24</span>
                          <span className="card-label">Today's Appointments</span>
                        </div>
                        <div className="preview-card">
                          <span className="card-number">12</span>
                          <span className="card-label">In Progress</span>
                        </div>
                      </div>
                      <div className="preview-chart">
                        <div className="chart-bars">
                          <div className="bar" style={{height: '60%'}}></div>
                          <div className="bar" style={{height: '80%'}}></div>
                          <div className="bar" style={{height: '45%'}}></div>
                          <div className="bar" style={{height: '90%'}}></div>
                          <div className="bar" style={{height: '70%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Everything You Need to Run Your Shop</h2>
              <p className="section-subtitle">
                Powerful features designed by auto repair professionals, for auto repair professionals
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">👥</div>
                  <Card.Title>Customer Management</Card.Title>
                  <Card.Text>
                    Complete customer profiles with contact information, vehicle history, 
                    and service records. Build lasting relationships with detailed insights.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">🚗</div>
                  <Card.Title>Vehicle Tracking</Card.Title>
                  <Card.Text>
                    Comprehensive vehicle database with make, model, year, VIN tracking. 
                    Complete service history and maintenance scheduling.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">📅</div>
                  <Card.Title>Smart Scheduling</Card.Title>
                  <Card.Text>
                    Intelligent appointment booking with technician assignments, 
                    time slot optimization, and automated customer notifications.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">🔧</div>
                  <Card.Title>Work Order Management</Card.Title>
                  <Card.Text>
                    Digital repair orders with parts tracking, labor time, 
                    status updates, and integrated invoicing system.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">👨‍🔧</div>
                  <Card.Title>Staff Management</Card.Title>
                  <Card.Text>
                    Role-based access control, technician scheduling, 
                    performance tracking, and payroll integration.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">📊</div>
                  <Card.Title>Business Analytics</Card.Title>
                  <Card.Text>
                    Real-time reporting, revenue tracking, performance metrics, 
                    and business insights to grow your shop.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-5 bg-light">
        <Container>
          <Row>
            <Col lg={6}>
              <h2 className="section-title">Why Choose AutoRepair Pro?</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">⚡</div>
                  <div className="benefit-content">
                    <h4>Increase Efficiency</h4>
                    <p>Streamline operations and reduce paperwork by up to 80%</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💰</div>
                  <div className="benefit-content">
                    <h4>Boost Revenue</h4>
                    <p>Better scheduling and customer management increases revenue by 25%</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">😊</div>
                  <div className="benefit-content">
                    <h4>Happy Customers</h4>
                    <p>Improve customer satisfaction with better communication and service</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🔒</div>
                  <div className="benefit-content">
                    <h4>Secure & Reliable</h4>
                    <p>Enterprise-grade security with 99.9% uptime guarantee</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "AutoRepair Pro transformed our shop. We went from chaos to complete organization 
                    in just two weeks. Our customers love the transparency and we've increased our 
                    efficiency by 40%."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">MW</div>
                    <div className="author-info">
                      <strong>Mike Wilson</strong>
                      <span>Owner, Wilson Auto Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Simple, Transparent Pricing</h2>
              <p className="section-subtitle">
                Choose the plan that fits your shop size
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={4} md={6} className="mb-4">
              <Card className="pricing-card">
                <Card.Body className="text-center">
                  <h3 className="plan-name">Starter</h3>
                  <div className="plan-price">
                    <span className="price-amount">$49</span>
                    <span className="price-period">/month</span>
                  </div>
                  <ul className="plan-features">
                    <li>Up to 500 customers</li>
                    <li>2 technician accounts</li>
                    <li>Basic reporting</li>
                    <li>Email support</li>
                  </ul>
                  <Button variant="outline-primary" size="lg" className="w-100">
                    Start Free Trial
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="pricing-card featured">
                <div className="popular-badge">Most Popular</div>
                <Card.Body className="text-center">
                  <h3 className="plan-name">Professional</h3>
                  <div className="plan-price">
                    <span className="price-amount">$99</span>
                    <span className="price-period">/month</span>
                  </div>
                  <ul className="plan-features">
                    <li>Unlimited customers</li>
                    <li>5 technician accounts</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                    <li>API access</li>
                  </ul>
                  <Button variant="primary" size="lg" className="w-100">
                    Start Free Trial
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <Card className="pricing-card">
                <Card.Body className="text-center">
                  <h3 className="plan-name">Enterprise</h3>
                  <div className="plan-price">
                    <span className="price-amount">Custom</span>
                  </div>
                  <ul className="plan-features">
                    <li>Multi-location support</li>
                    <li>Unlimited users</li>
                    <li>Custom integrations</li>
                    <li>24/7 phone support</li>
                    <li>Dedicated account manager</li>
                  </ul>
                  <Button variant="outline-primary" size="lg" className="w-100">
                    Contact Sales
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="cta-title">Ready to Transform Your Auto Repair Shop?</h2>
              <p className="cta-description">
                Join thousands of shop owners who have streamlined their operations with AutoRepair Pro.
                Start your free 30-day trial today - no credit card required.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-light btn-lg me-3">
                  Start Free Trial
                </Link>
                <Link to="/contact" className="btn btn-outline-light btn-lg">
                  Contact Sales
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-4 bg-dark text-white">
        <Container>
          <Row>
            <Col md={6}>
              <h5>AutoRepair Pro</h5>
              <p>Professional auto repair shop management software.</p>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>
                  <h6>Product</h6>
                  <ul className="footer-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="/demo">Demo</a></li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h6>Support</h6>
                  <ul className="footer-links">
                    <li><a href="/help">Help Center</a></li>
                    <li><a href="/contact">Contact Us</a></li>
                    <li><a href="/documentation">Documentation</a></li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h6>Company</h6>
                  <ul className="footer-links">
                    <li><a href="/about">About</a></li>
                    <li><a href="/privacy">Privacy</a></li>
                    <li><a href="/terms">Terms</a></li>
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
          <hr className="my-4" />
          <Row>
            <Col md={12} className="text-center">
              <p>&copy; 2025 AutoRepair Pro. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;