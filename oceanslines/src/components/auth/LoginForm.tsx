"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS } from "@/lib/auth/mock-db";
import { useT } from "@/i18n";
import type { Role } from "@/types/domain";
import { useAuth } from "./AuthProvider";

const homeFor = (role: Role) => (role === "ADMIN" ? "/admin" : "/portal");

/** Only same-origin, absolute paths — never `//evil.com` or `https://…`. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

const brandField = "border-charcoal/10 bg-white/80 text-charcoal focus-visible:border-gold focus-visible:ring-gold/20";

export function LoginForm() {
  const t = useT();
  const { status, user, login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in (e.g. returning visitor): go straight through.
  useEffect(() => {
    if (status === "authenticated" && user) router.replace(next ?? homeFor(user.role));
  }, [status, user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await login(email, password);
    setPending(false);
    setError(res.ok ? null : "invalid");
    // On success the effect above redirects.
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-blue">
            {t.login.email}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={brandField}
            placeholder="you@company.ge"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-blue">
            {t.login.password}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${brandField} pr-12`}
              aria-describedby={error ? "login-error" : undefined}
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-blue/70 transition-colors hover:text-charcoal"
              aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              id="login-error"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-danger"
            >
              {t.login.error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={pending || !email || !password}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {t.login.submit}
        </Button>
      </form>

      <div className="mt-10 border-t border-charcoal/[0.07] pt-6">
        <p className="eyebrow text-slate-blue/80">{t.login.demo}</p>
        <ul className="mt-4 grid gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError(null);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm transition-colors duration-300 hover:border-gold/40 hover:bg-white/60"
              >
                <span className="truncate text-charcoal">{acc.email}</span>
                <span className="shrink-0 text-xs text-gold">{t.roles[acc.role]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
