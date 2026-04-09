import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--accent-cyan) 1px, transparent 1px),
              linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-[var(--accent-cyan)] rounded-full filter blur-[150px] opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-[var(--accent-lime)] rounded-full filter blur-[150px] opacity-10" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-['Orbitron'] text-2xl md:text-4xl font-bold text-[var(--accent-cyan)] text-glow-cyan tracking-wider">
            POLYMARKER
          </h1>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-2 tracking-widest">
            LIVE INTELLIGENCE SYSTEM
          </p>
        </div>

        {/* Auth card */}
        <div className="terminal-border bg-[var(--bg-card)] p-6 md:p-8 rounded-lg backdrop-blur-sm">
          <div className="flex gap-4 mb-6 border-b border-[var(--border-color)] pb-4">
            <button
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold tracking-wider transition-all ${
                flow === "signIn"
                  ? "text-[var(--accent-cyan)] border-b-2 border-[var(--accent-cyan)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              ACCESS
            </button>
            <button
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold tracking-wider transition-all ${
                flow === "signUp"
                  ? "text-[var(--accent-lime)] border-b-2 border-[var(--accent-lime)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-2 tracking-wider">
                EMAIL_ADDRESS
              </label>
              <input
                name="email"
                type="email"
                placeholder="operator@polymarker.io"
                required
                className="w-full text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-2 tracking-wider">
                ACCESS_KEY
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full text-sm"
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded text-[var(--danger)] text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded font-semibold text-sm tracking-wider transition-all ${
                flow === "signIn"
                  ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)] hover:shadow-[0_0_20px_var(--accent-cyan)]"
                  : "bg-[var(--accent-lime)] text-[var(--bg-primary)] hover:shadow-[0_0_20px_var(--accent-lime)]"
              }`}
            >
              {isLoading ? "PROCESSING..." : flow === "signIn" ? "AUTHENTICATE" : "CREATE_ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={handleAnonymous}
              disabled={isLoading}
              className="w-full py-3 border border-[var(--border-color)] rounded text-[var(--text-secondary)] text-sm tracking-wider hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)] transition-all"
            >
              GUEST_ACCESS
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-[var(--accent-lime)] rounded-full animate-pulse" />
          <span className="text-[var(--text-muted)] text-xs tracking-wider">
            SYSTEM ONLINE | MARKETS LIVE
          </span>
        </div>
      </div>
    </div>
  );
}
