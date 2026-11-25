"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MODELS,
  SEED_CONVERSATIONS,
  craftReply,
  makeTitle,
  type Conversation,
  type Message,
} from "@/lib/chat";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { Greeting, Suggestions } from "./EmptyState";
import { MessageList } from "./MessageList";
import { Sidebar } from "./Sidebar";

const uid = () => Math.random().toString(36).slice(2, 10);

/** Ticks of silence before the reply starts, so the pulsing dot is visible. */
const THINKING_TICKS = 15;

export function ChatApp() {
  const [conversations, setConversations] =
    useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    clearTimer();
    setStreamingId(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  /**
   * Replies are simulated. To use a real model, replace `craftReply` with a
   * call to your API and feed the streamed text into `setContent`.
   */
  const streamReply = useCallback(
    (conversationId: string, messageId: string, prompt: string) => {
      const full = craftReply(prompt);

      const setContent = (content: string) =>
        setConversations((list) =>
          list.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m,
                  ),
                },
          ),
        );

      clearTimer();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setContent(full);
        setStreamingId(null);
        return;
      }

      setContent("");
      setStreamingId(messageId);

      let ticks = 0;
      let shown = 0;
      timerRef.current = setInterval(() => {
        if (ticks++ < THINKING_TICKS) return;
        shown = Math.min(full.length, shown + 4);
        setContent(full.slice(0, shown));
        if (shown >= full.length) stopStreaming();
      }, 24);
    },
    [clearTimer, stopStreaming],
  );

  const sendMessage = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || streamingId) return;

      const userMessage: Message = { id: uid(), role: "user", content: text };
      const replyMessage: Message = { id: uid(), role: "assistant", content: "" };

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
      streamReply(conversationId, replyMessage.id, text);
    },
    [activeId, streamingId, streamReply],
  );

  const regenerate = useCallback(() => {
    if (!active || streamingId) return;
    const last = active.messages[active.messages.length - 1];
    const prompt = [...active.messages].reverse().find((m) => m.role === "user");
    if (!last || last.role !== "assistant" || !prompt) return;
    streamReply(active.id, last.id, prompt.content);
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
