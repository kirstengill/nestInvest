import { useState } from "react";
import { formatCurrency } from "./services/dashboardData";

const getActivityIcon = (type) => {
  switch (type) {
    case "deposit":
    case "topup":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "withdrawal":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 11 12 6 7 11" />
          <polyline points="17 18 12 13 7 18" />
        </svg>
      );
    case "investment":
    case "return":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "plan_created":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
};

const getActivityTitle = (type) => {
  switch (type) {
    case "deposit":
      return "Fund added";
    case "topup":
      return "Wallet funded";
    case "withdrawal":
      return "Withdrawal processed";
    case "investment":
      return "Investment created";
    case "return":
      return "Return received";
    case "plan_created":
      return "Investment plan created";
    default:
      return "Activity";
  }
};

const normalizeStatus = (status) => {
  if (!status) return "Successful";
  const cleaned = String(status).toLowerCase();
  if (cleaned === "completed") return "Successful";
  if (cleaned === "pending") return "Pending";
  if (cleaned === "failed") return "Failed";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const RecentActivity = ({ transactions }) => {
  const [showAll, setShowAll] = useState(false);

  const displayTransactions = showAll ? transactions : transactions.slice(0, 4);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (transactions.length === 0) {
    return (
      <section className="recent-activity">
        <h2 className="recent-activity__title">Recent Activity</h2>
        <div className="recent-activity__empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>No recent activity</p>
          <span>Your transactions will appear here once you start investing</span>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-activity">
      <div className="recent-activity__header">
        <h2 className="recent-activity__title">Recent Activity</h2>
        {transactions.length > 4 && (
          <button
            className="recent-activity__view-all"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>
      <div className="recent-activity__list">
        {displayTransactions.map((tx) => (
          <div key={tx.id} className="recent-activity__item">
            <div className={`recent-activity__icon ${tx.amount >= 0 ? "recent-activity__icon--positive" : "recent-activity__icon--negative"}`}>
              {getActivityIcon(tx.type)}
            </div>
            <div className="recent-activity__details">
              <span className="recent-activity__title">{getActivityTitle(tx.type)}</span>
            <span className="recent-activity__time">{formatDate(tx.created_at)} <span className="recent-activity__status">{normalizeStatus(tx.status)}</span></span>
            </div>
            <span className={`recent-activity__amount ${tx.amount >= 0 ? "recent-activity__amount--positive" : "recent-activity__amount--negative"}`}>
              {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentActivity;
