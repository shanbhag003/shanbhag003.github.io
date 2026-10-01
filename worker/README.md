# Portfolio assistant — architecture

The chat widget (`chat.js`) is a thin client. It sends the visitor's question to
a Cloudflare Worker and renders the single answer + follow-up suggestions that
come back. **It never downloads a knowledge-base file.**

## Why the Worker holds the knowledge base

The knowledge base contains richer professional detail than the website shows and
must not be publicly browsable. So it lives **inside the deployed Worker** (whose
source Cloudflare does not serve), not in this public repo and not as a static
`kb.json`. The Worker returns only the one answer for each question, so the full
KB is never exposed. Sensitive material (phone number, reason-for-change,
ownership caveats, boundaries) is deliberately not in the Worker at all — it only
informs how answers are worded.

## How it works

1. `chat.js` POSTs `{ "q": "<question>" }` to the Worker.
2. The Worker asks a Workers AI model to classify the question into one intent id
   (the model only ever outputs an id — never prose — so hallucination and prompt
   injection are contained). A server-side keyword match is the fallback.
3. The Worker returns `{ id, answer, follow }` from its private KB.

## Deploy / edit

The Worker is the standalone `portfolio-chat` Worker
(`portfolio-chat.kshanbhag231.workers.dev`), created in the Cloudflare dashboard
with a Workers AI binding named `AI`. To change the KB or logic, edit that Worker
in the dashboard — the source is intentionally kept out of this public repository.

Free tier: Workers (100k req/day) + Workers AI (10k Neurons/day).
