import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./navigation.scss";

export const Navigation: React.FC = () => {
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setShowUserMenu(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const closeMenus = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo/Brand */}
        <div className="nav-brand">
          <Link to="/" onClick={closeMenus}>
            🔧 AutoRepairs
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${showMobileMenu ? "mobile-open" : ""}`}>
          <Link
            to="/dashboard"
            className={isActiveRoute("/dashboard") ? "active" : ""}
            onClick={closeMenus}
          >
            Dashboard
          </Link>

          {user.role !== "customer" && (
            <Link
              to="/repairs"
              className={isActiveRoute("/repairs") ? "active" : ""}
              onClick={closeMenus}
            >
              Repairs
            </Link>
          )}

          {hasPermission("mechanic") && (
            <Link
              to="/vehicles"
              className={isActiveRoute("/vehicles") ? "active" : ""}
              onClick={closeMenus}
            >
              Vehicles
            </Link>
          )}

          {hasPermission("manager") && (
            <Link
              to="/reports"
              className={isActiveRoute("/reports") ? "active" : ""}
              onClick={closeMenus}
            >
              Reports
            </Link>
          )}

          {isAdmin() && (
            <div className="nav-dropdown">
              <button
                className="nav-dropdown-toggle"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                Admin ▼
              </button>
              <div
                className={`nav-dropdown-menu ${showUserMenu ? "open" : ""}`}
              >
                <Link
                  to="/admin/users"
                  className={isActiveRoute("/admin/users") ? "active" : ""}
                  onClick={closeMenus}
                >
                  User Management
                </Link>
                <Link
                  to="/admin/system"
                  className={isActiveRoute("/admin/system") ? "active" : ""}
                  onClick={closeMenus}
                >
                  System Settings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="nav-user">
          <div className="user-info">
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <span>
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="user-role">{user.role}</span>
              </div>
              <span className="user-chevron">▼</span>
            </button>

            <div className={`user-menu ${showUserMenu ? "open" : ""}`}>
              <div className="user-menu-header">
                <div className="user-menu-info">
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                  <small>{user.email}</small>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>
              </div>

              <div className="user-menu-divider"></div>

              <div className="user-menu-links">
                <Link
                  to="/profile"
                  className={isActiveRoute("/profile") ? "active" : ""}
                  onClick={closeMenus}
                >
                  👤 Profile Settings
                </Link>
                <Link
                  to="/my-repairs"
                  className={isActiveRoute("/my-repairs") ? "active" : ""}
                  onClick={closeMenus}
                >
                  🔧 My Repairs
                </Link>
                {user.role === "customer" && (
                  <Link
                    to="/my-vehicles"
                    className={isActiveRoute("/my-vehicles") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    🚗 My Vehicles
                  </Link>
                )}
                <Link
                  to="/settings"
                  className={isActiveRoute("/settings") ? "active" : ""}
                  onClick={closeMenus}
                >
                  ⚙️ Preferences
                </Link>
              </div>

              <div className="user-menu-divider"></div>

              <button className="logout-button" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {(showUserMenu || showMobileMenu) && (
        <div className="nav-backdrop" onClick={closeMenus}></div>
      )}
    </nav>
  );
};

export default Navigation;
