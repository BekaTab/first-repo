"use client";

import { useState } from "react";
import { PortalPageHeading } from "@/components/portal/PortalPageHeading";
import type { IssuedCredentials } from "@/lib/auth/types";
import { AddUserDialog } from "./AddUserDialog";
import { CredentialsDialog } from "./CredentialsDialog";
import { UsersTable } from "./UsersTable";

type Issued = IssuedCredentials & { context: "created" | "reset" };

export function AdminDashboard() {
  const [issued, setIssued] = useState<Issued | null>(null);

  return (
    <>
      <PortalPageHeading
        eyebrow="Administration"
        title="Users"
        description="Add members, issue credentials, and move people between Member and Super Member."
        actions={<AddUserDialog onCreated={(c) => setIssued({ ...c, context: "created" })} />}
      />
      <UsersTable onCredentials={(c) => setIssued({ ...c, context: "reset" })} />
      <CredentialsDialog credentials={issued} onClose={() => setIssued(null)} />
    </>
  );
}
