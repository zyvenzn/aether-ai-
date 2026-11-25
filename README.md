# Aether

A ChatGPT-style chat interface built with Next.js and Tailwind CSS. Replies come from the [Relink gateway](https://api.relink-gateway.biz.id/v1), an OpenAI-compatible API.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `RELINK_API_KEY` to the key from your Relink dashboard (Integrasi API → API key).
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The key is only read on the server, in `app/api/chat/route.ts`. Do not prefix it with `NEXT_PUBLIC_` and do not commit `.env.local`. When you deploy, add `RELINK_API_KEY` (and optionally `RELINK_BASE_URL`) to your host's environment variables.

## How it works

- `app/api/chat/route.ts` validates the request, adds a system prompt, and streams the gateway's response back. It limits models, message count and length, output tokens, and requests per IP.
- `lib/stream.ts` reads the streamed text in the browser.
- `lib/chat.ts` lists the models shown in the picker. The ids must match the gateway's catalog. Each model uses quota at the multiplier shown in the Relink dashboard.
- `components/chat/` holds the interface.
