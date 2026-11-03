"use client";

import { PortalPageHeading } from "@/components/portal/PortalPageHeading";
import { useT } from "@/i18n";
import { TransportCalculator } from "./TransportCalculator";

export function CalculatorPage() {
  const t = useT();
  return (
    <>
      <PortalPageHeading eyebrow={t.calculatorPage.eyebrow} title={t.calculatorPage.title} description={t.calculatorPage.description} />
      <TransportCalculator />
    </>
  );
}
