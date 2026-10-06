"use client";

import { motion } from "framer-motion";

/**
 * Simple animated area sparkline built from a list of numbers.
 * Pure SVG, themed via currentColor — no chart library needed.
 */
export default function MiniChart({ data = [], height = 120 }) {
  // Keep only finite numbers, and guarantee at least two points so the
  // path math never divides by zero (which would produce NaN coordinates).
  const clean = (data || []).filter((n) => Number.isFinite(n));
  const series =
    clean.length > 1
      ? clean
      : clean.length === 1
      ? [clean[0], clean[0]]
      : [12, 18, 14, 22, 19, 27, 24, 31, 28, 36];
  const width = 520;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const step = width / (series.length - 1);

  const points = series.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 16) - 8;
    return [x, y];
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-brand" preserveAspectRatio="none">
      <defs>
        <linearGradient id="mc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#mc-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}
