# Portfolio assistant — Cloudflare Worker (Phase 2)

This Worker adds natural-language routing to the chat widget. It's optional:
without it, `chat.js` runs on local keyword matching. With it, the widget sends
each question here, the Worker asks a Workers AI model to pick the best topic id,
and `chat.js` shows the hand-vetted answer for that id from `kb.json`.

**The Worker never writes answers.** It only returns one id (or `none`), so the
model's output is constrained to an enum — hallucination and prompt injection
are contained by design.

## Cost

Free tier: Cloudflare Workers (100k requests/day) + Workers AI (10k Neurons/day).
A classification call is tiny, so portfolio traffic stays comfortably free.

## Deploy (dashboard, ~5 min — no CLI needed)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it (e.g. `portfolio-chat`), **Deploy**, then **Edit code**.
3. Replace the contents with `chat-worker.js` from this folder. **Save and deploy**.
4. **Settings → Bindings → Add → Workers AI**. Variable name: `AI`. Save.
5. Copy the Worker URL (e.g. `https://portfolio-chat.<you>.workers.dev`).
6. In `chat.js`, set `WORKER_URL` to that URL. Commit and push.

## Deploy (Wrangler CLI — alternative)

```
npm i -g wrangler
wrangler login
wrangler deploy worker/chat-worker.js --name portfolio-chat --compatibility-date 2024-01-01
```

Add the AI binding in `wrangler.toml`:

```
[ai]
binding = "AI"
```

## Notes

- `ALLOWED_ORIGINS` in `chat-worker.js` restricts who can call the Worker. It
  already lists `shanbhag003.com`, `www.shanbhag003.com` and `localhost:8000`.
- Swap `MODEL` for any Workers AI text model. `llama-3.1-8b-instruct` is a good
  default for classification.
- For heavier abuse protection, put Cloudflare Turnstile in front of the widget
  or add rate limiting (KV / Rate Limiting rules). Not required at portfolio
  traffic.
