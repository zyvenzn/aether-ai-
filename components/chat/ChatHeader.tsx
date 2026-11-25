"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Menu, PanelLeft, SquarePen } from "lucide-react";
import { MODELS } from "@/lib/chat";

interface ChatHeaderProps {
  model: string;
  desktopOpen: boolean;
  onModelChange: (id: string) => void;
  onOpenMobile: () => void;
  onOpenDesktop: () => void;
  onNewChat: () => void;
}

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink";

interface ModelPickerProps {
  model: string;
  onChange: (id: string) => void;
}

function ModelPicker({ model, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = MODELS.find((m) => m.id === model) ?? MODELS[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-lg font-medium transition-colors hover:bg-hover"
      >
        <span>{current.name}</span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="group"
          aria-label="Choose a model"
          className="absolute left-0 top-full z-20 mt-1 w-72 rounded-2xl border border-line bg-elevated p-1.5 shadow-xl"
        >
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === model}
              onClick={() => {
                onChange(m.id);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-hover"
            >
              <span>
                <span className="block text-sm">{m.name}</span>
                <span className="block text-xs text-muted">{m.note}</span>
              </span>
              {m.id === model && (
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatHeader({
  model,
  desktopOpen,
  onModelChange,
  onOpenMobile,
  onOpenDesktop,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open sidebar"
          className={`${iconButton} md:hidden`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {!desktopOpen && (
          <>
            <button
              type="button"
              onClick={onOpenDesktop}
              aria-label="Open sidebar"
              className={`${iconButton} hidden md:inline-flex`}
            >
              <PanelLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNewChat}
              aria-label="New chat"
              className={`${iconButton} hidden md:inline-flex`}
            >
              <SquarePen className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <ModelPicker model={model} onChange={onModelChange} />
      </div>

      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        className={`${iconButton} md:hidden`}
      >
        <SquarePen className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  );
}
