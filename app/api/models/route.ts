import { ACTIVE_MODELS, DEFAULT_MODEL } from "@/lib/relink";

export async function GET() {
  const configuredModel = process.env.RELINK_MODEL?.trim();
  const defaultModel =
    configuredModel && ACTIVE_MODELS.includes(configuredModel as (typeof ACTIVE_MODELS)[number])
      ? configuredModel
      : DEFAULT_MODEL;

  return Response.json({
    models: ACTIVE_MODELS,
    defaultModel,
  });
}
