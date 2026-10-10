"use client";

import { useEffect, useState } from "react";

/**
 * Live, ticking clock for the dashboard header. Updates every second.
 * Renders nothing until mounted to avoid a server/client hydration
 * mismatch (the server has no single "now").
 */
export default function LiveClock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    // Reserve height so the header doesn't jump when the clock appears.
    return <div className="h-[58px]" aria-hidden />;
  }

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-2.5 shadow-soft">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <div className="leading-tight">
        <div className="font-display text-xl font-extrabold tabular-nums tracking-tight text-ink">{time}</div>
        <div className="text-[11px] text-muted">{date}</div>
      </div>
    </div>
  );
}
