"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useT } from "@/i18n";
import { LoginForm } from "./LoginForm";

export function LoginScreen() {
  const t = useT();
  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_50%_0%,rgb(var(--gold)/0.18),transparent_70%)]"
      />
      <LanguageSwitch className="absolute right-4 top-4 sm:right-6 sm:top-6" />

      <Reveal className="w-full max-w-[420px]">
        <Link href="/" aria-label={t.common.homeAria} className="mx-auto block w-fit text-[20px] sm:text-[22px]">
          <Logo variant="full" />
        </Link>

        <div className="glass mt-10 rounded-2xl p-7 sm:p-9">
          <h1 className="font-serif text-3xl text-charcoal">{t.login.title}</h1>
          <p className="mt-2 text-sm text-slate-blue">{t.login.subtitle}</p>
          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-blue">
          <Link href="/" className="transition-colors hover:text-charcoal">
            {t.login.back}
          </Link>
        </p>
      </Reveal>
    </main>
  );
}
