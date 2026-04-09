import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { WatchlistItem, Outcome } from "../types";

export function Watchlist() {
  const watchlist = useQuery(api.watchlist.get) as WatchlistItem[] | undefined;
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

  const formatNumber = (n: number) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  if (watchlist === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-t-transparent border-[var(--accent-cyan)] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[var(--text-muted)] text-sm tracking-wider">LOADING WATCHLIST...</p>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⭐</div>
        <p className="text-[var(--text-muted)]">Your watchlist is empty</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Star markets to track them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⭐</span>
        <h2 className="font-['Orbitron'] text-lg font-bold text-[var(--warning)]">
          WATCHLIST
        </h2>
        <span className="text-[var(--text-muted)] text-xs">
          {watchlist.length} market{watchlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {watchlist.map((item: WatchlistItem, index: number) => {
          const market = item.market;
          if (!market) return null;

          const yesOutcome = market.outcomes.find((o: Outcome) => o.name.toLowerCase() === 'yes') ?? market.outcomes[0];
          const probability = yesOutcome?.price ?? 0.5;

          return (
            <div
              key={item._id}
              className="terminal-border bg-[var(--bg-card)] rounded-lg overflow-hidden hover:border-[var(--warning)]/50 transition-all animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 flex-1">
                    {market.question}
                  </h3>
                  <button
                    onClick={() => removeFromWatchlist({ marketId: market.marketId })}
                    className="p-1.5 text-[var(--warning)] hover:bg-[var(--warning)]/10 rounded transition-all"
                  >
                    ★
                  </button>
                </div>

                {/* Quick stats */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-['Orbitron'] font-bold text-lg"
                      style={{ color: probability > 0.5 ? 'var(--accent-lime)' : 'var(--danger)' }}
                    >
                      {formatPercent(probability)}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs">YES</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Vol: <span className="text-[var(--accent-cyan)]">{formatNumber(market.volume)}</span>
                  </div>
                </div>

                {/* Mini probability bar */}
                <div className="mt-2 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${probability * 100}%`,
                      background: probability > 0.5
                        ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-lime))'
                        : 'linear-gradient(90deg, var(--danger), var(--accent-orange))'
                    }}
                  />
                </div>
              </div>

              {/* Outcomes row */}
              <div className="px-3 md:px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex gap-2">
                {market.outcomes.slice(0, 2).map((outcome: Outcome) => (
                  <div
                    key={outcome.name}
                    className="flex-1 flex items-center justify-between px-2 py-1 bg-[var(--bg-secondary)] rounded text-xs"
                  >
                    <span className="text-[var(--text-muted)]">{outcome.name}</span>
                    <span className="font-mono text-[var(--text-primary)]">{formatPercent(outcome.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
