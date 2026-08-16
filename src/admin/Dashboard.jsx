import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAdminSummary, formatCurrency } from "./services/adminData";
import "./admin.css";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAdminSummary();
      setSummary(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout activeNav="dashboard">
        <div className="admin-loading">
          <div className="admin-loading__spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  const cards = [
    { label: "Total Users", value: summary?.totalUsers || 0, change: null },
    { label: "Total Balance", value: formatCurrency(summary?.totalBalance), change: null },
    { label: "Total Investments", value: formatCurrency(summary?.totalInvestments), change: null },
    { label: "Total Deposits", value: formatCurrency(summary?.totalDeposits), change: null },
    { label: "Total Withdrawals", value: formatCurrency(summary?.totalWithdrawals), change: null },
    { label: "Active Users", value: summary?.activeUsers || 0, change: null },
  ];

  return (
    <AdminLayout activeNav="dashboard">
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">Overview of your investment platform</p>

      <div className="admin-summary">
        {cards.map((card) => (
          <div key={card.label} className="admin-summary__card">
            <span className="admin-summary__label">{card.label}</span>
            <span className="admin-summary__value">{card.value}</span>
            {card.change && (
              <span className={`admin-summary__change ${card.change >= 0 ? "admin-summary__change--positive" : "admin-summary__change--negative"}`}>
                {card.change >= 0 ? "↑" : "↓"} {Math.abs(card.change)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
