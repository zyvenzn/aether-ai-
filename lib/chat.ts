export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export type HistoryGroup = "Today" | "Yesterday" | "Previous 7 days";

export interface Conversation {
  id: string;
  title: string;
  group: HistoryGroup;
  messages: Message[];
}

export const HISTORY_GROUPS: HistoryGroup[] = [
  "Today",
  "Yesterday",
  "Previous 7 days",
];

export const MODELS = [
  { id: "aether-3", name: "Aether 3.0", note: "Best for complex work" },
  { id: "aether-3-mini", name: "Aether 3.0 Mini", note: "Faster for everyday tasks" },
];

export const SUGGESTIONS = [
  "Explain how edge routing cuts latency",
  "Write a debounce function in TypeScript",
  "Draft a weekly status update",
  "Suggest an autoscaling policy for a worker pool",
];

const fence = (lang: string, body: string) => "```" + lang + "\n" + body + "\n```";

const ROUTING_REPLY = [
  "Edge routing shortens the path a request travels before it reaches a model.",
  "",
  "- **Nearest node:** the router picks the inference node closest to the caller instead of a fixed region.",
  "- **Warm capacity:** it prefers nodes that already have the model loaded, so there is no cold start.",
  "- **Fallback:** if a node is slow or down, the request moves to the next best one.",
  "",
  "The result is usually a lower p99, because the slowest requests are the ones that cross regions or hit cold nodes.",
].join("\n");

const DEBOUNCE_REPLY = [
  "Here is a typed debounce helper:",
  "",
  fence(
    "ts",
    [
      "export function debounce<Args extends unknown[]>(",
      "  fn: (...args: Args) => void,",
      "  waitMs: number,",
      ") {",
      "  let timer: ReturnType<typeof setTimeout> | undefined;",
      "",
      "  return (...args: Args) => {",
      "    clearTimeout(timer);",
      "    timer = setTimeout(() => fn(...args), waitMs);",
      "  };",
      "}",
    ].join("\n"),
  ),
  "",
  "Each call resets the timer, so `fn` only runs after `waitMs` of quiet.",
].join("\n");

const STATUS_REPLY = [
  "Here is a draft you can adjust:",
  "",
  "**Weekly status**",
  "",
  "- **Shipped:** the new routing config is live in two regions.",
  "- **In progress:** load tests for the autoscaling policy.",
  "- **Blocked:** waiting on credentials for the staging cluster.",
  "- **Next week:** roll out to the remaining regions and review the p99 numbers.",
  "",
  "Send me the real details and I will rewrite it to match.",
].join("\n");

const AUTOSCALE_REPLY = [
  "A reasonable starting point. The config shape is illustrative:",
  "",
  fence(
    "ts",
    [
      "export default defineClusterPolicy({",
      "  autoScale: { minPods: 4, maxPods: 64, targetCPU: 0.7 },",
      "  scaleUp: { stabilizationSeconds: 30 },",
      "  scaleDown: { stabilizationSeconds: 300 },",
      "});",
    ].join("\n"),
  ),
  "",
  "A CPU target near 70 percent leaves headroom for spikes. Scale down slowly so a short dip does not remove capacity you need a minute later. Tune both numbers against real traffic.",
].join("\n");

const FALLBACK_REPLY =
  "This is a demo of the Aether interface, so replies are simulated and I can only answer the suggested prompts. Connect a model in `sendMessage` to get real answers.";

export function craftReply(prompt: string): string {
  const text = prompt.toLowerCase();
  if (/\b(edge|routing|latency)\b/.test(text)) return ROUTING_REPLY;
  if (/\b(debounce|typescript)\b/.test(text)) return DEBOUNCE_REPLY;
  if (/\b(status|weekly)\b/.test(text)) return STATUS_REPLY;
  if (/\b(autoscal\w*|scaling|worker|pool)\b/.test(text)) return AUTOSCALE_REPLY;
  return FALLBACK_REPLY;
}

export function makeTitle(prompt: string): string {
  const clean = prompt.replace(/\s+/g, " ").trim();
  return clean.length > 40 ? `${clean.slice(0, 40).trimEnd()}…` : clean;
}

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "seed-routing",
    title: "Edge routing and latency",
    group: "Today",
    messages: [
      { id: "seed-routing-u", role: "user", content: "Explain how edge routing cuts latency" },
      { id: "seed-routing-a", role: "assistant", content: ROUTING_REPLY },
    ],
  },
  {
    id: "seed-debounce",
    title: "Debounce helper in TypeScript",
    group: "Today",
    messages: [
      { id: "seed-debounce-u", role: "user", content: "Write a debounce function in TypeScript" },
      { id: "seed-debounce-a", role: "assistant", content: DEBOUNCE_REPLY },
    ],
  },
  {
    id: "seed-status",
    title: "Weekly status update",
    group: "Yesterday",
    messages: [
      { id: "seed-status-u", role: "user", content: "Draft a weekly status update" },
      { id: "seed-status-a", role: "assistant", content: STATUS_REPLY },
    ],
  },
  {
    id: "seed-autoscale",
    title: "Autoscaling policy for workers",
    group: "Previous 7 days",
    messages: [
      { id: "seed-autoscale-u", role: "user", content: "Suggest an autoscaling policy for a worker pool" },
      { id: "seed-autoscale-a", role: "assistant", content: AUTOSCALE_REPLY },
    ],
  },
];
