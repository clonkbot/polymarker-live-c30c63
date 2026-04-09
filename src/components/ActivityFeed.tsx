import type { Activity } from "../types";

interface ActivityFeedProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityFeed({ activities, compact }: ActivityFeedProps) {
  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'market_update': return '🔄';
      case 'price_spike': return '📈';
      case 'new_market': return '🆕';
      case 'market_resolved': return '✅';
      default: return '📊';
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'market_update': return 'var(--accent-cyan)';
      case 'price_spike': return 'var(--accent-orange)';
      case 'new_market': return 'var(--accent-lime)';
      case 'market_resolved': return 'var(--accent-purple)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (compact) {
    return (
      <div className="divide-y divide-[var(--border-color)]">
        {activities.map((activity) => (
          <div key={activity._id} className="px-3 py-2 flex items-center gap-2 text-xs">
            <span>{getTypeIcon(activity.type)}</span>
            <span className="flex-1 text-[var(--text-secondary)] truncate">{activity.message}</span>
            <span className="text-[var(--text-muted)]">{formatTime(activity.timestamp)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--accent-lime)] rounded-full animate-pulse" />
          <h2 className="font-['Orbitron'] text-sm font-bold text-[var(--text-primary)] tracking-wider">
            ACTIVITY FEED
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            No recent activity
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {activities.map((activity, index) => (
              <div
                key={activity._id}
                className="p-3 hover:bg-[var(--bg-tertiary)] transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${getTypeColor(activity.type)}15` }}
                  >
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
          <span>Listening for updates</span>
        </div>
      </div>
    </div>
  );
}
