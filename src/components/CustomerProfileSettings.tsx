import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge, InputGroup } from 'react-bootstrap';
import customerService, { CustomerProfile } from '../services/customerService';
import { useAuth } from '../hooks/useAuth';

interface CustomerProfileSettingsProps {
  profile: CustomerProfile | null;
  onProfileUpdate?: (profile: CustomerProfile) => void;
}

export const CustomerProfileSettings: React.FC<CustomerProfileSettingsProps> = ({
  profile: initialProfile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
      promotionalEmails: false,
      serviceUpdates: true
    }
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || ''
        },
        preferences: {
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          smsNotifications: profile.preferences?.smsNotifications ?? true,
          appointmentReminders: profile.preferences?.appointmentReminders ?? true,
          promotionalEmails: profile.preferences?.promotionalEmails ?? false,
          serviceUpdates: profile.preferences?.serviceUpdates ?? true
        }
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const updatedProfile = await customerService.updateProfile(formData);
      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    // Reset form data to original profile
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || ''
        },
        preferences: {
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          smsNotifications: profile.preferences?.smsNotifications ?? true,
          appointmentReminders: profile.preferences?.appointmentReminders ?? true,
          promotionalEmails: profile.preferences?.promotionalEmails ?? false,
          serviceUpdates: profile.preferences?.serviceUpdates ?? true
        }
      });
    }
  };

  if (!profile && !editing) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>👤</div>
          <h5>Profile Not Found</h5>
          <p className="text-muted">
            We couldn't load your profile information. This might be because your customer account 
            needs to be linked to your user account.
          </p>
          <Alert variant="info" className="mt-3">
            <strong>Note:</strong> Customer profile management requires backend implementation. 
            Please contact system administrator.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="customer-profile-settings">
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">👤 Personal Information</h5>
            {!editing && (
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your first name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your last name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your email"
                  />
                  {profile?.emailVerified && (
                    <InputGroup.Text>
                      <Badge bg="success" className="p-1">✓ Verified</Badge>
                    </InputGroup.Text>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your phone number"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Account Information */}
          {profile && (
            <div className="account-info mt-4 pt-3 border-top">
              <h6 className="mb-3">Account Information</h6>
              <Row>
                <Col md={4}>
                  <small className="text-muted">Customer ID</small>
                  <div className="fw-bold font-monospace">{profile.id}</div>
                </Col>
                <Col md={4}>
                  <small className="text-muted">Member Since</small>
                  <div>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</div>
                </Col>
                <Col md={4}>
                  <small className="text-muted">Account Status</small>
                  <div>
                    <Badge bg="success">Active</Badge>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Address Information */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🏠 Address Information</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              disabled={!editing}
              placeholder="Enter your street address"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your city"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  disabled={!editing}
                  placeholder="State"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>ZIP Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  disabled={!editing}
                  placeholder="ZIP"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">🔔 Notification Preferences</h5>
        </Card.Header>
        <Card.Body>
          <Form.Check
            type="switch"
            id="email-notifications"
            label="📧 Email notifications for appointments and updates"
            checked={formData.preferences.emailNotifications}
            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
            disabled={!editing}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="sms-notifications"
            label="📱 SMS notifications for urgent updates"
            checked={formData.preferences.smsNotifications}
            onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
            disabled={!editing}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="appointment-reminders"
            label="⏰ Appointment reminders (24 hours before)"
            checked={formData.preferences.appointmentReminders}
            onChange={(e) => handlePreferenceChange('appointmentReminders', e.target.checked)}
            disabled={!editing}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="service-updates"
            label="🔧 Service progress updates"
            checked={formData.preferences.serviceUpdates}
            onChange={(e) => handlePreferenceChange('serviceUpdates', e.target.checked)}
            disabled={!editing}
            className="mb-3"
          />

          <Form.Check
            type="switch"
            id="promotional-emails"
            label="🎉 Promotional emails and special offers"
            checked={formData.preferences.promotionalEmails}
            onChange={(e) => handlePreferenceChange('promotionalEmails', e.target.checked)}
            disabled={!editing}
            className="mb-3"
          />
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      {editing && (
        <div className="mt-4 d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerProfileSettings;