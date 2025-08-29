import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { 
  fetchAdminUsers, 
  fetchUserStats, 
  activateUser as activateUserAction, 
  deactivateUser as deactivateUserAction, 
  resetUserPassword as resetUserPasswordAction, 
  deleteUser as deleteUserAction, 
  exportUsers as exportUsersAction 
} from '../store/slices/autoRepairsSlice';
import type { AdminUser } from "../services/userMngtService";
import type {
  UserSearchCriteria,
  BulkUserOperation,
} from "../types/userManagement";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import { EditUserModal } from "../components/modals/EditUserModal";
import { UserDetailsModal } from "../components/modals/UserDetailsModal";
import { AuthStatusDebug } from "../components/AuthStatusDebug";

export const UserManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { 
    adminUsers: users, 
    userStats: statistics, 
    userPagination,
    loading, 
    error 
  } = useSelector((state: RootState) => state.autoRepairs);
  
  // Local state for UI only
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search and filter state
  const [searchCriteria, setSearchCriteria] = useState<UserSearchCriteria>({
    searchTerm: "",
    role: "all",
    isActive: "all",
    sortBy: "firstName",
    sortOrder: "asc",
    page: 1,
    limit: 20,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<BulkUserOperation | null>(
    null
  );

  useEffect(() => {
    if (!hasPermission("owner")) {
      return;
    }

    loadData();
  }, [searchCriteria, hasPermission]);

  const loadData = async () => {
    try {
      // Transform search criteria to match UserQuery interface
      const queryParams = {
        page: searchCriteria.page,
        limit: searchCriteria.limit,
        search: searchCriteria.searchTerm,
        role: searchCriteria.role === "all" ? undefined : searchCriteria.role,
        isActive:
          searchCriteria.isActive === "all"
            ? undefined
            : searchCriteria.isActive,
        sortBy: searchCriteria.sortBy,
        sortOrder: searchCriteria.sortOrder,
      };

      // Dispatch Redux actions
      await Promise.all([
        dispatch(fetchAdminUsers(queryParams)),
        dispatch(fetchUserStats()),
      ]);
    } catch (err) {
      console.error("Load data error:", err);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: keyof UserSearchCriteria,
    value: string | number | boolean
  ) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSort = (sortBy: UserSearchCriteria["sortBy"]) => {
    setSearchCriteria((prev) => ({
      ...prev,
      sortBy,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case "activate":
          await dispatch(activateUserAction(userId)).unwrap();
          setSuccessMessage("User activated successfully");
          break;
        case "deactivate":
          await dispatch(deactivateUserAction(userId)).unwrap();
          setSuccessMessage("User deactivated successfully");
          break;
        case "reset-password": {
          // Generate a temporary password
          const tempPassword = Math.random().toString(36).slice(-8) + "!A1";
          await dispatch(resetUserPasswordAction({ userId, newPassword: tempPassword })).unwrap();
          setSuccessMessage(
            `Password reset. Temporary password: ${tempPassword}`
          );
          break;
        }
        case "unlock":
          // For now, this would require specific backend implementation
          setSuccessMessage("Account unlock feature not yet available");
          break;
        case "delete":
          if (
            window.confirm(
              "Are you sure you want to delete this user? This action cannot be undone."
            )
          ) {
            await dispatch(deleteUserAction(userId)).unwrap();
            setSuccessMessage("User deleted successfully");
          }
          break;
      }
      // Refresh user stats after any action
      dispatch(fetchUserStats());
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedUsers.size === 0) return;

    try {
      const userIds = Array.from(selectedUsers);
      let successCount = 0;
      let failedCount = 0;

      // Process each user individually since bulk operations aren't implemented yet
      for (const userId of userIds) {
        try {
          switch (bulkOperation.operation) {
            case "activate":
              await dispatch(activateUserAction(userId)).unwrap();
              break;
            case "deactivate":
              await dispatch(deactivateUserAction(userId)).unwrap();
              break;
            case "reset_password": {
              const tempPassword = Math.random().toString(36).slice(-8) + "!A1";
              await dispatch(resetUserPasswordAction({ userId, newPassword: tempPassword })).unwrap();
              break;
            }
            default:
              throw new Error(
                `Unsupported operation: ${bulkOperation.operation}`
              );
          }
          successCount++;
        } catch (err) {
         console.log((err instanceof Error ? err.message : String(err)) + failedCount++);
        }
      }

      if (failedCount > 0) {
        console.error(
          `Operation completed with errors: ${failedCount} users failed`
        );
      } else {
        setSuccessMessage(
          `Bulk operation completed successfully for ${successCount} users`
        );
      }

      setSelectedUsers(new Set());
      setShowBulkConfirm(false);
      setBulkOperation(null);
      // Refresh user stats after bulk operation
      dispatch(fetchUserStats());
    } catch (err) {
      console.error("Bulk operation failed:", err);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "danger";
      case "employee":
        return "warning";
      case "customer":
        return "secondary";
      default:
        return "light";
    }
  };

  const exportUsers = async (format: "csv" | "excel" | "pdf") => {
    try {
      // Transform search criteria to match UserQuery interface
      const queryParams = {
        page: searchCriteria.page,
        limit: searchCriteria.limit,
        search: searchCriteria.searchTerm,
        role: searchCriteria.role === "all" ? undefined : searchCriteria.role,
        isActive:
          searchCriteria.isActive === "all"
            ? undefined
            : searchCriteria.isActive,
        sortBy: searchCriteria.sortBy,
        sortOrder: searchCriteria.sortOrder,
      };

      const blob = await dispatch(exportUsersAction(queryParams)).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export users as ${format}:`, err);
    }
  };

  if (!hasPermission("owner")) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>
            You don't have permission to access user management. Owner
            privileges are required.
          </p>
        </Alert>
      </Container>
    );
  }

  if ((loading.adminUsers || loading.userStats) && !statistics) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading user management...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Debug Component - Remove in production */}
      <AuthStatusDebug />

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {(error.adminUsers || error.userStats || error.activateUser || error.deactivateUser || error.resetUserPassword || error.deleteUser || error.exportUsers) && (
        <Alert variant="danger" dismissible>
          {error.adminUsers || error.userStats || error.activateUser || error.deactivateUser || error.resetUserPassword || error.deleteUser || error.exportUsers}
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">👥 User Management</h1>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              ➕ Create User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      {statistics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{statistics.totalUsers}</h3>
                <p className="mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{statistics.activeUsers}</h3>
                <p className="mb-0">Activity Status (30 days)</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{statistics.inactiveUsers}</h3>
                <p className="mb-0">No Activity (30 days)</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {statistics.recentUsers?.length || 0}
                </h3>
                <p className="mb-0">Recent Registrations</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="🔍 Search users..."
                  value={searchCriteria.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={searchCriteria.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="employee">Employee</option>
                <option value="customer">Customer</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={searchCriteria.isActive?.toString() || "all"}
                onChange={(e) =>
                  handleFilterChange(
                    "isActive",
                    e.target.value === "all" ? "all" : e.target.value === "true"
                  )
                }
              >
                <option value="all">All Acct Status</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <div className="d-flex gap-2">
                {selectedUsers.size > 0 && (
                  <Dropdown as={ButtonGroup}>
                    <Button variant="warning" size="sm">
                      Bulk Actions ({selectedUsers.size})
                    </Button>
                    <Dropdown.Toggle split variant="warning" size="sm" />
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setBulkOperation({
                            userIds: [],
                            operation: "activate",
                          });
                          setShowBulkConfirm(true);
                        }}
                      >
                        Activate Selected
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setBulkOperation({
                            userIds: [],
                            operation: "deactivate",
                          });
                          setShowBulkConfirm(true);
                        }}
                      >
                        Deactivate Selected
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setBulkOperation({
                            userIds: [],
                            operation: "reset_password",
                          });
                          setShowBulkConfirm(true);
                        }}
                      >
                        Reset Passwords
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}

                <Dropdown as={ButtonGroup}>
                  <Button variant="outline-secondary" size="sm">
                    Export
                  </Button>
                  <Dropdown.Toggle
                    split
                    variant="outline-secondary"
                    size="sm"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => exportUsers("csv")}>
                      📄 Export as CSV
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportUsers("excel")}>
                      📊 Export as Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportUsers("pdf")}>
                      📋 Export as PDF
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-5">
              <h5>No users found</h5>
              <p className="text-muted">
                {searchCriteria.searchTerm
                  ? "Try adjusting your search criteria"
                  : "Create your first user"}
              </p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={
                        selectedUsers.size === users.length && users.length > 0
                      }
                      onChange={selectAllUsers}
                    />
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("firstName")}
                  >
                    Name{" "}
                    {searchCriteria.sortBy === "firstName" &&
                      (searchCriteria.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("email")}
                  >
                    Email{" "}
                    {searchCriteria.sortBy === "email" &&
                      (searchCriteria.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("role")}
                  >
                    Role{" "}
                    {searchCriteria.sortBy === "role" &&
                      (searchCriteria.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Acct Status</th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("lastLogin")}
                  >
                    Last Login{" "}
                    {searchCriteria.sortBy === "lastLogin" &&
                      (searchCriteria.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt=""
                            className="rounded-circle me-2"
                            style={{ width: "32px", height: "32px" }}
                          />
                        )}
                        <div>
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>
                          {user.employeeId && (
                            <>
                              <br />
                              <small className="text-muted">
                                ID: {user.employeeId}
                              </small>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                      {user.phone && (
                        <>
                          <br />
                          <small className="text-muted">{user.phone}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <Badge bg={getRoleBadgeVariant(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                      {user.department && (
                        <>
                          <br />
                          <small className="text-muted">
                            {user.department}
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      <Badge bg={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Enabled" : "Disabled"}
                      </Badge>
                      {user.loginAttempts && user.loginAttempts > 3 && (
                        <>
                          <br />
                          <Badge bg="warning" className="mt-1">
                            Locked
                          </Badge>
                        </>
                      )}
                    </td>
                    <td>
                      {user.lastLogin ? (
                        <small>
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </small>
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" size="sm">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                          >
                            👁️ View Details
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                          >
                            ✏️ Edit User
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() =>
                              handleUserAction("reset-password", user.id)
                            }
                          >
                            🔑 Reset Password
                          </Dropdown.Item>
                          {user.isActive ? (
                            <Dropdown.Item
                              onClick={() =>
                                handleUserAction("deactivate", user.id)
                              }
                            >
                              🚫 Deactivate
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item
                              onClick={() =>
                                handleUserAction("activate", user.id)
                              }
                            >
                              ✅ Activate
                            </Dropdown.Item>
                          )}
                          {user.loginAttempts && user.loginAttempts > 3 && (
                            <Dropdown.Item
                              onClick={() =>
                                handleUserAction("unlock", user.id)
                              }
                            >
                              🔓 Unlock Account
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => handleUserAction("delete", user.id)}
                          >
                            🗑️ Delete User
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {userPagination.totalPages > 1 && (
        <Row className="mt-3">
          <Col className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              Showing{" "}
              {((searchCriteria.page || 1) - 1) * (searchCriteria.limit || 20) +
                1}{" "}
              to{" "}
              {Math.min(
                (searchCriteria.page || 1) * (searchCriteria.limit || 20),
                userPagination.total
              )}{" "}
              of {userPagination.total} users
            </span>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={(searchCriteria.page || 1) <= 1}
                onClick={() =>
                  handleFilterChange("page", (searchCriteria.page || 1) - 1)
                }
              >
                Previous
              </Button>
              <span className="mx-3">
                Page {searchCriteria.page || 1} of {userPagination.totalPages}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={(searchCriteria.page || 1) >= userPagination.totalPages}
                onClick={() =>
                  handleFilterChange("page", (searchCriteria.page || 1) + 1)
                }
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Bulk Operation Confirmation Modal */}
      <Modal show={showBulkConfirm} onHide={() => setShowBulkConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Bulk Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to perform this operation on{" "}
          {selectedUsers.size} selected users?
          {bulkOperation && (
            <div className="mt-2">
              <strong>Operation:</strong>{" "}
              {bulkOperation.operation.replace("_", " ").toUpperCase()}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkOperation}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modals */}
      <CreateUserModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={() => {
          setSuccessMessage("User created successfully");
          setShowCreateModal(false);
          loadData();
        }}
      />

      <EditUserModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          setSuccessMessage("User updated successfully");
          setShowEditModal(false);
          setSelectedUser(null);
          loadData();
        }}
      />

      <UserDetailsModal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Container>
  );
};
