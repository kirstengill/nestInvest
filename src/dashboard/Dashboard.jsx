import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import TopHeader from "./TopHeader";
import GreetingSection from "./GreetingSection";
import BalanceCard from "./BalanceCard";
import QuickActions from "./QuickActions";
import OverviewStats from "./OverviewStats";
import RecentActivity from "./RecentActivity";
import "./dashboard.css";
import {
  fetchUserProfile,
  fetchBalance,
  fetchPerformanceHistory,
  fetchInvestments,
  fetchTransactions,
  fetchNotifications,
  calculateTotalReturns,
  calculateTotalInvested,
} from "./services/dashboardData";

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [showBalance, setShowBalance] = useState(true);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate("/");
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const userId = session.user.id;
        const [profileData, balanceData, historyData, investmentsData, transactionsData, notificationsData] =
          await Promise.all([
            fetchUserProfile(userId),
            fetchBalance(userId),
            fetchPerformanceHistory(userId),
            fetchInvestments(userId),
            fetchTransactions(userId),
            fetchNotifications(userId),
          ]);

        setProfile(profileData);
        setBalance(balanceData);
        setPerformanceHistory(historyData);
        setInvestments(investmentsData);
        setTransactions(transactionsData);
        setNotifications(notificationsData);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  const userName = profile?.display_name || session?.user?.user_metadata?.display_name || "User";
  const totalBalance = balance?.balance ?? 0;
  const totalInvested = calculateTotalInvested(investments);
  const totalReturns = calculateTotalReturns(investments);
  const activePlans = investments.filter((inv) => inv.status === "active").length;

  const performancePercent = performanceHistory.length >= 2
    ? ((performanceHistory[performanceHistory.length - 1].balance - performanceHistory[0].balance) /
        performanceHistory[0].balance) *
      100
    : 0;

  const handleTopUp = () => {
    alert("Deposit flow would open here");
  };

  const handleWithdraw = () => {
    alert("Withdrawal flow would open here");
  };

  return (
    <div className="investment-dashboard">
      <Sidebar
        activeNav="dashboard"
        onNavClick={(id) => {
          if (id === "logout") {
            handleSignOut({ preventDefault: () => {} });
          } else if (id === "investments") {
            navigate("/investments/gold-precious-metals");
          } else {
            setSidebarOpen(false);
          }
        }}
        user={session?.user}
      />

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavClick={(id) => {
          if (id === "logout") {
            handleSignOut({ preventDefault: () => {} });
          } else if (id === "investments") {
            navigate("/investments/gold-precious-metals");
          } else {
            setSidebarOpen(false);
          }
        }}
        user={session?.user}
      />

      <main className="main-content">
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          notificationCount={notifications.length}
          user={session?.user}
          onNotificationClick={() => alert("Notifications panel would open here")}
        />

        {error && (
          <div className="dashboard-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="dashboard-error__retry">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="dashboard-skeletons">
            <div className="skeleton skeleton--balance" />
            <div className="skeleton skeleton--actions" />
            <div className="skeleton skeleton--stats" />
            <div className="skeleton skeleton--activity" />
          </div>
        ) : (
          <>
            <GreetingSection name={userName} />

            <BalanceCard
              balance={totalBalance}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              performance={performancePercent}
              history={performanceHistory}
            />

            <QuickActions onTopUp={handleTopUp} onWithdraw={handleWithdraw} />

            <OverviewStats
              totalInvested={totalInvested}
              totalReturns={totalReturns}
              activePlans={activePlans}
              performance={performancePercent}
            />

            <RecentActivity transactions={transactions} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
