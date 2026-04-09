import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Market, Outcome } from "../types";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isWatched = useQuery(api.watchlist.isWatched, { marketId: market.marketId });
  const addToWatchlist = useMutation(api.watchlist.add);
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  const formatNumber = (n: number) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

  const getChangeColor = (current: number, previous?: number) => {
    if (!previous) return "var(--text-primary)";
    if (current > previous) return "var(--accent-lime)";
    if (current < previous) return "var(--danger)";
    return "var(--text-primary)";
  };

  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return null;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const handleWatchlistToggle = () => {
    if (isWatched) {
      removeFromWatchlist({ marketId: market.marketId });
    } else {
      addToWatchlist({ marketId: market.marketId });
    }
  };

  // Calculate implied probability for Yes outcome
  const yesOutcome = market.outcomes.find((o: Outcome) => o.name.toLowerCase() === 'yes') ?? market.outcomes[0];
  const mainProbability = yesOutcome?.price ?? 0.5;

  return (
    <div className="terminal-border bg-[var(--bg-card)] rounded-lg overflow-hidden hover:border-[var(--accent-cyan)]/50 transition-all group">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-[var(--border-color)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {market.category && (
              <span className="inline-block px-2 py-0.5 bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] text-[10px] tracking-wider rounded mb-2">
                {market.category.toUpperCase()}
              </span>
            )}
            <h3
              className="text-sm md:text-base font-semibold text-[var(--text-primary)] leading-tight line-clamp-2 cursor-pointer hover:text-[var(--accent-cyan)] transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              {market.question}
            </h3>
          </div>
          <button
            onClick={handleWatchlistToggle}
            className={`p-1.5 rounded transition-all ${
              isWatched
                ? "text-[var(--warning)] bg-[var(--warning)]/10"
                : "text-[var(--text-muted)] hover:text-[var(--warning)]"
            }`}
          >
            {isWatched ? "★" : "☆"}
          </button>
        </div>
      </div>

      {/* Probability gauge */}
      <div className="px-3 md:px-4 py-3 bg-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-muted)] text-xs tracking-wider">PROBABILITY</span>
          <span
            className="font-['Orbitron'] text-lg md:text-xl font-bold"
            style={{ color: mainProbability > 0.5 ? 'var(--accent-lime)' : 'var(--danger)' }}
          >
            {formatPercent(mainProbability)}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${mainProbability * 100}%`,
              background: `linear-gradient(90deg, var(--accent-cyan), ${mainProbability > 0.5 ? 'var(--accent-lime)' : 'var(--danger)'})`
            }}
          />
        </div>
      </div>

      {/* Outcomes */}
      <div className="p-3 md:p-4 space-y-2">
        {market.outcomes.map((outcome: Outcome) => {
          const changeIndicator = getChangeIndicator(outcome.price, outcome.previousPrice);
          return (
            <div
              key={outcome.name}
              className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]"
            >
              <span className="text-sm text-[var(--text-secondary)]">{outcome.name}</span>
              <div className="flex items-center gap-2">
                {changeIndicator && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: getChangeColor(outcome.price, outcome.previousPrice) }}
                  >
                    {changeIndicator}
                  </span>
                )}
                <span
                  className="font-['Orbitron'] font-semibold text-sm"
                  style={{ color: getChangeColor(outcome.price, outcome.previousPrice) }}
                >
                  {formatPercent(outcome.price)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="px-3 md:px-4 py-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] md:text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span>VOL: <span className="text-[var(--accent-cyan)]">{formatNumber(market.volume)}</span></span>
          <span>LIQ: <span className="text-[var(--accent-orange)]">{formatNumber(market.liquidity)}</span></span>
        </div>
        {market.endDate && (
          <span className="text-[var(--text-muted)]">
            {new Date(market.endDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && market.description && (
        <div className="px-3 md:px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {market.description}
          </p>
        </div>
      )}
    </div>
  );
}
