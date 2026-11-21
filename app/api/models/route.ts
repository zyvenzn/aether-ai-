import { RELINK_BASE_URL, getApiKey } from "@/lib/relink";

// Daftar model yang tersedia di gateway (untuk dropdown di UI).
export async function GET() {
  const envModel = process.env.RELINK_MODEL || null;
  const fallback = {
    models: envModel ? [envModel] : [],
    defaultModel: envModel,
  };

  const apiKey = getApiKey();
  if (!apiKey) {
    return Response.json({ ...fallback, error: "RELINK_API_KEY belum diset." });
  }

  try {
    const res = await fetch(`${RELINK_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);

    const data = (await res.json()) as { data?: { id?: unknown }[] };
    const ids = (data.data ?? [])
      .map((m) => m.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .sort();

    const models = envModel && !ids.includes(envModel) ? [envModel, ...ids] : ids;
    return Response.json({
      models,
      defaultModel: envModel ?? models[0] ?? null,
    });
  } catch {
    return Response.json({ ...fallback, error: "Gagal mengambil daftar model." });
  }
}
