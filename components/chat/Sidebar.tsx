"use client";

import { useState } from "react";
import { PanelLeft, Search, SquarePen, Trash2, X } from "lucide-react";
import { HISTORY_GROUPS, type Conversation } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { AetherMark } from "./AetherMark";
import { AccountFooter } from "./AccountFooter";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  desktopOpen: boolean;
  mobileOpen: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCollapseDesktop: () => void;
  onCloseMobile: () => void;
}

const rowButton =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-hover";

export function Sidebar({
  conversations,
  activeId,
  desktopOpen,
  mobileOpen,
  onNewChat,
  onSelect,
  onDelete,
  onCollapseDesktop,
  onCloseMobile,
}: SidebarProps) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? conversations.filter((c) => c.title.toLowerCase().includes(q))
    : conversations;

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-sidebar md:static md:z-auto md:w-[260px] md:shrink-0",
        "transition-[transform,margin-left,visibility] duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full max-md:invisible",
        desktopOpen
          ? "md:translate-x-0"
          : "md:invisible md:-ml-[260px] md:translate-x-0",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <button
          type="button"
          onClick={onNewChat}
          aria-label="Aether, start a new chat"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-hover"
        >
          <AetherMark className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={onCollapseDesktop}
          aria-label="Close sidebar"
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink md:inline-flex"
        >
          <PanelLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink md:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2">
        <button type="button" onClick={onNewChat} className={rowButton}>
          <SquarePen className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>New chat</span>
        </button>

        <label className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-hover focus-within:outline-2 focus-within:outline-ink">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
          />
        </label>

        <nav aria-label="Chat history" className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2">
          {visible.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">No chats found.</p>
          )}

          {HISTORY_GROUPS.map((group) => {
            const items = visible.filter((c) => c.group === group);
            if (items.length === 0) return null;

            return (
              <section key={group}>
                <h2 className="px-3 pb-1 pt-4 text-xs font-medium text-muted">
                  {group}
                </h2>
                <ul>
                  {items.map((c) => (
                    <li key={c.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        aria-current={c.id === activeId ? "true" : undefined}
                        className={cn(
                          "w-full truncate rounded-lg py-2 pl-3 pr-10 text-left text-sm transition-colors hover:bg-hover",
                          c.id === activeId && "bg-hover",
                        )}
                      >
                        {c.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
                        aria-label={`Delete chat: ${c.title}`}
                        className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
      </div>

      <AccountFooter />
    </aside>
  );
}
