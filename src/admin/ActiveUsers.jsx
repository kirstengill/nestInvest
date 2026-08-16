import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchActiveUsers } from "./services/adminData";
import "./admin.css";

const initialTimestamp = Date.now();

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTimestamp);

  async function loadUsers() {
    const data = await fetchActiveUsers();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchActiveUsers();
      setUsers(data);
      setLoading(false);
    };
    initialLoad();
  }, []);

  const handleRefresh = () => {
    setCurrentTime(Date.now());
    setLoading(true);
    loadUsers();
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Never";
    const diff = currentTime - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <AdminLayout activeNav="active-users">
      <h1 className="admin-page-title">Active Users</h1>
      <p className="admin-page-subtitle">Users who have recently used the platform</p>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">Recently Active ({users.length})</h2>
          <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={handleRefresh}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p>No active users yet</p>
            <span>Activity data will appear here once users log in</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Last Active</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isRecent = currentTime - new Date(user.last_active).getTime() < 300000;
                  return (
                    <tr key={user.user_id}>
                      <td>
                        <div className="admin-table__name">{user.display_name}</div>
                        <div className="admin-table__email">{user.user_id.slice(0, 8)}...</div>
                      </td>
                      <td>
                        <div style={{ color: "#fff", fontWeight: 500 }}>{formatTimeAgo(user.last_active)}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          {user.last_active ? new Date(user.last_active).toLocaleString() : "—"}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${isRecent ? "admin-badge--success" : "admin-badge--warning"}`}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isRecent ? "#10b981" : "#f59e0b" }}></span>
                          {isRecent ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActiveUsers;
