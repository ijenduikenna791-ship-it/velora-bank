"use client";

// Currency converter with country flags next to each currency.
import { useState } from "react";
import { motion } from "framer-motion";

// Demo FX rates — units per 1 USD. Illustrative only, no live API.
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1, flag: "us" },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92, flag: "eu" },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79, flag: "gb" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1550, flag: "ng" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36, flag: "ca" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 150, flag: "jp" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83, flag: "in" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52, flag: "au" },
];

const rateOf = (code) => CURRENCIES.find((c) => c.code === code)?.rate ?? 1;
const symbolOf = (code) => CURRENCIES.find((c) => c.code === code)?.symbol ?? "";
const flagOf = (code) => CURRENCIES.find((c) => c.code === code)?.flag ?? "us";

function SwapIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16" />
      <path d="M4 7l3-3 3 3" />
      <path d="M17 20V4" />
      <path d="M20 17l-3 3-3-3" />
    </svg>
  );
}

export default function Converter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const amt = parseFloat(amount) || 0;
  const converted = (amt / rateOf(from)) * rateOf(to);
  const unitRate = rateOf(to) / rateOf(from);

  const fmt = (n, code) => {
    const max = code === "JPY" || code === "NGN" ? 0 : 2;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: max,
      minimumFractionDigits: Math.min(2, max),
    }).format(n);
  };

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const Select = ({ value, onChange }) => (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface pl-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${flagOf(value)}.png`}
        alt=""
        className="h-4 w-6 shrink-0 rounded-sm object-cover"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent py-3 pr-3 font-semibold text-ink focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.code}</option>
        ))}
      </select>
    </div>
  );

  return (
    <section id="converter" className="relative py-20">
      <div className="container-px grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="chip mb-4">Global money</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Send across borders with ease
          </h2>
          <p className="mt-3 text-muted">
            Hold and move money in multiple currencies. See exactly what lands on
            the other side before you send — no surprises, no buried fees.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>• Transparent, up-front conversion</li>
            <li>• 8+ major currencies supported</li>
            <li>• Instant between Velora accounts</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card p-6 sm:p-7"
        >
          <div className="text-sm font-semibold text-ink">Currency converter</div>

          <div className="mt-5">
            <label className="label">You send</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                  {symbolOf(from)}
                </span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input pl-9 text-lg font-semibold"
                />
              </div>
              <Select value={from} onChange={setFrom} />
            </div>
          </div>

          <div className="my-3 flex justify-center">
            <button
              onClick={swap}
              aria-label="Swap currencies"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-brand/10 text-brand transition hover:bg-brand hover:text-white"
            >
              <SwapIcon size={18} />
            </button>
          </div>

          <div>
            <label className="label">They receive</label>
            <div className="flex gap-3">
              <div className="flex flex-1 items-center rounded-xl border border-line bg-surface px-4 py-3">
                <span className="mr-1 text-sm text-muted">{symbolOf(to)}</span>
                <span className="text-lg font-semibold text-ink">{fmt(converted, to)}</span>
              </div>
              <Select value={to} onChange={setTo} />
            </div>
          </div>

          <div className="mt-5 flex items-center rounded-xl border border-line bg-white/5 px-4 py-3 text-xs text-muted">
            <span>
              1 {from} = {fmt(unitRate, to)} {to}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
