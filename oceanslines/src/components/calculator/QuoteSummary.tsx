"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Anchor, MapPin } from "lucide-react";
import { useT, type Dictionary } from "@/i18n";
import type { QuoteLineKey, QuoteResult, ShippingQuote } from "@/lib/pricing";
import { EASE_LUXE } from "@/lib/motion";
import { formatMoney } from "@/lib/utils";
import { useCalculatorStore } from "@/store/calculator-store";
import { AnimatedAmount } from "./AnimatedAmount";

/** Fixed rows, so the panel keeps the same structure before and after a quote. */
const LINE_KEYS = ["inland", "ocean", "handling", "service"] as const satisfies readonly QuoteLineKey[];

const lineDetail = (key: QuoteLineKey, q: ShippingQuote, t: Dictionary): string => {
  switch (key) {
    case "inland":
      return `${q.location.city}, ${q.location.state} → ${q.port.label}`;
    case "ocean":
      return `${q.port.label} → ${t.quote.destination}`;
    case "handling":
      return t.quote.handlingDetail(q.location.auction);
    case "service":
      return t.quote.serviceDetail;
  }
};

function errorMessage(result: Extract<QuoteResult, { ok: false }>, t: Dictionary): string {
  const { auction, state, city } = useCalculatorStore.getState();
  if (result.code === "UNKNOWN_LOCATION" && auction && state && city) return t.quote.errorUnknownLocation(auction, city, state);
  return t.quote.errorNoPort(state ?? "");
}

/**
 * Right-hand result panel. Renders the same structure for every tier — only
 * the numbers and the theme variables differ.
 */
export function QuoteSummary({ result }: { result: QuoteResult | null }) {
  const t = useT();
  const quote = result?.ok ? result.quote : null;
  const currency = quote?.currency ?? "USD";

  return (
    <motion.section
      layout
      transition={{ layout: { duration: 0.6, ease: EASE_LUXE } }}
      aria-labelledby="quote-heading"
      aria-live="polite"
      className="flex h-full flex-col rounded-2xl border border-line bg-surface-raised p-6 shadow-soft transition-colors duration-700 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="quote-heading" className="text-[13px] font-medium uppercase tracking-[0.14em] text-fg-muted">
          {t.quote.total}
        </h2>
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-fg-subtle">{currency}</span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        {quote ? (
          <>
            <AnimatedAmount
              value={quote.total}
              currency={currency}
              className="font-serif text-5xl tabular-nums tracking-tight text-fg sm:text-6xl"
            />
            <span className="sr-only">{formatMoney(quote.total, currency)}</span>
          </>
        ) : (
          <span className="font-serif text-5xl tracking-tight text-fg-subtle/60 sm:text-6xl">$ —</span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 text-sm">
        <RouteRow
          icon={MapPin}
          label={t.quote.pickup}
          value={quote ? `${quote.location.auction} · ${quote.location.city}, ${quote.location.state}` : "—"}
        />
        <RouteRow icon={Anchor} label={t.quote.exportPort} value={quote ? `${quote.port.label} → ${t.quote.destination}` : "—"} />
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {LINE_KEYS.map((key, i) => {
          const line = quote?.lines.find((l) => l.key === key);
          return (
            <li key={key} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm text-fg">{t.quote.lines[key]}</p>
                <p className="truncate text-xs text-fg-subtle">{quote ? lineDetail(key, quote, t) : "—"}</p>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={line && quote ? `${line.amount}-${quote.tier}` : "empty"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: EASE_LUXE } }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                  className="shrink-0 text-sm tabular-nums text-fg"
                >
                  {line ? formatMoney(line.amount, currency) : "—"}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false}>
        {result && !result.ok ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-start gap-2 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {errorMessage(result, t)}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <p className="mt-auto pt-6 text-xs leading-relaxed text-fg-subtle">{t.quote.disclaimer}</p>
    </motion.section>
  );
}

function RouteRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span className="w-24 shrink-0 text-fg-muted">{label}</span>
      <span className="min-w-0 truncate text-fg">{value}</span>
    </div>
  );
}
