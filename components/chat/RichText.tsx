import { Fragment } from "react";
import { CodeBlock } from "./CodeBlock";

type Block =
  | { type: "text"; text: string }
  | { type: "code"; lang: string; code: string };

/** Splits a reply into prose and fenced code. An unclosed fence (mid-stream) counts as code. */
function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let inCode = false;
  let lang = "";

  const flushText = () => {
    const text = buffer.join("\n").trim();
    if (text) blocks.push({ type: "text", text });
    buffer = [];
  };

  for (const line of source.split("\n")) {
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (inCode) {
        blocks.push({ type: "code", lang, code: buffer.join("\n") });
        buffer = [];
        inCode = false;
      } else {
        flushText();
        inCode = true;
        lang = fence[1];
      }
      continue;
    }
    buffer.push(line);
  }

  if (inCode) blocks.push({ type: "code", lang, code: buffer.join("\n") });
  else flushText();

  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded-md bg-bubble px-1.5 py-0.5 font-mono text-[0.875em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => {
        const lines = para.split("\n");

        if (lines.every((l) => /^[-*]\s/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-muted">
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.replace(/^[-*]\s/, "")} />
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-6 marker:text-muted">
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.replace(/^\d+\.\s/, "")} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={l} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function RichText({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-base leading-7">
      {parse(content).map((block, i) =>
        block.type === "code" ? (
          <CodeBlock key={i} lang={block.lang} code={block.code} />
        ) : (
          <Prose key={i} text={block.text} />
        ),
      )}
    </div>
  );
}
