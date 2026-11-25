const DONE = Symbol("done");

/** Reads one SSE line from an OpenAI-style stream. Returns text, DONE, or null. */
function readLine(line: string): string | typeof DONE | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;

  const payload = trimmed.slice(5).trim();
  if (payload === "[DONE]") return DONE;

  try {
    const json = JSON.parse(payload) as {
      choices?: { delta?: { content?: unknown } }[];
    };
    const content = json.choices?.[0]?.delta?.content;
    return typeof content === "string" && content ? content : null;
  } catch {
    return null;
  }
}

/** Yields the text deltas of an OpenAI-compatible streaming response. */
export async function* readDeltas(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const result = readLine(line);
        if (result === DONE) return;
        if (result) yield result;
      }
    }

    const tail = readLine(buffer);
    if (tail && tail !== DONE) yield tail;
  } finally {
    reader.cancel().catch(() => {});
  }
}
