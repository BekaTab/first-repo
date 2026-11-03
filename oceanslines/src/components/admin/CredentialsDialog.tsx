"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { IssuedCredentials } from "@/lib/auth/types";

interface CredentialsDialogProps {
  credentials: (IssuedCredentials & { context: "created" | "reset" }) | null;
  onClose: () => void;
}

/** Shows freshly generated credentials exactly once. */
export function CredentialsDialog({ credentials, onClose }: CredentialsDialogProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `Oceans Lines portal\nhttps://oceanslines.ge/login\nEmail: ${credentials.email}\nPassword: ${credentials.password}`,
      );
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
          title={credentials.context === "created" ? "Account created" : "Password reset"}
          description="Send these to the user now. The password is shown only once and is not stored in readable form."
        >
          <div className="space-y-3 rounded-xl border border-line bg-surface-sunken p-4 font-mono text-sm">
            <Row label="Email" value={credentials.email} />
            <Row label="Password" value={credentials.password} />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Done</Button>
            </DialogClose>
            <Button onClick={copy}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy credentials"}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 font-sans text-xs text-fg-muted">
        {label === "Password" ? <KeyRound className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </span>
      <span className="select-all break-all text-right text-fg">{value}</span>
    </div>
  );
}
