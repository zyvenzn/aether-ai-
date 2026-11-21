#!/usr/bin/env bash
# Mengubah landing page aether-ai- jadi AI chat yang terhubung ke Re:Link Gateway.
# Jalankan dari root repo:   bash apply-chat.sh
# Atau kasih path repo:      bash apply-chat.sh /path/ke/aether-ai-
set -euo pipefail

ROOT="${1:-.}"

if [ ! -f "$ROOT/package.json" ] || ! grep -q '"name": "aether-ai"' "$ROOT/package.json"; then
  echo "Ini bukan root repo aether-ai-. Masuk ke folder repo dulu, atau kasih path-nya."
  exit 1
fi

write() {
  mkdir -p "$(dirname "$ROOT/$1")"
  cat > "$ROOT/$1"
  echo "  ✓ $1"
}

echo "Menulis file..."

# ---------------------------------------------------------------------------
write lib/relink.ts <<'EOF'
// Konfigurasi Re:Link Gateway (OpenAI-compatible). Dipakai di server saja.
export const RELINK_BASE_URL = (
  process.env.RELINK_BASE_URL || "https://api.relink-gateway.biz.id/v1"
).replace(/\/+$/, "");

export const SYSTEM_PROMPT =
  "Kamu adalah Aether, asisten AI yang ramah, jelas, dan to the point. " +
  "Jawab dalam bahasa yang sama dengan pengguna. Pakai markdown seperlunya " +
  "dan taruh kode di dalam blok kode.";

export function getApiKey(): string | undefined {
  return process.env.RELINK_API_KEY || undefined;
}
EOF

# ---------------------------------------------------------------------------
write app/api/models/route.ts <<'EOF'
import { RELINK_BASE_URL, getApiKey } from "@/lib/relink";

