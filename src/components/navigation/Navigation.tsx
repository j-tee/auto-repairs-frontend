import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./navigation.scss";

export const Navigation: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCustomerMenu, setShowCustomerMenu] = useState(false);
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
    setShowCustomerMenu(false);
    setShowServiceMenu(false);
    setShowReportsMenu(false);
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navigation" style={{ overflow: "visible" }}>
      <div className="nav-container" style={{ overflow: "visible" }}>
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
        <div
          className={`nav-links ${showMobileMenu ? "mobile-open" : ""}`}
          style={{
            overflow: "visible",
            gap: "2px",
            flexWrap: "nowrap",
          }}
        >
          <Link
            to="/dashboard"
            className={isActiveRoute("/dashboard") ? "active" : ""}
            onClick={closeMenus}
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "11px",
              padding: "8px 12px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(5px)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
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
                to="/appointments"
                className={isActiveRoute("/appointments") ? "active" : ""}
                onClick={closeMenus}
              >
                Appointments
              </Link>
              <Link
                to="/my-repair-orders"
                className={isActiveRoute("/my-repair-orders") ? "active" : ""}
                onClick={closeMenus}
              >
                Repair Orders
              </Link>
            </>
          )}

          {/* Employee Features */}
          {hasPermission("employee") && (
            <>
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "11px",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    backdropFilter: "blur(5px)",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    console.log("Customer Management clicked", {
                      showCustomerMenu,
                      user: user?.role,
                    });
                    setShowCustomerMenu(!showCustomerMenu);
                    setShowServiceMenu(false);
                    setShowReportsMenu(false);
                  }}
                >
                  Customer Mgmt {showCustomerMenu ? "▲" : "▼"}
                  {showCustomerMenu && (
                    <span style={{ color: "red" }}> OPEN</span>
                  )}
                </button>
                {showCustomerMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "0",
                      background: "white",
                      color: "#333",
                      padding: "8px 0",
                      zIndex: 999999,
                      minWidth: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                    ref={(el) => {
                      if (el)
                        console.log(
                          "Customer Management dropdown rendered",
                          el
                        );
                    }}
                  >
                    <Link
                      to="/customers"
                      className={isActiveRoute("/customers") ? "active" : ""}
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      👥 Customers
                    </Link>
                    <Link
                      to="/vehicles"
                      className={isActiveRoute("/vehicles") ? "active" : ""}
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                      }}
                    >
                      🚗 Vehicles
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/appointments"
                className={isActiveRoute("/appointments") ? "active" : ""}
                onClick={closeMenus}
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "11px",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(5px)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Appointments
              </Link>

              <Link
                to="/repair-orders"
                className={isActiveRoute("/repair-orders") ? "active" : ""}
                onClick={closeMenus}
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "11px",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(5px)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Repair Orders
              </Link>

              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "11px",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    backdropFilter: "blur(5px)",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    setShowServiceMenu(!showServiceMenu);
                    setShowCustomerMenu(false);
                    setShowReportsMenu(false);
                  }}
                >
                  Services & Parts {showServiceMenu ? "▲" : "▼"}
                </button>
                {showServiceMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "0",
                      background: "white",
                      color: "#333",
                      padding: "8px 0",
                      zIndex: 999999,
                      minWidth: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Link
                      to="/services"
                      className={isActiveRoute("/services") ? "active" : ""}
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      🔧 Services
                    </Link>
                    <Link
                      to="/parts"
                      className={isActiveRoute("/parts") ? "active" : ""}
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                      }}
                    >
                      🔩 Parts
                    </Link>
                  </div>
                )}
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
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "11px",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(5px)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Employees
              </Link>

              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "11px",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    backdropFilter: "blur(5px)",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    setShowReportsMenu(!showReportsMenu);
                    setShowCustomerMenu(false);
                    setShowServiceMenu(false);
                  }}
                >
                  Reports {showReportsMenu ? "▲" : "▼"}
                </button>
                {showReportsMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "0",
                      background: "white",
                      color: "#333",
                      padding: "8px 0",
                      zIndex: 999999,
                      minWidth: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Link
                      to="/reports/financial"
                      className={
                        isActiveRoute("/reports/financial") ? "active" : ""
                      }
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      💰 Financial Reports
                    </Link>
                    <Link
                      to="/reports/customers"
                      className={
                        isActiveRoute("/reports/customers") ? "active" : ""
                      }
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      👥 Customer Reports
                    </Link>
                    <Link
                      to="/reports/inventory"
                      className={
                        isActiveRoute("/reports/inventory") ? "active" : ""
                      }
                      onClick={closeMenus}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#333",
                      }}
                    >
                      📦 Inventory Reports
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/shop-settings"
                className={isActiveRoute("/shop-settings") ? "active" : ""}
                onClick={closeMenus}
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "11px",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(5px)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Settings
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
