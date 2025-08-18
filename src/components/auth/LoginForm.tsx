import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./auth.scss";

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      await login({ email: email.trim(), password });
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Login</h2>
        <p>Access your auto repairs account</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {error.login && (
          <div className="error-message">
            {error.login}
            <button
              type="button"
              className="close-error"
              onClick={() => clearError("login")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading.login || !email.trim() || !password.trim()}
        >
          {loading.login ? "Signing in..." : "Sign In"}
        </button>

        {onSwitchToRegister && (
          <div className="auth-links">
            <p className="switch-form">
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToRegister}
              >
                Sign up here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
