"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { en } from "./en";
import { ka, type Dictionary } from "./ka";

export const LOCALES = ["ka", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Georgian is the default; pages are prerendered in Georgian. */
export const DEFAULT_LOCALE: Locale = "ka";

export const LOCALE_LABELS: Record<Locale, string> = { ka: "ქა", en: "EN" };

const DICTIONARIES: Record<Locale, Dictionary> = { ka, en };

interface LocaleState {
  locale: Locale;
  setLocale(locale: Locale): void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "oceanslines.locale.v1",
      storage: createJSONStorage(() => localStorage),
      // Restored after hydration by <LocaleSync>, so the server HTML (Georgian) always matches first render.
      skipHydration: true,
    },
  ),
);

export const useLocale = (): Locale => useLocaleStore((s) => s.locale);

/** The active dictionary. */
export const useT = (): Dictionary => DICTIONARIES[useLocale()];

export type { Dictionary };
