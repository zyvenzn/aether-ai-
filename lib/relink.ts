// Konfigurasi Re:Link Gateway (OpenAI-compatible). Dipakai di server saja.
export const RELINK_BASE_URL = (
  process.env.RELINK_BASE_URL || "https://api.relink-gateway.biz.id/v1"
).replace(/\/+$/, "");

export const SYSTEM_PROMPT =
  "Kamu adalah Aether, asisten AI yang ramah, jelas, dan to the point. " +
  "Jawab dalam bahasa yang sama dengan pengguna. Pakai markdown seperlunya " +
  "dan taruh kode di dalam blok kode.";

export function getApiKey(): string | undefined {
  return process.env.RELINK_API_KEY || undefined;
}
