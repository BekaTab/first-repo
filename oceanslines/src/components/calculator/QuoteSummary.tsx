"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useT, type Dictionary } from "@/i18n";
import type { QuoteResult } from "@/lib/pricing";
import { EASE_LUXE } from "@/lib/motion";
import { formatMoney } from "@/lib/utils";
import { useCalculatorStore } from "@/store/calculator-store";
import { AnimatedAmount } from "./AnimatedAmount";

function errorMessage(result: Extract<QuoteResult, { ok: false }>, t: Dictionary): string {
  const { auction, state, city } = useCalculatorStore.getState();
  if (result.code === "UNKNOWN_LOCATION" && auction && state && city) return t.quote.errorUnknownLocation(auction, city, state);
  return t.quote.errorNoPort(state ?? "");
}

/**
 * Result panel: the full cost to Poti, in US dollars. Same structure for every
 * tier — only the number and the theme variables differ.
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
      className="relative flex h-full min-h-[16rem] flex-col justify-center overflow-hidden rounded-2xl border border-line bg-surface-raised p-8 shadow-soft transition-colors duration-700 sm:p-10"
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <h2 id="quote-heading" className="relative text-lg font-medium text-fg-muted">
        {t.quote.total}
      </h2>

      <div className="relative mt-5 flex items-baseline">
        {quote ? (
          <>
            <AnimatedAmount
              value={quote.total}
              currency={currency}
              className="font-serif text-6xl tabular-nums tracking-tight text-fg sm:text-7xl"
            />
            <span className="sr-only">{formatMoney(quote.total, currency)}</span>
          </>
        ) : (
          <span className="font-serif text-6xl tracking-tight text-fg-subtle/50 sm:text-7xl">$ —</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {result && !result.ok ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative mt-5 flex items-start gap-2 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {errorMessage(result, t)}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
