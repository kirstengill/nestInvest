import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAllUsers, formatCurrency } from "./services/adminData";
import { adminSetWalletBalance } from "./services/adminActions";
import "./admin.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchAllUsers();
      setUsers(data);
      setLoading(false);
    };

    initialLoad();
  }, []);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setNewAmount(String(Number(user.balance) || 0));
    setNotice("");
    setError("");
  };

  const handleSaveAmount = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    const numericAmount = Number(newAmount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      setError("Please enter a valid non-negative amount.");
      return;
    }

    const currentBalance = Number(editingUser.balance) || 0;
    if (numericAmount === currentBalance) {
      setError("New amount is the same as current balance. No change needed.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const reason = `Admin balance update from ${formatCurrency(currentBalance, "UGX")} to ${formatCurrency(numericAmount, "UGX")}`;

      await adminSetWalletBalance(editingUser.id, numericAmount, reason);

      const refreshed = await fetchAllUsers();
      setUsers(refreshed);
      setEditingUser(null);
      setNotice(`Balance updated successfully for ${editingUser.display_name}. New balance: ${formatCurrency(numericAmount, "UGX")}`);
    } catch (err) {
      console.error("Balance update error:", err);
      setError(err?.message || "Unable to update balance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();
    const uid = (user.uid || user.id || "").toLowerCase();
    const name = (user.display_name || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    return uid.includes(searchText) || name.includes(searchText) || phone.includes(searchText);
  });

  return (
    <AdminLayout activeNav="users">
      <h1 className="admin-page-title">User Management</h1>
      <p className="admin-page-subtitle">View all registered users and manage their wallet balance.</p>

      {notice && (
        <div className="admin-success" style={{ marginBottom: "16px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {notice}
        </div>
      )}

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">All Users ({filteredUsers.length})</h2>
          <div className="admin-table-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by UUID, name, or phone"
              aria-label="Search users"
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p>No users found</p>
            <span>Try a different search value.</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Display Name</th>
                  <th>Phone</th>
                  <th>Wallet Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {(user.uid || user.id || "").slice(0, 12)}...
                    </td>
                    <td>{user.display_name || "Unnamed"}</td>
                    <td>{user.phone || "—"}</td>
                    <td style={{ color: "#10b981", fontWeight: 600 }}>
                      {formatCurrency(user.balance, "UGX")}
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--primary admin-btn--sm"
                        onClick={() => handleOpenEdit(user)}
                      >
                        Edit Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Update Wallet Balance</h3>
              <button className="admin-modal__close" onClick={() => setEditingUser(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveAmount}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Display Name</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{editingUser.display_name || "Unnamed"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>UUID</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontFamily: "monospace", fontSize: "12px" }}>
                    {(editingUser.uid || editingUser.id || "").slice(0, 16)}...
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Phone</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{editingUser.phone || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Current Balance</span>
                  <span style={{ color: "#10b981", fontWeight: 700, fontSize: "18px" }}>
                    {formatCurrency(editingUser.balance, "UGX")}
                  </span>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">New Balance (UGX)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="admin-form-input"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Enter new balance amount"
                    required
                    disabled={saving}
                  />
                </div>

                {error && (
                  <div className="admin-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setEditingUser(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Balance"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManagement;
