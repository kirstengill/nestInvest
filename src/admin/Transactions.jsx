import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAdminAdjustments, formatCurrency, formatDate } from "./services/adminData";
import "./admin.css";

const AdminTransactions = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchAdminAdjustments();
      setAdjustments(data);
      setLoading(false);
    };
    initialLoad();
  }, []);

  const filtered = adjustments.filter((a) =>
    (a.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.admin_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout activeNav="transactions">
      <h1 className="admin-page-title">Audit History</h1>
      <p className="admin-page-subtitle">Complete record of all administrative balance adjustments</p>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">Adjustments ({filtered.length})</h2>
          <div className="admin-table-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search adjustments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search adjustments"
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <p>No adjustments yet</p>
            <span>Balance adjustments will appear here</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Admin</th>
                  <th>Previous</th>
                  <th>New</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((adj) => (
                  <tr key={adj.id}>
                    <td>
                      <div className="admin-table__name">{adj.user_name}</div>
                      <div className="admin-table__email">{adj.user_id.slice(0, 8)}...</div>
                    </td>
                    <td style={{ fontWeight: 600, color: adj.type === "credit" ? "#10b981" : "#ef4444" }}>
                      {adj.type === "credit" ? "+" : "-"}{formatCurrency(adj.amount)}
                    </td>
                    <td>
                      <span className={`admin-badge ${adj.type === "credit" ? "admin-badge--success" : "admin-badge--danger"}`}>
                        {adj.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={adj.reason}>
                      {adj.reason}
                    </td>
                    <td>{adj.admin_name}</td>
                    <td style={{ color: "rgba(255,255,255,0.5)" }}>{formatCurrency(adj.previous_balance)}</td>
                    <td style={{ color: "#10b981", fontWeight: 600 }}>{formatCurrency(adj.new_balance)}</td>
                    <td style={{ whiteSpace: "nowrap", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                      {formatDate(adj.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
