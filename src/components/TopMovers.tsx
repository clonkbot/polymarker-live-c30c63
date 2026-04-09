import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Market, Outcome } from "../types";

interface MoverOutcome extends Outcome {
  change: number;
}

export function TopMovers() {
  const movers = useQuery(api.markets.getTopMovers) as Market[] | undefined;

  const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

  const formatNumber = (n: number) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  if (movers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-t-transparent border-[var(--accent-cyan)] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[var(--text-muted)] text-sm tracking-wider">ANALYZING MOVEMENTS...</p>
        </div>
      </div>
    );
  }

  if (movers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📈</div>
        <p className="text-[var(--text-muted)]">No significant price movements detected</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">Markets are stable right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔥</span>
        <h2 className="font-['Orbitron'] text-lg font-bold text-[var(--accent-orange)]">
          TOP MOVERS
        </h2>
        <span className="text-[var(--text-muted)] text-xs">
          Last 30 minutes
        </span>
      </div>

      {movers.map((market: Market, index: number) => {
        const biggestMover = market.outcomes.reduce((max: MoverOutcome, outcome: Outcome) => {
          const change = outcome.previousPrice
            ? Math.abs(outcome.price - outcome.previousPrice)
            : 0;
          return change > max.change ? { ...outcome, change } : max;
        }, { name: '', price: 0, change: 0, previousPrice: 0 });

        const isUp = biggestMover.price > (biggestMover.previousPrice ?? biggestMover.price);

        return (
          <div
            key={market._id}
            className="terminal-border bg-[var(--bg-card)] rounded-lg p-3 md:p-4 hover:border-[var(--accent-cyan)]/50 transition-all animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg font-bold font-['Orbitron']"
                  style={{
                    backgroundColor: isUp ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 59, 92, 0.1)',
                    color: isUp ? 'var(--accent-lime)' : 'var(--danger)'
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-[var(--text-primary)] line-clamp-2">
                    {market.question}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                    <span className="text-[var(--text-muted)] text-xs">
                      {biggestMover.name}:
                    </span>
                    <span
                      className="font-['Orbitron'] font-bold text-sm"
                      style={{ color: isUp ? 'var(--accent-lime)' : 'var(--danger)' }}
                    >
                      {formatPercent(biggestMover.price)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isUp ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 59, 92, 0.1)',
                        color: isUp ? 'var(--accent-lime)' : 'var(--danger)'
                      }}
                    >
                      {isUp ? '↑' : '↓'} {(biggestMover.change * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)]">
                <div>VOL</div>
                <div className="text-[var(--accent-cyan)] font-mono">{formatNumber(market.volume)}</div>
              </div>
            </div>

            {/* Mini probability bar */}
            <div className="mt-3 flex gap-1">
              {market.outcomes.map((outcome: Outcome) => (
                <div
                  key={outcome.name}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${outcome.price * 100}%`,
                      backgroundColor: outcome.name.toLowerCase() === 'yes' ? 'var(--accent-lime)' : 'var(--danger)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
