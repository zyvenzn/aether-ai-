// Konfigurasi Re:Link Gateway. File ini hanya diimpor oleh kode server.
export const RELINK_BASE_URL = (
  process.env.RELINK_BASE_URL || "https://api.relink-gateway.biz.id/v1"
).replace(/\/+$/, "");

export const SYSTEM_PROMPT =
  "Kamu adalah Aether, asisten AI yang ramah, jelas, dan to the point. " +
  "Jawab dalam bahasa yang sama dengan pengguna. Pakai markdown seperlunya " +
  "dan taruh kode di dalam blok kode.";

// Allowlist berdasarkan katalog Re:Link yang diverifikasi aktif pada 21 Nov 2026.
// Perbarui daftar ini jika status model di dashboard gateway berubah.
export const ACTIVE_MODELS = [
  "deepseek-v4-flash",
  "deepseek-v4-flash-0731",
  "deepseek-v4-flash-vision-exp",
  "deepseek-v4-mod",
  "deepseek-v4-pro",
  "deepseek-v4.1-flash",
  "deepseek-v4.1-flash-1017",
  "deepseek-v4.1-flash-1017-mod",
  "deepseek-v4.1-flash-mod",
  "gemini-4-argon",
  "glm-5.2",
  "glm-5.2-mod",
  "glm-5.3",
  "glm-5.3-flash",
  "glm-5.3-flash-mod",
  "glm-5.3-mod",
  "kimi-k2.7-code",
  "kimi-k2.7-code-highspeed",
  "kimi-k2.8",
  "mimo-v2.5-pro",
  "mimo-v2.6-flash",
  "mimo-v2.6-pro",
] as const;

export const DEFAULT_MODEL = "deepseek-v4-flash";

export function getApiKey(): string | undefined {
  return process.env.RELINK_API_KEY || undefined;
}
