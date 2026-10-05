"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { flagUrl } from "@/lib/countries";
import { ChevronDownIcon, GlobeIcon } from "./icons";

export default function LanguageSwitch({ compact = false }) {
  const { lang, changeLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = langs.find((l) => l.code === lang) || langs[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2 text-xs font-medium text-ink transition hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon size={16} className="text-muted" />
        {!compact && <span>{active.label}</span>}
        <ChevronDownIcon size={14} className="text-muted" />
      </button>

      {open && (
        <ul
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-soft"
          role="listbox"
        >
          {langs.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  changeLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  l.code === lang ? "bg-brand/10 text-brand" : "text-ink hover:bg-white/5"
                }`}
              >
                <Image
                  src={flagUrl(l.flag)}
                  alt=""
                  width={20}
                  height={15}
                  className="rounded-[2px]"
                  unoptimized
                />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
