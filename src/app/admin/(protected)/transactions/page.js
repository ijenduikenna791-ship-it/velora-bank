"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import {
  SearchIcon, SendIcon, ArrowDownLeftIcon, ArrowUpRightIcon, CloseIcon,
  ReceiptIcon, CheckCircleIcon,
} from "@/components/ui/icons";

const STATUSES = ["all", "completed", "pending", "failed", "reversed"];
const STATUS_STYLE = {
  completed: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  failed: "bg-danger/15 text-danger",
  reversed: "bg-muted/15 text-muted",
};

export default function AdminTransactionsPage() {
  const supabase = createClient();
  const [rows, setRows] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [detail, setDetail] = useState(null);

  async function load() {
    setLoading(true);
    const [{ data: txns }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(400),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, user_id, account_number, account_type"),
    ]);
    setRows(txns || []);
    setProfiles(Object.fromEntries((profs || []).map((p) => [p.id, p])));
    setAccounts(Object.fromEntries((accts || []).map((a) => [a.id, a])));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const types = useMemo(() => {
    const s = new Set(rows.map((r) => r.type).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [rows]);

  const who = (uid) => profiles[uid]?.full_name || profiles[uid]?.email || "—";
  const acctLabel = (id) => {
    const a = accounts[id];
    return a ? `${a.account_type} · •••• ${String(a.account_number).slice(-4)}` : "—";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (type !== "all" && r.type !== type) return false;
      if (!q) return true;
      return (
        r.reference?.toLowerCase().includes(q) ||
        r.recipient_name?.toLowerCase().includes(q) ||
        r.recipient_label?.toLowerCase().includes(q) ||
        who(r.initiator).toLowerCase().includes(q)
      );
    });
  }, [rows, query, status, type, profiles]);

  const totals = useMemo(() => {
    const completed = rows.filter((r) => r.status === "completed");
    const volume = completed.reduce((s, r) => s + Number(r.amount || 0), 0);
    return {
      count: rows.length,
      volume,
      pending: rows.filter((r) => r.status === "pending").length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Transfer Transactions</h1>
        <p className="text-sm text-muted">Every demo transfer, deposit and withdrawal across the platform.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total transactions" value={totals.count} icon={<ReceiptIcon size={18} />} />
        <Stat label="Completed volume" value={formatCurrency(totals.volume)} icon={<SendIcon size={18} />} />
        <Stat label="Pending" value={totals.pending} icon={<ArrowDownLeftIcon size={18} />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, name, recipient…"
            className="input pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto capitalize">
            {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input w-auto capitalize">
            {types.map((t) => <option key={t} value={t}>{t === "all" ? "All types" : t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-12 gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
          <div className="col-span-4">Transaction</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Date</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted">Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No transactions match your filters.</div>
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((r) => {
              const Brand = BRAND_CHANNEL_ICONS[r.type];
              return (
                <button
                  key={r.id}
                  onClick={() => setDetail(r)}
                  className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition hover:bg-white/5 sm:grid-cols-12 sm:items-center sm:gap-4"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    {Brand ? (
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
                        <Brand size={28} />
                      </span>
                    ) : (
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <ArrowUpRightIcon size={17} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">
                        {r.recipient_name || r.recipient_label || "Transfer"}
                      </div>
                      <div className="truncate font-mono text-[11px] text-muted">{r.reference}</div>
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="truncate text-sm text-ink">{who(r.initiator)}</div>
                    <div className="truncate text-xs capitalize text-muted">{r.type}</div>
                  </div>
                  <div className="col-span-2 text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(r.amount, r.currency)}
                  </div>
                  <div className="col-span-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[r.status] || "bg-muted/15 text-muted"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs text-muted sm:text-right">{formatDateTime(r.created_at)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setDetail(null)}>
          <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ReceiptIcon size={20} />
                </span>
                <div>
                  <div className="text-base font-semibold text-ink">{formatCurrency(detail.amount, detail.currency)}</div>
                  <div className="font-mono text-xs text-muted">{detail.reference}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>

            <div className="mt-3">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[detail.status] || "bg-muted/15 text-muted"}`}>
                {detail.status}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info label="Type" value={detail.type} cap />
              <Info label="Initiated by" value={who(detail.initiator)} />
              <Info label="From" value={acctLabel(detail.from_account)} />
              <Info label="To" value={detail.to_account ? acctLabel(detail.to_account) : (detail.recipient_label || "External")} />
              <Info label="Recipient" value={detail.recipient_name || "—"} />
              <Info label="Fee" value={formatCurrency(detail.fee || 0, detail.currency)} />
              <Info label="Date" value={formatDateTime(detail.created_at)} />
              <Info label="Reference" value={detail.reference} mono />
              <div className="col-span-2"><Info label="Note" value={detail.note || "—"} /></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="truncate text-lg font-bold text-ink">{value}</div>
      </div>
    </div>
  );
}

function Info({ label, value, cap, mono }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-0.5 truncate font-medium text-ink ${cap ? "capitalize" : ""} ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
