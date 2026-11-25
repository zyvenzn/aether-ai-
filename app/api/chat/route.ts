import { MODELS } from "@/lib/chat";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side proxy to the Relink gateway (OpenAI-compatible).
 * The API key lives in RELINK_API_KEY and never reaches the browser.
 */

const BASE_URL = (
  process.env.RELINK_BASE_URL ?? "https://api.relink-gateway.biz.id/v1"
).replace(/\/+$/, "");

const SYSTEM_PROMPT =
  "You are Aether, an AI assistant for engineering teams. Be concise and accurate. Use Markdown for lists and fenced code blocks for code.";

const ALLOWED_MODELS = new Set(MODELS.map((m) => m.id));

// Limits keep one visitor from burning the whole token quota.
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_TOTAL_CHARS = 40_000;
const MAX_OUTPUT_TOKENS = 2_048;
const RATE_LIMIT = 20; // requests per IP per minute (best effort, per server instance)

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  if (hits.size > 5_000) hits.clear();
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function parseBody(
  body: unknown,
): { model: string; messages: ChatMessage[] } | null {
  if (typeof body !== "object" || body === null) return null;
  const { model, messages } = body as Record<string, unknown>;

  if (typeof model !== "string" || !ALLOWED_MODELS.has(model)) return null;
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const clean: ChatMessage[] = [];
  let total = 0;

  for (const item of messages) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    if (content.length === 0 || content.length > MAX_MESSAGE_CHARS) return null;
    total += content.length;
    clean.push({ role, content });
  }

  if (total > MAX_TOTAL_CHARS) return null;
  if (clean[clean.length - 1].role !== "user") return null;

  return { model, messages: clean };
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) {
    return fail("Login diperlukan untuk menggunakan Aether.", 401);
  }

  const apiKey = process.env.RELINK_API_KEY;
  if (!apiKey) {
    return fail("The server has no API key. Set RELINK_API_KEY and restart.", 500);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return fail("Too many requests. Wait a minute and try again.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return fail("Invalid request, or the conversation is too long. Start a new chat.", 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: parsed.model,
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...parsed.messages],
      }),
      // Stop paying for tokens when the reader leaves or presses stop.
      signal: request.signal,
    });
  } catch {
    return fail("Could not reach the model gateway.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    // Log the status only: never the key or the conversation.
    console.error(`Gateway responded with status ${upstream.status}`);
    if (upstream.status === 401 || upstream.status === 403) {
      return fail("The gateway rejected the API key.", 502);
    }
    if (upstream.status === 402 || upstream.status === 429) {
      return fail("Quota or rate limit reached on the gateway.", 429);
    }
    return fail(`The model gateway returned an error (${upstream.status}).`, 502);
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
