"use client";

import { useState } from "react";
import { PortalPageHeading } from "@/components/portal/PortalPageHeading";
import { useT } from "@/i18n";
import type { IssuedCredentials } from "@/lib/auth/types";
import { AddUserDialog } from "./AddUserDialog";
import { CredentialsDialog } from "./CredentialsDialog";
import { UsersTable } from "./UsersTable";

type Issued = IssuedCredentials & { context: "created" | "reset" };

export function AdminDashboard() {
  const t = useT();
  const [issued, setIssued] = useState<Issued | null>(null);

  return (
    <>
      <PortalPageHeading
        eyebrow={t.admin.eyebrow}
        title={t.admin.title}
        description={t.admin.description}
        actions={<AddUserDialog onCreated={(c) => setIssued({ ...c, context: "created" })} />}
      />
      <UsersTable onCredentials={(c) => setIssued({ ...c, context: "reset" })} />
      <CredentialsDialog credentials={issued} onClose={() => setIssued(null)} />
    </>
  );
}
