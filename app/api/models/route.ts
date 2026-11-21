import { ACTIVE_MODELS, DEFAULT_MODEL } from "@/lib/relink";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }

  const configuredModel = process.env.RELINK_MODEL?.trim();
  const defaultModel =
    configuredModel && ACTIVE_MODELS.includes(configuredModel as (typeof ACTIVE_MODELS)[number])
      ? configuredModel
      : DEFAULT_MODEL;

  return Response.json(
    { models: ACTIVE_MODELS, defaultModel },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}