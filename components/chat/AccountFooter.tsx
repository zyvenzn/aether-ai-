"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AccountFooter() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-line px-4 py-3">
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-inverse text-sm font-medium text-inverse-ink"
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm">{email ?? "Memuat…"}</p>
        <p className="text-xs text-muted">Free plan</p>
      </div>
      <button
        type="button"
        onClick={logout}
        aria-label="Logout"
        title="Logout"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
