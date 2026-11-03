"use client";

import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { useEffect, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select, type SelectOption } from "@/components/ui/select";
import { getLocations } from "@/data/locations";
import { US_STATES, type StateCode } from "@/data/us-states";
import { usePricingTier } from "@/hooks/use-pricing-tier";
import { useT } from "@/i18n";
import { EASE_LUXE } from "@/lib/motion";
import { selectIsComplete, useCalculatorStore } from "@/store/calculator-store";
import { AUCTIONS, CAR_TYPES, type Auction, type CarType } from "@/types/domain";
import { QuoteSummary } from "./QuoteSummary";

// Language-independent option lists — built once.
const AUCTION_OPTIONS: readonly SelectOption<Auction>[] = AUCTIONS.map((a) => ({ value: a, label: a }));
const STATE_OPTIONS: readonly SelectOption<StateCode>[] = US_STATES.map((s) => ({ value: s.code, label: s.code, hint: s.name }));

/**
 * Transportation Calculator.
 *
 * The markup is identical for every role. The theme comes from the enclosing
 * `[data-portal-theme]` scope and the price from the user's pricing tier.
 */
export function TransportCalculator() {
  const t = useT();
  const { tier } = usePricingTier();
  const carTypeOptions = useMemo<readonly SelectOption<CarType>[]>(
    () => CAR_TYPES.map((c) => ({ value: c, label: t.carTypes[c] })),
    [t],
  );

  const auction = useCalculatorStore((s) => s.auction);
  const state = useCalculatorStore((s) => s.state);
  const city = useCalculatorStore((s) => s.city);
  const carType = useCalculatorStore((s) => s.carType);
  const result = useCalculatorStore((s) => s.result);
  const isComplete = useCalculatorStore(selectIsComplete);
  const { setAuction, setState, setCity, setCarType, calculate } = useCalculatorStore.getState();

  // City options follow the selected auction + state.
  const cityOptions = useMemo<readonly SelectOption<string>[]>(
    () => (auction && state ? getLocations(auction, state).map((l) => ({ value: l.city, label: l.city })) : []),
    [auction, state],
  );

  // If the tier changes while a quote is showing (admin preview), re-price it.
  useEffect(() => {
    if (useCalculatorStore.getState().result) calculate(tier);
  }, [tier, calculate]);

  const cityHint = !auction || !state
    ? t.calculator.cityHintChoose
    : cityOptions.length === 0
      ? t.calculator.cityHintNone(auction, state)
      : t.calculator.cityHintCount(cityOptions.length, auction, state);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    calculate(tier);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_LUXE }}
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-line bg-surface-raised p-6 shadow-soft transition-colors duration-700 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calculator className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="calculator-heading" className="text-lg font-semibold text-fg">
              {t.calculator.title}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{t.calculator.subtitle}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-x-5 gap-y-6 sm:grid-cols-2">
          <Field id="calc-auction" label={t.calculator.auction}>
            <Select id="calc-auction" value={auction} onValueChange={setAuction} options={AUCTION_OPTIONS} placeholder={t.calculator.selectAuction} />
          </Field>

          <Field id="calc-state" label={t.calculator.state}>
            <Select id="calc-state" value={state} onValueChange={setState} options={STATE_OPTIONS} placeholder={t.calculator.selectState} />
          </Field>

          <Field id="calc-city" label={t.calculator.city} hint={cityHint} className="sm:col-span-2">
            <Select
              id="calc-city"
              value={city}
              onValueChange={setCity}
              options={cityOptions}
              placeholder={cityOptions.length ? t.calculator.selectCity : t.calculator.noCities}
              disabled={cityOptions.length === 0}
              aria-describedby="calc-city-hint"
            />
          </Field>

          <Field id="calc-cartype" label={t.calculator.carType} className="sm:col-span-2">
            <Select id="calc-cartype" value={carType} onValueChange={setCarType} options={carTypeOptions} placeholder={t.calculator.selectCarType} />
          </Field>
        </div>

        <Button type="submit" size="lg" disabled={!isComplete} className="mt-8 h-14 w-full text-base">
          {t.calculator.calculate}
        </Button>
        <p className="mt-3 text-center text-xs text-fg-subtle" aria-live="polite">
          {isComplete ? t.calculator.ready : t.calculator.incomplete}
        </p>
      </motion.form>

      <QuoteSummary result={result} />
    </div>
  );
}
