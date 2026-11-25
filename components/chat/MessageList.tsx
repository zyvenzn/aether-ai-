"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/chat";
import { MessageItem } from "./Message";

interface MessageListProps {
  messages: Message[];
  streamingId: string | null;
  onRegenerate: () => void;
}

export function MessageList({
  messages,
  streamingId,
  onRegenerate,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  // Follow new content unless the reader has scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages[messages.length - 1]?.role === "user") stickRef.current = true;
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      role="log"
      aria-live="off"
      aria-label="Conversation"
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isStreaming={message.id === streamingId}
            isLast={index === messages.length - 1}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>
    </div>
  );
}
