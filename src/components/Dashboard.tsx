import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { MarketCard } from "./MarketCard";
import { TopMovers } from "./TopMovers";
import { ActivityFeed } from "./ActivityFeed";
import { Watchlist } from "./Watchlist";
import { MarketStats } from "./MarketStats";
import type { Market, Activity } from "../types";

type Tab = "markets" | "movers" | "watchlist";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const [searchQuery, setSearchQuery] = useState("");

  const markets = useQuery(api.markets.listActive) as Market[] | undefined;
  const activity = useQuery(api.markets.getRecentActivity) as Activity[] | undefined;
  const fetchData = useAction(api.markets.fetchPolymarketData);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredMarkets = markets?.filter((m: Market) =>
    m.question.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const totalVolume = markets?.reduce((sum: number, m: Market) => sum + m.volume, 0) ?? 0;
  const totalLiquidity = markets?.reduce((sum: number, m: Market) => sum + m.liquidity, 0) ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-50">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <h1 className="font-['Orbitron'] text-lg md:text-2xl font-bold text-[var(--accent-cyan)] text-glow-cyan tracking-wider">
                POLYMARKER
              </h1>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)]">
                <div className="w-2 h-2 bg-[var(--accent-lime)] rounded-full animate-pulse" />
                <span className="text-[var(--accent-lime)] text-xs tracking-wider">LIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => fetchData()}
                className="p-2 md:px-3 md:py-2 border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all text-xs"
                title="Refresh data"
              >
                <span className="hidden md:inline">SYNC</span>
                <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 md:px-3 md:py-2 border border-[var(--danger)]/30 rounded text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all text-xs"
              >
                <span className="hidden md:inline">LOGOUT</span>
                <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <MarketStats
          totalMarkets={markets?.length ?? 0}
          totalVolume={totalVolume}
          totalLiquidity={totalLiquidity}
          lastUpdate={activity?.[0]?.timestamp}
        />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left sidebar - Activity feed (hidden on mobile, shown as bottom on tablet) */}
        <aside className="hidden lg:block w-80 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <ActivityFeed activities={activity ?? []} />
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col min-h-0 bg-[var(--bg-primary)]">
          {/* Tabs & Search */}
          <div className="border-b border-[var(--border-color)] p-3 md:p-4 bg-[var(--bg-secondary)]">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {[
                  { id: "markets" as Tab, label: "ALL MARKETS", icon: "📊" },
                  { id: "movers" as Tab, label: "TOP MOVERS", icon: "🔥" },
                  { id: "watchlist" as Tab, label: "WATCHLIST", icon: "⭐" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent"
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              {activeTab === "markets" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="SEARCH MARKETS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-8 pr-4 py-2 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded"
                  />
                  <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {markets === undefined ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-t-transparent border-[var(--accent-cyan)] rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-[var(--text-muted)] text-sm tracking-wider">LOADING MARKETS...</p>
                </div>
              </div>
            ) : activeTab === "markets" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredMarkets.map((market: Market, index: number) => (
                  <div
                    key={market._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <MarketCard market={market} />
                  </div>
                ))}
                {filteredMarkets.length === 0 && (
                  <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                    {searchQuery ? "No markets found matching your search" : "No active markets"}
                  </div>
                )}
              </div>
            ) : activeTab === "movers" ? (
              <TopMovers />
            ) : (
              <Watchlist />
            )}
          </div>

          {/* Mobile activity feed */}
          <div className="lg:hidden border-t border-[var(--border-color)]">
            <details className="bg-[var(--bg-secondary)]">
              <summary className="p-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wider cursor-pointer">
                📡 ACTIVITY FEED ({activity?.length ?? 0})
              </summary>
              <div className="max-h-64 overflow-y-auto">
                <ActivityFeed activities={activity ?? []} compact />
              </div>
            </details>
          </div>
        </main>
      </div>
    </div>
  );
}
