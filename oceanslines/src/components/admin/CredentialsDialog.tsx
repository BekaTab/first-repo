"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useT } from "@/i18n";
import type { IssuedCredentials } from "@/lib/auth/types";

interface CredentialsDialogProps {
  credentials: (IssuedCredentials & { context: "created" | "reset" }) | null;
  onClose: () => void;
}

/** Shows freshly generated credentials exactly once. */
export function CredentialsDialog({ credentials, onClose }: CredentialsDialogProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(t.admin.clipboard(credentials.email, credentials.password));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the values stay visible for manual copy.
    }
  };

  return (
    <Dialog open={!!credentials} onOpenChange={(open) => !open && onClose()}>
      {credentials ? (
        <DialogContent
          title={credentials.context === "created" ? t.admin.credentialsCreated : t.admin.credentialsReset}
          description={t.admin.credentialsDescription}
        >
          <div className="space-y-3 rounded-xl border border-line bg-surface-sunken p-4 font-mono text-sm">
            <Row label={t.admin.email} value={credentials.email} />
            <Row label={t.admin.password} value={credentials.password} isPassword />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t.admin.done}</Button>
            </DialogClose>
            <Button onClick={copy}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? t.admin.copied : t.admin.copy}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function Row({ label, value, isPassword }: { label: string; value: string; isPassword?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 font-sans text-xs text-fg-muted">
        {isPassword ? <KeyRound className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </span>
      <span className="select-all break-all text-right text-fg">{value}</span>
    </div>
  );
}
