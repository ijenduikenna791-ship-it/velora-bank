"use client";

import { useState } from "react";

/**
 * <img> with a graceful gradient fallback if the remote image fails.
 * Used for Pexels photography so a missing URL never breaks the layout.
 * Swap the `src` values (see README) for your own licensed photos.
 */
export default function SmartImage({ src, alt = "", className = "", fallbackClassName = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-brand/30 via-accent/20 to-brand-dark/30 ${fallbackClassName || className}`}
        aria-label={alt}
        role="img"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
