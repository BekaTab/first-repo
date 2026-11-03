"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/i18n";

export default function NotFound() {
  const t = useT();
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-4 text-center">
      <span className="text-[20px]">
        <Logo />
      </span>
      <div>
        <p className="eyebrow text-gold">404</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">{t.notFound.title}</h1>
      </div>
      <Link href="/" className={buttonVariants({ variant: "luxe" })}>
        {t.notFound.back}
      </Link>
    </main>
  );
}
