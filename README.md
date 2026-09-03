# WebMcp.AI

Paste a public website URL and discover the WebMCP tools that could make it useful to AI agents. The scanner researches the target site and relevant web context, maps real workflows to structured tools, ranks each opportunity, and generates a production-oriented implementation prompt.

Built for the [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/). The core idea: most websites make agents infer how to operate a visual interface; WebMCP lets a page expose explicit tools that agents can call directly.

## What it includes

- Public website extraction with redirect, size, protocol, DNS, and private-network safeguards
- OpenAI Responses API analysis with built-in web search
- Strict Zod validation of structured model output
- Evidence links, limitations, readiness scoring, opportunity scores, safety classifications, and top-three recommendations
- Filters, sorting, detailed schemas, before/after flows, agent simulation, and clearly labeled demo data
- Selectable MCP Tool Builder with copy/downloadable implementation prompt
- Markdown and JSON exports
- Imperative WebMCP tools: `analyze_website`, `get_opportunity_report`, and `select_tools_for_plan`
- Dark/light responsive interface

## Local setup

Requires Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```dotenv
OPENCODE_API_KEY=
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_MODEL=gpt-5.6-luna
ANALYSIS_TIMEOUT_MS=45000
```

Add your OpenCode Go key only to `.env.local`. For backward compatibility, the server also accepts it from `OPENAI_API_KEY`. The API route and model client are server-side; the browser never receives the key. Do not prefix the key with `NEXT_PUBLIC_`.

## Architecture

- `app/page.tsx` — complete interactive product surface and WebMCP registration
- `app/api/analyze/route.ts` — validated server API
- `lib/research.ts` / `lib/url.ts` — safe public-page discovery and extraction
- `lib/analyze.ts` — isolated OpenAI Responses API integration and structured output
- `lib/schemas.ts` — TypeScript/Zod data contracts
- `lib/scoring.ts` — deterministic ranking
- `lib/prompt.ts` — implementation-prompt generator
- `tests/` — validation, scoring, injection-boundary, prompt, malformed-output, empty-research, and E2E checks

The pipeline directly fetches a small set of relevant public pages, marks their text as untrusted data, and asks the model to perform additional web research. It never executes instructions found in crawled content.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

## Security and limitations

- Target pages are untrusted input. The model is explicitly instructed to treat them as data.
- Local, private, metadata, credential-bearing, and non-HTTP URLs are rejected; redirects are revalidated.
- Crawls are intentionally bounded and honor ordinary HTTP failures. Some JavaScript-only, authenticated, blocked, or robots-restricted sites may yield partial analysis.
- Generated recommendations are strategic guidance. Transactional tools still require application-specific authentication, authorization, validation, confirmation, idempotency, audit logging, and rate limits.
- The tool does not guarantee ROI and labels the bundled example as fictional.

## Challenge demo

1. Open the landing page and use **See example report** to explain the report anatomy.
2. Add `OPENAI_API_KEY` to `.env.local`, then scan a real public website.
3. Show the evidence-backed readiness score and expand a top recommendation.
4. Compare **Without WebMCP** and **With WebMCP**.
5. Select two or three tools and copy the generated implementation prompt.
6. In ChatGPT's WebMCP-capable in-app browser, ask the agent to call `analyze_website`, retrieve the report, and select tools for a plan.

No database is required. The report remains in browser memory for the current session, keeping the local challenge demo simple and avoiding unnecessary collection of analyzed URLs.
