"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MODELS,
  SEED_CONVERSATIONS,
  makeTitle,
  type Conversation,
  type Message,
} from "@/lib/chat";
import { readDeltas } from "@/lib/stream";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { Greeting, Suggestions } from "./EmptyState";
import { MessageList } from "./MessageList";
import { Sidebar } from "./Sidebar";

const uid = () => Math.random().toString(36).slice(2, 10);

type HistoryItem = Pick<Message, "role" | "content">;

/** What gets sent to the model: real turns only, no empty or error messages. */
const toHistory = (messages: Message[]): HistoryItem[] =>
  messages
    .filter((m) => !m.error && m.content)
    .map(({ role, content }) => ({ role, content }));

const GENERIC_ERROR = "Something went wrong. Try again.";

export function ChatApp() {
  const [conversations, setConversations] =
    useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingId(null);
  }, []);

  useEffect(() => stopStreaming, [stopStreaming]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  /** Streams a reply from /api/chat into the given assistant message. */
  const streamReply = useCallback(
    async (conversationId: string, messageId: string, history: HistoryItem[]) => {
      const update = (patch: Partial<Message>) =>
        setConversations((list) =>
          list.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m,
                  ),
                },
          ),
        );

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      update({ content: "", error: false });
      setStreamingId(messageId);

      let text = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? GENERIC_ERROR);
        }

        for await (const delta of readDeltas(res.body)) {
          text += delta;
          update({ content: text });
        }

        if (!text) throw new Error("The model returned an empty reply.");
      } catch (err) {
        if (controller.signal.aborted) {
          if (!text) {
            update({ content: "Stopped before a reply was generated.", error: true });
          }
          return;
        }
        update({
          content: err instanceof Error ? err.message : GENERIC_ERROR,
          error: true,
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setStreamingId(null);
        }
      }
    },
    [model],
  );

  const sendMessage = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || streamingId) return;

      const userMessage: Message = { id: uid(), role: "user", content: text };
      const replyMessage: Message = { id: uid(), role: "assistant", content: "" };
      const history = toHistory([...(active?.messages ?? []), userMessage]);

      let conversationId = activeId;
      if (conversationId === null) {
        conversationId = uid();
        const created: Conversation = {
          id: conversationId,
          title: makeTitle(text),
          group: "Today",
          messages: [userMessage, replyMessage],
        };
        setConversations((list) => [created, ...list]);
        setActiveId(conversationId);
      } else {
        const id = conversationId;
        setConversations((list) =>
          list.map((c) =>
            c.id === id
              ? { ...c, messages: [...c.messages, userMessage, replyMessage] }
              : c,
          ),
        );
      }

      setDraft("");
      void streamReply(conversationId, replyMessage.id, history);
    },
    [active, activeId, streamingId, streamReply],
  );

  /** Regenerates the last reply, or retries after an error. */
  const regenerate = useCallback(() => {
    if (!active || streamingId) return;
    const last = active.messages[active.messages.length - 1];
    if (!last || last.role !== "assistant") return;

    const history = toHistory(active.messages.slice(0, -1));
    if (history.length === 0) return;
    void streamReply(active.id, last.id, history);
  }, [active, streamingId, streamReply]);

  const newChat = useCallback(() => {
    stopStreaming();
    setActiveId(null);
    setDraft("");
    setMobileOpen(false);
  }, [stopStreaming]);

  const selectConversation = useCallback(
    (id: string) => {
      stopStreaming();
      setActiveId(id);
      setMobileOpen(false);
    },
    [stopStreaming],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      if (id === activeId) {
        stopStreaming();
        setActiveId(null);
      }
      setConversations((list) => list.filter((c) => c.id !== id));
    },
    [activeId, stopStreaming],
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-ink">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        onNewChat={newChat}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onCollapseDesktop={() => setDesktopOpen(false)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          model={model}
          desktopOpen={desktopOpen}
          onModelChange={setModel}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenDesktop={() => setDesktopOpen(true)}
          onNewChat={newChat}
        />

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            isEmpty && "justify-center pb-16",
          )}
        >
          {isEmpty ? (
            <Greeting />
          ) : (
            <MessageList
              key={activeId}
              messages={messages}
              streamingId={streamingId}
              onRegenerate={regenerate}
            />
          )}

          <Composer
            value={draft}
            isStreaming={streamingId !== null}
            onChange={setDraft}
            onSubmit={() => sendMessage(draft)}
            onStop={stopStreaming}
          />

          {isEmpty && <Suggestions onPick={sendMessage} />}
        </div>

        <p role="status" className="sr-only">
          {streamingId ? "Aether is responding" : ""}
        </p>
      </main>
    </div>
  );
}
