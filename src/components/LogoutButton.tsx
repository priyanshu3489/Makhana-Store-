"use client";

import { useState } from "react";

export default function LogoutButton({ redirectTo = "/", label = "Log out" }: { redirectTo?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign(redirectTo);
    } catch {
      setBusy(false);
      window.location.assign("/account");
    }
  }
  return <button type="button" className="btn secondary" onClick={logout} disabled={busy}>{busy ? "Signing out…" : label}</button>;
}
