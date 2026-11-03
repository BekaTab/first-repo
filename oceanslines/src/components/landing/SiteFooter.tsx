"use client";

import { Logo } from "@/components/brand/Logo";
import { useT } from "@/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { PortalButton } from "./PortalButton";

export function SiteFooter() {
  const t = useT();
  return (
    <footer id="contact" className="scroll-mt-24">
      <div className="container">
        <Reveal className="relative overflow-hidden rounded-2xl bg-charcoal px-8 py-14 text-cashmere sm:px-14 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgb(var(--gold)/0.22),transparent_70%)]"
          />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-gold">{t.footer.eyebrow}</p>
              <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight sm:text-4xl">
                {t.footer.title}
              </h2>
              <p className="mt-4 max-w-md text-cashmere/70">
                {t.footer.body}
              </p>
            </div>
            <PortalButton size="lg" className="self-start bg-cashmere text-charcoal hover:bg-white md:self-auto" />
          </div>
        </Reveal>

        <div className="flex flex-col gap-6 py-12 text-sm text-slate-blue sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[17px]">
            <Logo />
          </span>
          <div className="flex flex-col gap-1 sm:items-end">
            <a href="https://oceanslines.ge" className="transition-colors hover:text-charcoal">
              oceanslines.ge
            </a>
            <span>© {new Date().getFullYear()} Oceans Lines. {t.footer.rights}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
