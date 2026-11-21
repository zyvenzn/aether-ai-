# AETHER.ai

Landing page + chat AI (Next.js) yang terhubung ke Re:Link Gateway.

## Jalankan

```bash
npm install
cp .env.example .env.local   # lalu isi RELINK_API_KEY
npm run dev
```

- `/` — landing page
- `/chat` — chat AI (riwayat disimpan di browser, jawaban streaming)

## Environment

| Variabel | Fungsi |
| --- | --- |
| `RELINK_API_KEY` | API key dari dashboard Re:Link Gateway (wajib, hanya di server) |
| `RELINK_BASE_URL` | Base URL gateway, default `https://api.relink-gateway.biz.id/v1` |
| `RELINK_MODEL` | Model default (opsional, bisa dipilih lewat dropdown) |

Di Vercel, isi variabel yang sama di Settings → Environment Variables, lalu redeploy.

## Struktur singkat

- `app/api/chat/route.ts` — proxy streaming ke `/chat/completions`
- `app/api/models/route.ts` — daftar model dari gateway
- `components/chat/` — UI chat
- `lib/relink.ts` — konfigurasi gateway
