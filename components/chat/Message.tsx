"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Message } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { RichText } from "./RichText";

interface MessageItemProps {
  message: Message;
  isStreaming: boolean;
  isLast: boolean;
  onRegenerate: () => void;
}

interface ActionProps {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}

function Action({ label, onClick, pressed, children }: ActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink"
    >
      {children}
    </button>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-bubble px-5 py-2.5 text-base leading-7 sm:max-w-[70%]">
        {content}
      </p>
    </div>
  );
}

function AssistantMessage({
  message,
  isStreaming,
  isLast,
  onRegenerate,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked.
    }
  }

  return (
    <div>
      {message.content && <RichText content={message.content} />}

      {isStreaming && (
        <div className={cn(message.content && "mt-3")}>
          <span className="stream-dot" aria-hidden="true" />
        </div>
      )}

      {!isStreaming && message.content && (
        <div className="-ml-2 mt-2 flex items-center gap-0.5">
          <Action label={copied ? "Copied" : "Copy"} onClick={copy}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Action>
          <Action
            label="Good response"
            pressed={vote === "up"}
            onClick={() => setVote(vote === "up" ? null : "up")}
          >
            <ThumbsUp
              className={cn("h-4 w-4", vote === "up" && "fill-current")}
              aria-hidden="true"
            />
          </Action>
          <Action
            label="Bad response"
            pressed={vote === "down"}
            onClick={() => setVote(vote === "down" ? null : "down")}
          >
            <ThumbsDown
              className={cn("h-4 w-4", vote === "down" && "fill-current")}
              aria-hidden="true"
            />
          </Action>
          {isLast && (
            <Action label="Regenerate" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Action>
          )}
        </div>
      )}
    </div>
  );
}

export function MessageItem(props: MessageItemProps) {
  if (props.message.role === "user") {
    return <UserMessage content={props.message.content} />;
  }
  return <AssistantMessage {...props} />;
}
