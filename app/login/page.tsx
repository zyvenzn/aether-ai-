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

  async function handleGoogle() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login Google gagal. Coba lagi.");
      setBusy(false);
    }
  }

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
        const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
        router.replace(safeNext);
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace("/");
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

          <button type="button" onClick={handleGoogle} disabled={busy} className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white text-sm font-semibold text-[#1f1f1f] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.74l4.01-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.26 6.63l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"/></svg>
            Lanjutkan dengan Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/30">
            <span className="h-px flex-1 bg-white/10" />atau pakai email<span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
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