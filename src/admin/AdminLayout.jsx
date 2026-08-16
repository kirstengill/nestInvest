import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import "./admin.css";

const AdminLayout = ({ children }) => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = session?.user?.displayName || session?.user?.email?.split("@")[0] || "Admin";
  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleNavClick = (id) => {
    if (id === "logout") {
      signOut().then(() => navigate("/"));
    } else if (id === "back-to-app") {
      navigate("/dashboard");
    } else {
      navigate(`/admin${id === "dashboard" ? "" : `/${id}`}`);
      setMobileOpen(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", iconPath: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
    { id: "users", label: "Users", iconPath: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
    { id: "active-users", label: "Active Users", iconPath: "M22 12h-4l-3 9L9 3l-3 9H2" },
    { id: "balance", label: "Balance", iconPath: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { id: "investments", label: "Investments", iconPath: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" },
    { id: "materials", label: "Materials", iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
    { id: "transactions", label: "Audit History", iconPath: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  ];

  const isActive = (id) => {
    if (id === "dashboard") return location.pathname === "/admin" || location.pathname === "/admin/";
    return location.pathname === `/admin/${id}`;
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="admin-sidebar__brand-text">nestInvest</span>
        </div>

        <div className="admin-sidebar__section">Admin Panel</div>
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar__nav-item ${isActive(item.id) ? "admin-sidebar__nav-item--active" : ""}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive(item.id) ? "page" : undefined}
            >
              <span className="admin-sidebar__nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.iconPath} />
                </svg>
              </span>
              <span className="admin-sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__section">Account</div>
        <nav className="admin-sidebar__nav" aria-label="Account navigation">
          <button
            className="admin-sidebar__nav-item"
            onClick={() => handleNavClick("back-to-app")}
          >
            <span className="admin-sidebar__nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="admin-sidebar__nav-label">Back to App</span>
          </button>
          <button
            className="admin-sidebar__nav-item admin-sidebar__nav-item--logout"
            onClick={() => handleNavClick("logout")}
          >
            <span className="admin-sidebar__nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
              </svg>
            </span>
            <span className="admin-sidebar__nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      <div className={`admin-mobile-overlay ${mobileOpen ? "admin-mobile-overlay--open" : ""}`} onClick={() => setMobileOpen(false)}></div>

      <nav className={`admin-mobile-sidebar ${mobileOpen ? "admin-mobile-sidebar--open" : ""}`} aria-label="Mobile admin navigation">
        <div className="admin-mobile-sidebar__header">
          <div className="admin-mobile-sidebar__brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>nestInvest Admin</span>
          </div>
          <button className="admin-mobile-sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="admin-mobile-sidebar__nav">
          <div className="admin-sidebar__section">Admin Panel</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-mobile-sidebar__nav-item ${isActive(item.id) ? "admin-mobile-sidebar__nav-item--active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.iconPath} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="admin-sidebar__section" style={{ marginTop: "20px" }}>Account</div>
          <button className="admin-mobile-sidebar__nav-item" onClick={() => handleNavClick("back-to-app")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to App</span>
          </button>
          <button className="admin-mobile-sidebar__nav-item admin-mobile-sidebar__nav-item--logout" onClick={() => handleNavClick("logout")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              className="admin-header__menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="admin-header__brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="admin-header__brand-text">nestInvest Admin</span>
            </div>
          </div>
          <div className="admin-header__right">
            <button className="admin-header__avatar-btn" aria-label={`Admin menu, ${userName}`}>
              <span className="admin-header__avatar">{getInitials(userName)}</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
