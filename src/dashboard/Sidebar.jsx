const Sidebar = ({ activeNav, onNavClick }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "investments", label: "My Investments", icon: "investments" },
    { id: "transactions", label: "Transactions", icon: "transactions" },
    { id: "wallet", label: "Wallet", icon: "wallet" },
    { id: "goals", label: "Goals", icon: "goals" },
    { id: "profile", label: "Profile", icon: "profile" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const iconPaths = {
    dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    investments: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    transactions: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    wallet: "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7 M21 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
    goals: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M16 12l-4-4-4 4 M12 16V8",
    profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51H17a1.65 1.65 0 0 0 1.51-1l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="sidebar__brand-text">nestInvest</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeNav === item.id ? "sidebar__nav-item--active" : ""}`}
            onClick={() => onNavClick(item.id)}
            aria-current={activeNav === item.id ? "page" : undefined}
          >
            <span className="sidebar__nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPaths[item.icon]} />
              </svg>
            </span>
            <span className="sidebar__nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__nav-item sidebar__nav-item--logout"
          onClick={() => onNavClick("logout")}
          aria-label="Logout"
        >
          <span className="sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
          </span>
          <span className="sidebar__nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
