"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { COUNTRIES, flagUrl } from "@/lib/countries";
import { ChevronDownIcon, SearchIcon } from "./icons";

/**
 * Accessible country selector with real flag images and a search box.
 * value/onChange use the ISO alpha-2 code (e.g. "US").
 */
export default function CountrySelect({ value, onChange, placeholder = "Select country" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase() === q
    );
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selected ? (
            <>
              <Image src={flagUrl(selected.code)} alt="" width={22} height={16} className="rounded-[2px]" unoptimized />
              <span className="truncate text-ink">{selected.name}</span>
              <span className="text-muted">{selected.dial}</span>
            </>
          ) : (
            <span className="text-muted/70">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon size={16} className="text-muted" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-line bg-card shadow-soft">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <SearchIcon size={16} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1" role="listbox">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted">No matches</li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(c.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    c.code === value ? "bg-brand/10 text-brand" : "text-ink hover:bg-white/5"
                  }`}
                >
                  <Image src={flagUrl(c.code)} alt="" width={22} height={16} className="rounded-[2px]" unoptimized />
                  <span className="flex-1 truncate text-left">{c.name}</span>
                  <span className="text-xs text-muted">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
