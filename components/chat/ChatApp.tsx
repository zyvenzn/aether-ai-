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
        const list = (data.models ?? []).filter(
          (id) => id.toLowerCase() !== "auto",
        );
        setModels(list);
        setModel((prev) => {
          if (prev && list.includes(prev)) return prev;
          return data.defaultModel && list.includes(data.defaultModel)
            ? data.defaultModel
            : list[0] ?? "";
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
    <div className="aether-shell flex h-dvh overflow-hidden bg-[#08080B] text-white selection:bg-[#7C3AED] selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "aether-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.08] bg-[#0D0D12] transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <span className="aether-mark flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED] shadow-[0_0_22px_rgba(124,58,237,0.28)]">
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
            className="aether-new-chat flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-3 py-3 text-sm font-semibold transition-colors hover:bg-[#6D28D9]"
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
        <header className="aether-header flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
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

        <div className="aether-chat-scroll flex-1 overflow-y-auto">
          {!active || active.messages.length === 0 ? (
            <div className="aether-empty flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
              <span className="aether-empty-mark mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#7C3AED] shadow-[0_0_38px_rgba(124,58,237,0.25)]">
                <Sparkles className="h-7 w-7" />
              </span>
              <h1 className="aether-title text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Ada yang bisa aku bantu?
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                Tanya apa saja, atau coba salah satu ide di bawah.
              </p>
              <div className="aether-suggestions mt-9 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="aether-suggestion rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-left text-sm leading-6 text-white/70 transition-all hover:border-[#7C3AED]/40 hover:bg-white/[0.05] hover:text-white"
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
                    <div key={m.id} className="aether-user-row flex justify-end">
                      <div className="aether-user-bubble max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-[#7C3AED] px-4 py-3 text-[15px] leading-6 text-white">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="aether-assistant-row flex gap-3">
                    <span className="aether-assistant-mark mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/15 text-[#B794F6]">
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
        <div className="aether-composer-wrap px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3">
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
              className="aether-composer flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-[#101015] p-2.5 focus-within:border-[#7C3AED]/60"
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
