const TopHeader = ({ onMenuClick, notificationCount, user, onNotificationClick }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <header className="top-header">
      <div className="top-header__left">
        <button
          className="top-header__menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="top-header__brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="top-header__brand-text">nestInvest</span>
        </div>
      </div>

      <div className="top-header__right">
        <label className="top-header__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" placeholder="Search" aria-label="Search dashboard" />
        </label>
        <button
          className="top-header__notification-btn"
          onClick={onNotificationClick}
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="top-header__notification-badge">{notificationCount > 9 ? "9+" : notificationCount}</span>
          )}
        </button>

        <button className="top-header__avatar-btn" aria-label={`User menu, ${userName}`}>
          <span className="top-header__avatar">
            {getInitials(userName)}
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
