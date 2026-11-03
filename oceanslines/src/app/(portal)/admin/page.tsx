import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const metadata: Metadata = { title: "Users" };

export default function AdminPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AdminDashboard />
    </RequireAuth>
  );
}