// Daftar model yang tersedia di gateway (untuk dropdown di UI).
export async function GET() {
  const envModel = process.env.RELINK_MODEL || null;
  const fallback = {
    models: envModel ? [envModel] : [],
    defaultModel: envModel,
  };

  const apiKey = getApiKey();
  if (!apiKey) {
    return Response.json({ ...fallback, error: "RELINK_API_KEY belum diset." });
  }

  try {
    const res = await fetch(`${RELINK_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);

    const data = (await res.json()) as { data?: { id?: unknown }[] };
    const ids = (data.data ?? [])
      .map((m) => m.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .sort();

    const models = envModel && !ids.includes(envModel) ? [envModel, ...ids] : ids;
    return Response.json({
      models,
      defaultModel: envModel ?? models[0] ?? null,
    });
  } catch {
    return Response.json({ ...fallback, error: "Gagal mengambil daftar model." });
  }
}
EOF

# ---------------------------------------------------------------------------
write app/api/chat/route.ts <<'EOF'
import { RELINK_BASE_URL, SYSTEM_PROMPT, getApiKey } from "@/lib/relink";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessage = { role?: string; content?: unknown };

const MAX_MESSAGES = 40;
const MAX_CHARS = 20000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return jsonError("RELINK_API_KEY belum diset di environment server.", 500);
  }

  let body: { messages?: IncomingMessage[]; model?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Body request bukan JSON yang valid.", 400);
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0) {
    return jsonError("Pesan kosong.", 400);
  }

  const requestedModel =
    typeof body.model === "string" ? body.model.trim() : "";
  const model = requestedModel || process.env.RELINK_MODEL;
  if (!model) {
    return jsonError("Model belum dipilih.", 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${RELINK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: req.signal,
    });
  } catch {
    return jsonError(
      "Tidak bisa menghubungi Re:Link Gateway. Coba lagi sebentar.",
      502,
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    const status =
      upstream.status === 401 || upstream.status === 403
        ? 401
        : upstream.status === 429
          ? 429
          : 502;
    const hint =
      status === 401
        ? "API key ditolak gateway."
        : status === 429
          ? "Kena rate limit atau kuota habis."
          : `Gateway error (${upstream.status}).`;
    return jsonError(`${hint} ${detail.slice(0, 200)}`.trim(), status);
  }

  // Ubah stream SSE (format OpenAI) jadi stream teks polos.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let wrote = false;
          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: unknown } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (typeof piece === "string" && piece) {
                controller.enqueue(encoder.encode(piece));
                wrote = true;
              }
            } catch {
              // baris bukan JSON, abaikan
            }
          }

          if (wrote) return;
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
EOF

# ---------------------------------------------------------------------------
write app/chat/page.tsx <<'EOF'
import type { Metadata } from "next";
import ChatApp from "@/components/chat/ChatApp";

export const metadata: Metadata = {
  title: "Chat — AETHER.ai",
  description: "Ngobrol dengan asisten AI AETHER.",
};

export default function ChatPage() {
  return <ChatApp />;
}
EOF

# ---------------------------------------------------------------------------
write components/chat/MessageContent.tsx <<'EOF'
"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

type Block =
  | { type: "code"; lang: string; text: string }
  | { type: "text"; text: string };

// Pisahkan teks biasa dan blok kode ``` (blok yang belum ditutup saat streaming tetap dianggap kode).
function splitBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const fence = /```([\w+-]*)\n?([\s\S]*?)(?:```|$)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(src)) !== null) {
    if (match.index > last) {
      blocks.push({ type: "text", text: src.slice(last, match.index) });
    }
    blocks.push({
      type: "code",
      lang: match[1],
      text: match[2].replace(/\n$/, ""),
    });
    last = match.index + match[0].length;
  }

  if (last < src.length) {
    blocks.push({ type: "text", text: src.slice(last) });
  }
  return blocks;
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard diblokir browser, abaikan
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-black/60">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[11px] text-white/50">
        <span className="font-mono">{lang || "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 transition-colors hover:text-white"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed text-white/90">
        <code className="font-mono">{text}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, i) => {
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#D8B4FE]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function TextBlock({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((p, i) => {
        const lines = p.split("\n");

        const heading = /^#{1,3}\s+(.*)$/.exec(lines[0]);
        if (heading) {
          return (
            <React.Fragment key={i}>
              <p className="mb-1 mt-4 font-semibold text-white">
                {renderInline(heading[1])}
              </p>
              {lines.length > 1 && <TextBlock text={lines.slice(1).join("\n")} />}
            </React.Fragment>
          );
        }

        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol
              key={i}
              start={parseInt(lines[0], 10) || 1}
              className="my-2 list-decimal space-y-1 pl-5"
            >
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="my-2 whitespace-pre-wrap">
            {renderInline(p)}
          </p>
        );
      })}
    </>
  );
}

export default function MessageContent({ content }: { content: string }) {
  const blocks = splitBlocks(content);
  return (
    <div className="break-words text-[15px] leading-7 text-white/85">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} lang={b.lang} text={b.text} />
        ) : (
          <TextBlock key={i} text={b.text} />
        ),
      )}
    </div>
  );
}
EOF

# ---------------------------------------------------------------------------
write components/chat/ChatApp.tsx <<'EOF'
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowUp, Menu, Plus, Sparkles, Square, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageContent from "./MessageContent";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const STORAGE_CHATS = "aether.chats.v1";
const STORAGE_MODEL = "aether.model.v1";
const MAX_SAVED_CHATS = 50;

