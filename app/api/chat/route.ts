import { ACTIVE_MODELS, DEFAULT_MODEL, RELINK_BASE_URL, SYSTEM_PROMPT, getApiKey } from "@/lib/relink";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessage = { role?: string; content?: unknown };

const MAX_MESSAGES = 40;
const MAX_CHARS = 20000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims?.sub) {
    return jsonError("Login diperlukan untuk menggunakan AETHER.", 401);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return jsonError("RELINK_API_KEY belum diset di environment server.", 500);
  }

  let body: { messages?: IncomingMessage[]; model?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Body request bukan JSON yang valid.", 400);
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0) {
    return jsonError("Pesan kosong.", 400);
  }

  const requestedModel =
    typeof body.model === "string" ? body.model.trim() : "";
  const configuredModel = process.env.RELINK_MODEL?.trim();
  const model =
    requestedModel ||
    (configuredModel && ACTIVE_MODELS.includes(configuredModel as (typeof ACTIVE_MODELS)[number])
      ? configuredModel
      : DEFAULT_MODEL);

  if (!ACTIVE_MODELS.includes(model as (typeof ACTIVE_MODELS)[number])) {
    return jsonError(
      "Model tidak tersedia atau sedang nonaktif. Pilih model dari daftar AETHER.",
      400,
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${RELINK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: req.signal,
    });
  } catch {
    return jsonError(
      "Tidak bisa menghubungi Re:Link Gateway. Coba lagi sebentar.",
      502,
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    let gatewayCode = "";
    let gatewayMessage = "";
    try {
      const parsed = JSON.parse(detail) as {
        error?: { code?: unknown; message?: unknown };
      };
      gatewayCode =
        typeof parsed.error?.code === "string" ? parsed.error.code : "";
      gatewayMessage =
        typeof parsed.error?.message === "string" ? parsed.error.message : "";
    } catch {
      // Gateway tidak selalu mengembalikan JSON.
    }

    if (gatewayCode === "model_disabled") {
      return jsonError(
        `Model "${model}" sedang dinonaktifkan di Re:Link Gateway. Pilih model yang berstatus aktif di dashboard gateway.`,
        400,
      );
    }

    const status =
      upstream.status === 401 || upstream.status === 403
        ? 401
        : upstream.status === 429
          ? 429
          : 502;
    const hint =
      status === 401
        ? "API key ditolak gateway."
        : status === 429
          ? "Kena rate limit atau kuota habis."
          : `Gateway error (${upstream.status}).`;
    const message = gatewayMessage || detail.slice(0, 200);
    return jsonError(`${hint} ${message}`.trim(), status);
  }

  // Ubah stream SSE (format OpenAI) jadi stream teks polos.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let wrote = false;
          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: unknown } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (typeof piece === "string" && piece) {
                controller.enqueue(encoder.encode(piece));
                wrote = true;
              }
            } catch {
              // baris bukan JSON, abaikan
            }
          }

          if (wrote) return;
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
