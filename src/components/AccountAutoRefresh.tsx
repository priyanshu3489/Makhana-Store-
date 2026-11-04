"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountAutoRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <>
      {children}
      <p className="account-refresh-note">Order statuses refresh automatically every minute.</p>
    </>
  );
}
