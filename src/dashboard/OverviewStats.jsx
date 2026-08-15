import { formatCurrency } from "./services/dashboardData";

const OverviewStats = ({ totalInvested, totalReturns, activePlans, performance }) => {
  const stats = [
    {
      label: "Total Invested",
      value: formatCurrency(totalInvested),
      positive: null,
      tone: "violet",
      icon: <path d="M3 3v18h18 M7 15l4-4 3 3 5-7" />,
    },
    {
      label: "Total Returns",
      value: formatCurrency(totalReturns),
      positive: totalReturns >= 0,
      tone: "emerald",
      icon: <><path d="M3 17 9 11l4 4L21 6" /><path d="M15 6h6v6" /></>,
    },
    {
      label: "Active Plans",
      value: activePlans,
      positive: null,
      tone: "cyan",
      icon: <><circle cx="12" cy="12" r="8" /><path d="m9 12 2 2 4-4" /></>,
    },
  ];

  return (
    <section className="overview-stats">
      <h2 className="overview-stats__title">Overview</h2>
      <div className="overview-stats__grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`overview-stats__card overview-stats__card--${stat.tone}`}>
            <div className="overview-stats__topline">
              <span className="overview-stats__label">{stat.label}</span>
              <span className="overview-stats__icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{stat.icon}</svg></span>
            </div>
            <span
              className={`overview-stats__value ${stat.positive === true ? "overview-stats__value--positive" : ""} ${stat.positive === false ? "overview-stats__value--negative" : ""}`}
            >
              {stat.value}
            </span>
            {stat.label === "Total Returns" && <span className="overview-stats__note">{performance >= 0 ? "+" : ""}{Number(performance || 0).toFixed(2)}% this period</span>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverviewStats;
