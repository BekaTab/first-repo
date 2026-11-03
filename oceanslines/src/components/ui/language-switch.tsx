"use client";

import { LOCALES, LOCALE_LABELS, useLocaleStore, useT } from "@/i18n";
import { cn } from "@/lib/utils";

const TONES = {
  // Landing / login (brand palette)
  brand: {
    wrap: "border-charcoal/10 bg-white/70",
    active: "bg-charcoal text-cashmere",
    idle: "text-slate-blue hover:text-charcoal",
  },
  // Portal (role-themed tokens)
  portal: {
    wrap: "border-line bg-surface-sunken",
    active: "bg-surface-raised text-fg shadow-soft",
    idle: "text-fg-muted hover:text-fg",
  },
} as const;

/** ქა / EN toggle. */
export function LanguageSwitch({ tone = "brand", className }: { tone?: keyof typeof TONES; className?: string }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const s = TONES[tone];

  return (
    <div role="radiogroup" aria-label={t.common.language} className={cn("inline-flex items-center rounded-lg border p-0.5", s.wrap, className)}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l}
            onClick={() => setLocale(l)}
            className={cn(
              "h-7 min-w-[2.25rem] rounded-md px-2 text-xs font-medium transition-colors duration-300",
              active ? s.active : s.idle,
            )}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
