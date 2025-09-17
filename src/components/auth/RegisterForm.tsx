import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { RegisterData } from "../../types/auth";
import type { User } from "../../types/userManagement";
import "./auth.scss";

type UserRole = User["role"];

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  allowRoleSelection?: boolean;
  defaultRole?: UserRole;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  allowRoleSelection = false,
  defaultRole = "customer",
}) => {
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: defaultRole,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev: RegisterData) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await register(formData);
  };

  const getRoleBadgeClass = (role: UserRole) => {
    const baseClass = "role-badge";
    const roleClass = role;
    const selectedClass = formData.role === role ? "selected" : "";
    return `${baseClass} ${roleClass} ${selectedClass}`.trim();
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join our auto repairs platform</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {error.register && (
          <div className="error-message">
            {error.register}
            <button
              type="button"
              className="close-error"
              onClick={() => clearError("register")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              required
              autoComplete="given-name"
            />
            {validationErrors.firstName && (
              <small className="error-text">{validationErrors.firstName}</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              required
              autoComplete="family-name"
            />
            {validationErrors.lastName && (
              <small className="error-text">{validationErrors.lastName}</small>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email address"
            required
            autoComplete="email"
          />
          {validationErrors.email && (
            <small className="error-text">{validationErrors.email}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number (Optional)</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />
          {validationErrors.phone && (
            <small className="error-text">{validationErrors.phone}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {validationErrors.password && (
            <small className="error-text">{validationErrors.password}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <small className="error-text">
              {validationErrors.confirmPassword}
            </small>
          )}
        </div>

        {allowRoleSelection && (
          <div className="form-group">
            <label>Account Type</label>
            <div className="role-badges">
              {(["customer", "mechanic"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={getRoleBadgeClass(role)}
                  onClick={() => handleInputChange("role", role)}
                  aria-pressed={formData.role === role}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading.register}
        >
          {loading.register ? "Creating Account..." : "Create Account"}
        </button>

        <div className="auth-links">
          <p className="switch-form">
            Already have an account?{" "}
            {onSwitchToLogin ? (
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToLogin}
              >
                Sign in here
              </button>
            ) : (
              <Link to="/login" className="link-button">
                Sign in here
              </Link>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
