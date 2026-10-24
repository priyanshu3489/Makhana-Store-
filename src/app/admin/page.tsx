import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account?next=/admin");
  if (user.role !== "ADMIN") redirect("/account");

  return (
    <main className="container" style={{ paddingTop: 36 }}>
      <div className="row" style={{ alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <p className="muted" style={{ marginBottom: 4 }}>MAKHANA STORE · ADMIN</p>
          <h1 style={{ fontSize: 36, margin: 0 }}>Welcome back, {user.name}</h1>
          <p className="muted">Manage orders, inventory, promotions and sales.</p>
        </div>
        <LogoutButton redirectTo="/account?next=/admin" label="Switch account / log out" />
      </div>
      <AdminDashboard />
    </main>
  );
}
