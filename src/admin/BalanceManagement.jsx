import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAllUsers, formatCurrency } from "./services/adminData";
import { adminAdjustBalance } from "./services/adminActions";
import "./admin.css";

const BalanceManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  const openAdjust = (user) => {
    setAdjustingUser(user);
    setAmount("");
    setType("credit");
    setReason("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const numericAmount = Number(amount);
      if (!numericAmount || numericAmount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const res = await adminAdjustBalance(adjustingUser.id, numericAmount, type, reason || "Admin balance adjustment");
      setResult(res);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout activeNav="balance">
      <h1 className="admin-page-title">Balance Management</h1>
      <p className="admin-page-subtitle">Adjust user account balances with full audit trail</p>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">Users</h2>
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

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Balance</th>
                  <th>Investments</th>
                  <th>Action</th>
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
                    <td style={{ color: "#10b981", fontWeight: 600 }}>
                      {formatCurrency(user.balance, user.currency)}
                    </td>
                    <td>{user.investment_count}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn--primary admin-btn--sm"
                        onClick={() => openAdjust(user)}
                      >
                        Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjustingUser && (
        <div className="admin-modal-overlay" onClick={() => setAdjustingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Adjust Balance</h3>
              <button className="admin-modal__close" onClick={() => setAdjustingUser(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>User</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{adjustingUser.display_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Current Balance</span>
                <span style={{ color: "#10b981", fontWeight: 700, fontSize: "18px" }}>{formatCurrency(adjustingUser.balance, adjustingUser.currency)}</span>
              </div>
            </div>

            {error && <div className="admin-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</div>}
            {result && (
              <div className="admin-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Balance updated. New balance: {formatCurrency(result.new_balance, adjustingUser.currency)}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Adjustment Type</label>
                <div className="admin-filters" style={{ marginBottom: "8px" }}>
                  <button type="button" className={`admin-filter-btn ${type === "credit" ? "admin-filter-btn--active" : ""}`} onClick={() => setType("credit")}>Credit (Add)</button>
                  <button type="button" className={`admin-filter-btn ${type === "debit" ? "admin-filter-btn--active" : ""}`} onClick={() => setType("debit")}>Debit (Deduct)</button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Amount</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Reason / Note</label>
                <textarea
                  className="admin-form-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for this adjustment..."
                  required
                />
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setAdjustingUser(null)} disabled={submitting}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                  {submitting ? "Processing..." : `Confirm ${type === "credit" ? "Credit" : "Debit"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BalanceManagement;
