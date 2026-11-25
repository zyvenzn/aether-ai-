"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposerProps {
  value: string;
  isStreaming: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
}

const roundButton =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse text-inverse-ink transition-opacity";

export function Composer({
  value,
  isStreaming,
  onChange,
  onSubmit,
  onStop,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isStreaming;

  // Grow with the text, up to a cap.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className="flex items-end gap-2 rounded-[28px] border border-line bg-composer py-2.5 pl-5 pr-2.5 shadow-[0_2px_12px_rgb(0_0_0/0.06)] focus-within:border-muted"
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
          placeholder="Message Aether"
          aria-label="Message Aether"
          className="max-h-[200px] min-h-6 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 outline-none placeholder:text-muted"
        />

        {isStreaming ? (
          <button
            key="stop"
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className={roundButton}
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </button>
        ) : (
          <button
            key="send"
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={cn(roundButton, !canSend && "opacity-30")}
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </form>

      <p className="px-2 pt-2 text-center text-xs text-muted">
        Replies in this demo are simulated. Aether can make mistakes.
      </p>
    </div>
  );
}
