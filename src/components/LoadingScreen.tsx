export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-[var(--accent-cyan)] rounded-full animate-pulse-glow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-t-transparent border-[var(--accent-lime)] rounded-full animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 md:w-6 md:h-6 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-[var(--accent-cyan)] font-mono text-xs md:text-sm tracking-widest animate-pulse">
          INITIALIZING SYSTEM<span className="animate-blink">_</span>
        </p>
      </div>
    </div>
  );
}
