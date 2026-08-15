const PerformanceChart = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="chart-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>No performance data yet</span>
      </div>
    );
  }

  const width = 280;
  const height = 80;
  const padding = 4;

  const balances = data.map((d) => d.balance);
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.balance - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      className="performance-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-label="Performance chart"
      role="img"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradient)" />
      <path
        d={pathD}
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-line"
      />
    </svg>
  );
};

export default PerformanceChart;
