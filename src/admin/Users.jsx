import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { fetchAllUsers, formatCurrency } from "./services/adminData";
import { adminSetUserRole } from "./services/adminActions";
import "./admin.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  async function loadUsers() {
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchAllUsers();
      setUsers(data);
      setLoading(false);
    };
    initialLoad();
  }, []);

  const handleToggleAdmin = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      await adminSetUserRole(userId, !currentStatus);
      await loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "admin" ? u.is_admin : !u.is_admin);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout activeNav="users">
      <h1 className="admin-page-title">User Management</h1>
      <p className="admin-page-subtitle">View and manage registered users</p>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">All Users ({filtered.length})</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="admin-filters">
              <button className={`admin-filter-btn ${filter === "all" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("all")}>All</button>
              <button className={`admin-filter-btn ${filter === "admin" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("admin")}>Admins</button>
              <button className={`admin-filter-btn ${filter === "user" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("user")}>Users</button>
            </div>
            <div className="admin-table-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p>No users found</p>
            <span>Try adjusting your search or filter</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Balance</th>
                  <th>Investments</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="admin-table__name">{user.display_name}</div>
                        <div className="admin-table__email">{user.email}</div>
                      </div>
                    </td>
                    <td>{formatCurrency(user.balance, user.currency)}</td>
                    <td>{user.investment_count} ({formatCurrency(user.investment_total, user.currency)})</td>
                    <td>
                      <span className={`admin-badge ${user.is_admin ? "admin-badge--success" : "admin-badge--info"}`}>
                        {user.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </button>
                        <button
                          className="admin-btn admin-btn--sm"
                          style={{
                            background: user.is_admin ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                            color: user.is_admin ? "#fca5a5" : "#10b981",
                            border: `1px solid ${user.is_admin ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                          }}
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          disabled={updatingId === user.id}
                        >
                          {updatingId === user.id ? "..." : user.is_admin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">User Details</h3>
              <button className="admin-modal__close" onClick={() => setSelectedUser(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Name</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedUser.display_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Email</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedUser.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Phone</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedUser.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Balance</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>{formatCurrency(selectedUser.balance, selectedUser.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Investments</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedUser.investment_count}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Joined</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Last Active</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedUser.last_active ? new Date(selectedUser.last_active).toLocaleString() : "—"}</span>
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn--secondary" onClick={() => setSelectedUser(null)}>Close</button>
              <Link to={`/admin/balance?user=${selectedUser.id}`} className="admin-btn admin-btn--primary" onClick={() => setSelectedUser(null)}>Manage Balance</Link>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManagement;
