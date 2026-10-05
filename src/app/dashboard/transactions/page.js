"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CHANNELS } from "@/lib/utils";
import TxnList from "@/components/dashboard/TxnList";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";

export default function TransactionsPage() {
  const { t } = useI18n();
  const supabase = createClient();

  const [ownIds, setOwnIds] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [direction, setDirection] = useState("all"); // all | in | out

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: accts } = await supabase.from("accounts").select("id").eq("user_id", user.id);
      const ids = (accts || []).map((a) => a.id);
      setOwnIds(ids);
      const { data: txns } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      setRows(txns || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((tx) => {
      if (method !== "all" && tx.type !== method) return false;
      const incoming = ownIds.includes(tx.to_account) && !ownIds.includes(tx.from_account);
      if (direction === "in" && !incoming) return false;
      if (direction === "out" && incoming) return false;
      if (q) {
        const hay = [tx.recipient_name, tx.recipient_label, tx.reference, tx.note, tx.type, String(tx.amount)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, method, direction, ownIds]);

  const hasFilters = query || method !== "all" || direction !== "all";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Transactions</h1>
        <p className="text-sm text-muted">Search and filter every transfer on your account.</p>
      </div>

      {/* Controls */}
      <div className="card space-y-3 p-4">
        <div className="relative">
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reference, note, amount…"
            className="input pl-11 pr-10"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Clear">
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
              <option value="all">All methods</option>
              {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              <option value="deposit">Deposit</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="input">
              <option value="all">All</option>
              <option value="in">Incoming</option>
              <option value="out">Outgoing</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
          </span>
          {hasFilters && (
            <button onClick={() => { setQuery(""); setMethod("all"); setDirection("all"); }} className="text-xs font-medium text-brand hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading…</div>
      ) : (
        <TxnList transactions={filtered} ownAccountIds={ownIds} />
      )}
    </div>
  );
}
