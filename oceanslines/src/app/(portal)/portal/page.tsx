import type { Metadata } from "next";
import { TransportCalculator } from "@/components/calculator/TransportCalculator";
import { PortalPageHeading } from "@/components/portal/PortalPageHeading";

export const metadata: Metadata = { title: "Calculator" };

export default function CalculatorPage() {
  return (
    <>
      <PortalPageHeading eyebrow="Member portal" title="Shipping estimate" description="Price any Copart or IAAI facility to Poti in a few clicks." />
      <TransportCalculator />
    </>
  );
}
