"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        const requestedNext = new URLSearchParams(window.location.search).get("next");
        const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/chat";
        router.replace(safeNext);
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/chat`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace("/chat");
          router.refresh();
        } else {
          setMessage("Akun berhasil dibuat. Cek email lu untuk konfirmasi sebelum login.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07070A] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[48rem] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[130px]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="rounded-[2rem] border border-white/10 bg-[#101016]/90 p-7 shadow-[0_30px_100px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-9">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-violet-200"><Sparkles className="h-5 w-5" /></span>
            <div><p className="text-lg font-semibold tracking-tight">AETHER<span className="text-violet-400">.ai</span></p><p className="text-xs text-white/35">Your AI workspace</p></div>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-.05em]">{mode === "login" ? "Welcome back." : "Create your account."}</h1>
          <p className="mt-2 text-sm leading-6 text-white/45">{mode === "login" ? "Sign in to continue to your workspace." : "Create an account to start using AETHER."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
            <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${mode === "login" ? "bg-violet-500 text-white" : "text-white/45 hover:text-white"}`}>Log in</button>
            <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${mode === "signup" ? "bg-violet-500 text-white" : "text-white/45 hover:text-white"}`}>Sign up</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-white/65">Email address
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60" />
            </label>
            <label className="block text-xs font-medium text-white/65">Password
              <input type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-xs leading-5 text-red-300">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-xs leading-5 text-emerald-300">{message}</p>}
            <button disabled={busy} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8152F3] text-sm font-semibold transition hover:bg-[#925FFF] disabled:cursor-not-allowed disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {busy ? "Please wait..." : mode === "login" ? "Log in to AETHER" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-[11px] leading-5 text-white/30">By continuing, you agree to use AETHER responsibly.</p>
        </div>
      </div>
    </main>
  );
}