const SUGGESTIONS = [
  "Jelaskan cara kerja blockchain dengan bahasa sederhana",
  "Bantu aku bikin caption jualan yang menarik",
  "Tulis fungsi JavaScript untuk debounce",
  "Kasih ide konten YouTube untuk pemula",
];

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Muat riwayat & model terakhir dari browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CHATS);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        if (Array.isArray(parsed)) setConversations(parsed);
      }
      const savedModel = localStorage.getItem(STORAGE_MODEL);
      if (savedModel) setModel(savedModel);
    } catch {
      // data rusak / diblokir, mulai dari kosong
    }
    setLoaded(true);
  }, []);

  // Simpan riwayat (tunggu streaming selesai supaya tidak nulis tiap token)
  useEffect(() => {
    if (!loaded || isStreaming) return;
    try {
      localStorage.setItem(
        STORAGE_CHATS,
        JSON.stringify(conversations.slice(0, MAX_SAVED_CHATS)),
      );
    } catch {
      // penyimpanan penuh / diblokir
    }
  }, [conversations, loaded, isStreaming]);

  useEffect(() => {
    if (!loaded || !model) return;
    try {
      localStorage.setItem(STORAGE_MODEL, model);
    } catch {
      // abaikan
    }
  }, [model, loaded]);

  // Ambil daftar model dari gateway
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => r.json())
      .then((data: { models?: string[]; defaultModel?: string | null }) => {
        if (cancelled) return;
        const list = data.models ?? [];
        setModels(list);
        setModel((prev) => {
          if (list.length === 0) return prev;
          if (prev && list.includes(prev)) return prev;
          return data.defaultModel && list.includes(data.defaultModel)
            ? data.defaultModel
            : list[0];
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  // Auto-scroll ke bawah
  const lastContent = active?.messages[active.messages.length - 1]?.content;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [active?.messages.length, lastContent]);

  // Textarea membesar otomatis
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const updateMessage = useCallback(
    (convId: string, messageId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                updatedAt: Date.now(),
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, content } : m,
                ),
              },
        ),
      );
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isStreaming) return;
      if (!model.trim()) {
        setError("Pilih atau isi nama model dulu.");
        return;
      }

      setError(null);
      setInput("");

      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const botMsg: ChatMessage = { id: uid(), role: "assistant", content: "" };
      const now = Date.now();

      const existing = conversations.find((c) => c.id === activeId);
      const targetId = existing ? existing.id : uid();
      const history = existing ? [...existing.messages, userMsg] : [userMsg];

      if (existing) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, updatedAt: now, messages: [...history, botMsg] }
              : c,
          ),
        );
      } else {
        const created: Conversation = {
          id: targetId,
          title: content.length > 40 ? `${content.slice(0, 40)}…` : content,
          messages: [userMsg, botMsg],
          updatedAt: now,
        };
        setConversations((prev) => [created, ...prev]);
        setActiveId(targetId);
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model.trim(),
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? `Permintaan gagal (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          updateMessage(targetId, botMsg.id, acc);
        }

        if (!acc.trim()) {
          throw new Error("Model tidak mengembalikan jawaban. Coba model lain.");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        }
        // buang bubble kosong kalau tidak ada jawaban sama sekali
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: c.messages.filter(
                    (m) => !(m.id === botMsg.id && m.content === ""),
                  ),
                }
              : c,
          ),
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeId, conversations, isStreaming, model, updateMessage],
  );

  const newChat = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setError(null);
    setSidebarOpen(false);
    textareaRef.current?.focus();
  };

  const selectChat = (id: string) => {
    abortRef.current?.abort();
    setActiveId(id);
    setError(null);
    setSidebarOpen(false);
  };

  const deleteChat = (id: string) => {
    if (id === activeId) {
      abortRef.current?.abort();
      setActiveId(null);
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    // Di HP, Enter = baris baru. Di desktop, Enter = kirim.
    if (window.matchMedia("(pointer: fine)").matches) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#050505] text-white selection:bg-[#7C3AED] selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.08] bg-[#0A0A0A] transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              AETHER<span className="text-[#A855F7]">.ai</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#6D28D9]"
          >
            <Plus className="h-4 w-4" />
            Chat baru
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {sorted.length === 0 && (
            <p className="px-2 text-xs text-white/40">Belum ada riwayat chat.</p>
          )}
          {sorted.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg pr-1",
                c.id === activeId ? "bg-white/[0.08]" : "hover:bg-white/[0.04]",
              )}
            >
              <button
                type="button"
                onClick={() => selectChat(c.id)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-white/80"
              >
                {c.title}
              </button>
              <button
                type="button"
                aria-label="Hapus chat"
                onClick={() => deleteChat(c.id)}
                className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Area chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setSidebarOpen(true)}
            className="text-white/70 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-white/80">
            {active?.title ?? "Chat baru"}
          </h2>

          {models.length > 0 ? (
            <select
              aria-label="Model"
              value={model}
              disabled={isStreaming}
              onChange={(e) => setModel(e.target.value)}
              className="max-w-[9.5rem] truncate rounded-lg border border-white/10 bg-[#0A0A0A] px-2 py-1.5 text-xs text-white/80 outline-none focus:border-[#7C3AED] sm:max-w-[16rem]"
            >
              {models.map((m) => (
                <option key={m} value={m} className="bg-[#0A0A0A]">
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <input
              aria-label="Model"
              value={model}
              disabled={isStreaming}
              onChange={(e) => setModel(e.target.value)}
              placeholder="nama model"
              className="w-32 rounded-lg border border-white/10 bg-[#0A0A0A] px-2 py-1.5 text-xs text-white/80 outline-none placeholder:text-white/30 focus:border-[#7C3AED] sm:w-48"
            />
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {!active || active.messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C3AED] shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                <Sparkles className="h-7 w-7" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ada yang bisa aku bantu?
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Tanya apa saja, atau coba salah satu ide di bawah.
              </p>
              <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/80 transition-colors hover:border-[#7C3AED]/50 hover:bg-white/[0.06]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
              {active.messages.map((m, idx) => {
                const isLast = idx === active.messages.length - 1;

                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-[#7C3AED] px-4 py-2.5 text-[15px] leading-6 text-white">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED]/20 text-[#A855F7]">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      {m.content ? (
                        <MessageContent content={m.content} />
                      ) : isStreaming && isLast ? (
                        <span className="inline-flex gap-1 pt-2">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="h-2 w-2 animate-pulse rounded-full bg-white/40"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <div className="mx-auto w-full max-w-3xl">
            {error && (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <span className="min-w-0 flex-1 break-words">{error}</span>
                <button
                  type="button"
                  aria-label="Tutup pesan error"
                  onClick={() => setError(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0A0A0A] p-2 focus-within:border-[#7C3AED]/60"
            >
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Tulis pesan..."
                className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-white outline-none placeholder:text-white/30"
              />
              {isStreaming ? (
                <button
                  type="button"
                  aria-label="Hentikan"
                  onClick={stop}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Kirim"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              )}
            </form>

            <p className="mt-2 text-center text-[11px] text-white/30">
              AI bisa salah. Cek ulang info penting.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
EOF

# ---------------------------------------------------------------------------
# File yang sudah ada di repo: ditimpa dengan versi baru
write app/layout.tsx <<'EOF'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AETHER.ai — Asisten AI",
  description: "Asisten AI untuk ngobrol, nulis, coding, dan bikin ide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
EOF

write app/globals.css <<'EOF'
@import "tailwindcss";

:root {
  color-scheme: dark;
  --background: #050505;
  --foreground: #ededed;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}
EOF

write components/layout/Navbar.tsx <<'EOF'
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
      <Container className="max-w-6xl">
        <nav className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-3 px-6 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>AETHER<span className="text-[#A855F7]">.ai</span></span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#showcase" className="hover:text-white transition-colors">Workflows</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#pricing" className="text-xs font-medium text-white/80 hover:text-white">
              Sign In
            </a>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:bg-[#6D28D9]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/70 hover:text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/95 p-6 backdrop-blur-xl md:hidden space-y-4">
            <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Features</a>
            <a href="#showcase" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Workflows</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Pricing</a>
            <a href="#faq" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">FAQ</a>
            <hr className="border-white/[0.08]" />
            <Link
              href="/chat"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-3 text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;
EOF

write components/hero/HeroContent.tsx <<'EOF'
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Command } from "lucide-react";

export const HeroContent = () => {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md hover:border-[#7C3AED]/40 transition-colors cursor-pointer"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
        <span>Introducing AETHER Neural Engine 3.0</span>
        <span className="ml-1 text-white/40">|</span>
        <span className="text-[#A855F7] hover:underline flex items-center gap-0.5">
          Read docs <ArrowRight className="h-3 w-3 inline" />
        </span>
      </motion.div>

      {/* Main Editorial Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-7xl leading-[1.08]"
      >
        Intelligence designed for <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-white via-white/90 to-[#A855F7] bg-clip-text text-transparent">
          modern engineering teams.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed font-normal"
      >
        Automate workflows, analyze real-time telemetry, and deploy autonomous AI agents with zero latency. Built for teams who refuse to compromise on quality.
      </motion.p>

      {/* Action CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
      >
        <Link
          href="/chat"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] active:scale-[0.98]"
        >
          <span>Start Chatting</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white/90 transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] backdrop-blur-md"
        >
          <Command className="h-4 w-4 text-white/50" />
          <span>Quick Demo</span>
          <kbd className="ml-1 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">⌘K</kbd>
        </button>
      </motion.div>
    </div>
  );
};

export default HeroContent;
EOF

write components/sections/CTASection.tsx <<'EOF'
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import GlowEffect from "@/components/shared/GlowEffect";
import Badge from "@/components/shared/Badge";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";

const MotionLink = motion.create(Link);

export const CTASection = () => {
  return (
    <section className="relative w-full bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-white/[0.08]">
      <GlowEffect position="center" className="opacity-60" />

      <Container>
        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0A0A0A] p-8 sm:p-16 text-center shadow-[0_0_50px_rgba(124,58,237,0.1)]">
          {/* Background Micro Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <Badge pulse variant="primary" className="mb-6">
              READY FOR PRODUCTION
            </Badge>

            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Scale your AI infrastructure with <span className="text-[#A855F7]">zero compromises</span>.
            </h2>

            <p className="mt-4 max-w-xl text-base text-white/60">
              Join thousands of forward-thinking engineering teams deploying autonomous agents on AETHER today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <MotionLink
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all hover:bg-[#6D28D9] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)]"
              >
                <span>Start Chatting</span>
                <ArrowRight className="h-4 w-4" />
              </MotionLink>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Terminal className="h-4 w-4 text-white/60" />
                <span>Read Architecture Docs</span>
              </motion.a>
            </div>

            <p className="mt-6 text-xs text-white/40 font-mono">
              14-day free trial • No credit card required • SOC2 Type II Certified
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
EOF

# ---------------------------------------------------------------------------
write .env.example <<'EOF'
# Salin jadi .env.local (lokal) atau isi di Vercel -> Settings -> Environment Variables.
# JANGAN commit API key asli.

# API key dari dashboard Re:Link Gateway
RELINK_API_KEY=isi_api_key_kamu_di_sini

# Base URL gateway (OpenAI-compatible)
RELINK_BASE_URL=https://api.relink-gateway.biz.id/v1

# Opsional: model default. Kalau kosong, pilih dari dropdown di halaman /chat.
RELINK_MODEL=
EOF

write README.md <<'EOF'
# AETHER.ai

Landing page + chat AI (Next.js) yang terhubung ke Re:Link Gateway.

## Jalankan

```bash
npm install
cp .env.example .env.local   # lalu isi RELINK_API_KEY
npm run dev
```

- `/` — landing page
- `/chat` — chat AI (riwayat disimpan di browser, jawaban streaming)

## Environment

| Variabel | Fungsi |
| --- | --- |
| `RELINK_API_KEY` | API key dari dashboard Re:Link Gateway (wajib, hanya di server) |
| `RELINK_BASE_URL` | Base URL gateway, default `https://api.relink-gateway.biz.id/v1` |
| `RELINK_MODEL` | Model default (opsional, bisa dipilih lewat dropdown) |

Di Vercel, isi variabel yang sama di Settings → Environment Variables, lalu redeploy.

## Struktur singkat

- `app/api/chat/route.ts` — proxy streaming ke `/chat/completions`
- `app/api/models/route.ts` — daftar model dari gateway
- `components/chat/` — UI chat
- `lib/relink.ts` — konfigurasi gateway
EOF

echo ""
echo "Selesai. Langkah berikutnya:"
echo "  1. cp .env.example .env.local   (isi RELINK_API_KEY dengan key kamu)"
echo "  2. npm run dev                  (buka /chat)"
echo "  3. Di Vercel: tambah RELINK_API_KEY di Environment Variables, lalu redeploy"
