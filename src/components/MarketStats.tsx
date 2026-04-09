interface MarketStatsProps {
  totalMarkets: number;
  totalVolume: number;
  totalLiquidity: number;
  lastUpdate?: number;
}

export function MarketStats({ totalMarkets, totalVolume, totalLiquidity, lastUpdate }: MarketStatsProps) {
  const formatNumber = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-color)]">
      {[
        { label: "ACTIVE MARKETS", value: totalMarkets.toString(), color: "var(--accent-cyan)" },
        { label: "TOTAL VOLUME", value: formatNumber(totalVolume), color: "var(--accent-lime)" },
        { label: "LIQUIDITY", value: formatNumber(totalLiquidity), color: "var(--accent-orange)" },
        { label: "LAST SYNC", value: formatTime(lastUpdate), color: "var(--accent-purple)" },
      ].map((stat) => (
        <div key={stat.label} className="bg-[var(--bg-tertiary)] px-3 py-2 md:px-4 md:py-3">
          <p className="text-[var(--text-muted)] text-[10px] md:text-xs tracking-wider">{stat.label}</p>
          <p
            className="text-sm md:text-lg font-bold font-['Orbitron'] tracking-wider mt-0.5"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
