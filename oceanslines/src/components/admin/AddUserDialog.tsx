"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTierOptions } from "@/components/portal/TierPreviewToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useT } from "@/i18n";
import type { IssuedCredentials } from "@/lib/auth/types";
import type { PricingTier } from "@/types/domain";


export function AddUserDialog({ onCreated }: { onCreated: (credentials: IssuedCredentials) => void }) {
  const t = useT();
  const tierOptions = useTierOptions();
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
      setError(t.admin.errors[res.error]);
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
          {t.admin.addUser}
        </Button>
      </DialogTrigger>
      <DialogContent title={t.admin.addUser} description={t.admin.addUserDescription}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="new-name">{t.admin.fullName}</Label>
            <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">{t.admin.email}</Label>
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
              {t.admin.role}
            </p>
            <SegmentedControl aria-label={t.admin.role} size="md" value={role} onChange={setRole} options={tierOptions} />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">{t.common.cancel}</Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !name.trim() || !email.trim()}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {t.admin.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
