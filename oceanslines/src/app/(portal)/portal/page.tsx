import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator/CalculatorPage";

export const metadata: Metadata = { title: "კალკულატორი" };

export default function Page() {
  return <CalculatorPage />;
}
