"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ href = "/", className = "", mark = true, text = true, size = 30 }) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-bold tracking-tight", className)}>
      {mark && (
        <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
          <defs>
            <linearGradient id="velora-mark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgb(var(--brand-light))" />
              <stop offset="0.55" stopColor="rgb(var(--brand))" />
              <stop offset="1" stopColor="rgb(var(--accent))" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#velora-mark)" />
          <path d="M20 22c0-1.1.9-2 2-2h8a10 10 0 0 1 0 20h-8a2 2 0 0 1-2-2V22z" fill="#fff" fillOpacity="0.95" />
          <path d="M34 20h8a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-8a10 10 0 0 0 0-24z" fill="#fff" fillOpacity="0.55" />
        </svg>
      )}
      {text && <span className="text-lg text-ink">Velora</span>}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
