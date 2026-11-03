import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Portal Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_50%_0%,rgb(var(--gold)/0.18),transparent_70%)]"
      />
      <Reveal className="w-full max-w-[420px]">
        <Link href="/" aria-label="Oceans Lines — home" className="mx-auto block w-fit text-[22px]">
          <Logo variant="full" />
        </Link>

        <div className="glass mt-10 rounded-2xl p-7 sm:p-9">
          <h1 className="font-serif text-3xl text-charcoal">Member portal</h1>
          <p className="mt-2 text-sm text-slate-blue">Sign in with the credentials your Oceans Lines manager sent you.</p>
          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-blue">
          <Link href="/" className="transition-colors hover:text-charcoal">
            ← Back to oceanslines.ge
          </Link>
        </p>
      </Reveal>
    </main>
  );
}
