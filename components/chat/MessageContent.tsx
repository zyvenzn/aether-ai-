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
