import PerformanceChart from "./PerformanceChart";

const BalanceCard = ({ balance, showBalance, onToggleBalance, performance, history }) => {
  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <div
      className="balance-card"
    >
      <div className="balance-card__header">
        <span className="balance-card__label">Total Balance</span>
        <button
          className="balance-card__toggle"
          onClick={onToggleBalance}
          aria-label={showBalance ? "Hide balance" : "Show balance"}
        >
          {showBalance ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      </div>

      <div className="balance-card__amount">
        {showBalance ? (
          <span className="balance-card__value">{formatCurrency(balance)}</span>
        ) : (
          <span className="balance-card__hidden">••••••</span>
        )}
      </div>

      <div className="balance-card__performance">
        <span className={`balance-card__change ${performance >= 0 ? "balance-card__change--positive" : "balance-card__change--negative"}`}>
          {performance >= 0 ? "↑" : "↓"} {Math.abs(performance).toFixed(2)}%
        </span>
        <span className="balance-card__period">this month</span>
      </div>

      <div className="balance-card__chart">
        <PerformanceChart data={history} />
      </div>
    </div>
  );
};

export default BalanceCard;
