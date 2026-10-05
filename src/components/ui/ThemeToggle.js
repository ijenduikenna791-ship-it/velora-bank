"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "./icons";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme || theme : "dark";
  const isDark = current === "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/5 text-ink transition hover:bg-white/10"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        {isDark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white/5 p-1" suppressHydrationWarning>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          !isDark ? "bg-brand text-white" : "text-muted hover:text-ink"
        }`}
      >
        <SunIcon size={15} /> {t("auth.light")}
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          isDark ? "bg-brand text-white" : "text-muted hover:text-ink"
        }`}
      >
        <MoonIcon size={15} /> {t("auth.dark")}
      </button>
    </div>
  );
}
