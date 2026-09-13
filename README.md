# Trading OS Coach

A focused Next.js accountability agent for the current SYSTEM v2 rules. It uses the OpenAI Responses API from a server-side route, so the OpenAI API key never reaches the browser.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add an OpenAI API key to `OPENAI_API_KEY`.
3. Run `npm install`, then `npm run dev`.

## Deploy to Vercel

1. Import the `trading-os-agent` folder as a new Vercel project.
2. Add `OPENAI_API_KEY` as an encrypted environment variable for Production, Preview, and Development.
3. Optionally set `OPENAI_MODEL` (defaults to `gpt-5.2`).
4. Deploy.

The system prompt intentionally contains only the current operating rules. Update it only after the designated review, not in response to one live result.
