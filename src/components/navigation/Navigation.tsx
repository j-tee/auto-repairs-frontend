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
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);

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
    setShowServiceMenu(false);
    setShowReportsMenu(false);
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

          {/* Customer Features */}
          {user.role === "customer" && (
            <>
              <Link
                to="/my-vehicles"
                className={isActiveRoute("/my-vehicles") ? "active" : ""}
                onClick={closeMenus}
              >
                My Vehicles
              </Link>
              <Link
                to="/my-appointments"
                className={isActiveRoute("/my-appointments") ? "active" : ""}
                onClick={closeMenus}
              >
                My Appointments
              </Link>
              <Link
                to="/my-repair-orders"
                className={isActiveRoute("/my-repair-orders") ? "active" : ""}
                onClick={closeMenus}
              >
                My Repair Orders
              </Link>
            </>
          )}

          {/* Employee Features */}
          {hasPermission("employee") && (
            <>
              <div className="nav-dropdown">
                <button
                  className="nav-dropdown-toggle"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  Customer Management ▼
                </button>
                <div
                  className={`nav-dropdown-menu ${showUserMenu ? "open" : ""}`}
                >
                  <Link
                    to="/customers"
                    className={isActiveRoute("/customers") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    Customers
                  </Link>
                  <Link
                    to="/vehicles"
                    className={isActiveRoute("/vehicles") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    Vehicles
                  </Link>
                </div>
              </div>

              <Link
                to="/appointments"
                className={isActiveRoute("/appointments") ? "active" : ""}
                onClick={closeMenus}
              >
                Appointments
              </Link>

              <Link
                to="/repair-orders"
                className={isActiveRoute("/repair-orders") ? "active" : ""}
                onClick={closeMenus}
              >
                Repair Orders
              </Link>

              <div className="nav-dropdown">
                <button
                  className="nav-dropdown-toggle"
                  onClick={() => setShowServiceMenu(!showServiceMenu)}
                >
                  Services & Parts ▼
                </button>
                <div
                  className={`nav-dropdown-menu ${
                    showServiceMenu ? "open" : ""
                  }`}
                >
                  <Link
                    to="/services"
                    className={isActiveRoute("/services") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    Services
                  </Link>
                  <Link
                    to="/parts"
                    className={isActiveRoute("/parts") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    Parts
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Owner Features */}
          {hasPermission("owner") && (
            <>
              <Link
                to="/employees"
                className={isActiveRoute("/employees") ? "active" : ""}
                onClick={closeMenus}
              >
                Employees
              </Link>

              <div className="nav-dropdown">
                <button
                  className="nav-dropdown-toggle"
                  onClick={() => setShowReportsMenu(!showReportsMenu)}
                >
                  Reports ▼
                </button>
                <div
                  className={`nav-dropdown-menu ${
                    showReportsMenu ? "open" : ""
                  }`}
                >
                  <Link
                    to="/reports/financial"
                    className={
                      isActiveRoute("/reports/financial") ? "active" : ""
                    }
                    onClick={closeMenus}
                  >
                    Financial Reports
                  </Link>
                  <Link
                    to="/reports/customers"
                    className={
                      isActiveRoute("/reports/customers") ? "active" : ""
                    }
                    onClick={closeMenus}
                  >
                    Customer Reports
                  </Link>
                  <Link
                    to="/reports/inventory"
                    className={
                      isActiveRoute("/reports/inventory") ? "active" : ""
                    }
                    onClick={closeMenus}
                  >
                    Inventory Reports
                  </Link>
                </div>
              </div>

              <Link
                to="/shop-settings"
                className={isActiveRoute("/shop-settings") ? "active" : ""}
                onClick={closeMenus}
              >
                Shop Settings
              </Link>
            </>
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
                    alt={
                      user.firstName || user.lastName
                        ? `${user.firstName || ""} ${
                            user.lastName || ""
                          }`.trim()
                        : user.email
                    }
                  />
                ) : (
                  <span>
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || "?"}
                    {user.lastName?.charAt(0) || ""}
                  </span>
                )}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : user.email}
                </span>
                <span className="user-role">{user.role}</span>
              </div>
              <span className="user-chevron">▼</span>
            </button>

            <div className={`user-menu ${showUserMenu ? "open" : ""}`}>
              <div className="user-menu-header">
                <div className="user-menu-info">
                  <strong>
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.email}
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
