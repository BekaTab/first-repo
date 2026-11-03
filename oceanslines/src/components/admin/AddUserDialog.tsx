"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TIER_OPTIONS } from "@/components/portal/TierPreviewToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { IssuedCredentials } from "@/lib/auth/types";
import type { PricingTier } from "@/types/domain";

const ERRORS = {
  EMAIL_TAKEN: "An account with this email already exists.",
  INVALID_INPUT: "Enter a name and a valid email address.",
  FORBIDDEN: "Only admins can add users.",
  NOT_FOUND: "Something went wrong. Try again.",
  PROTECTED_USER: "Something went wrong. Try again.",
} as const;

export function AddUserDialog({ onCreated }: { onCreated: (credentials: IssuedCredentials) => void }) {
  const { createUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PricingTier>("MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setRole("MEMBER");
    setError(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await createUser({ name, email, role });
    setPending(false);
    if (!res.ok) {
      setError(ERRORS[res.error]);
      return;
    }
    setOpen(false);
    reset();
    onCreated(res.credentials);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" aria-hidden />
          Add user
        </Button>
      </DialogTrigger>
      <DialogContent title="Add user" description="A secure password is generated for them automatically.">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="new-name">Full name</Label>
            <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-fg-muted">
              Role
            </p>
            <SegmentedControl aria-label="Role" size="md" value={role} onChange={setRole} options={TIER_OPTIONS} />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !name.trim() || !email.trim()}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Create & generate credentials
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
