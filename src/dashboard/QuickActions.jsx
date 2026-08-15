const QuickActions = ({ onTopUp, onWithdraw }) => {
  return (
    <div className="quick-actions">
      <button className="quick-actions__btn quick-actions__btn--topup" onClick={onTopUp}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Top Up</span>
      </button>
      <button className="quick-actions__btn quick-actions__btn--withdraw" onClick={onWithdraw}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 11 12 6 7 11" />
          <polyline points="17 18 12 13 7 18" />
        </svg>
        <span>Withdraw</span>
      </button>
    </div>
  );
};

export default QuickActions;
