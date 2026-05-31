# Kutlerri V1 — Catering Agent

Overnight Catering Agent prototype for Round Rock Kitchen.

Each night, the agent:
1. Sweeps mock signals across 10 seed accounts (Toast, Apollo, LinkedIn Jobs, Greenhouse/Lever, Crunchbase, retention).
2. Re-scores intent (cold / warm / hot).
3. Generates exactly three owner cards with Gemini 2.5 Flash:
   - **HOT_REPLY** — drafts a reply email to the top hot inquiry.
   - **NEW_SEGMENT** — clusters warm prospects into a 3-touch sequence.
   - **NEEDS_JUDGMENT** — surfaces a margin / pricing decision (e.g. GreenBox).
4. Emails the owner a morning digest via Resend.

Approving the HOT_REPLY card sends the drafted email immediately.

## Stack

- Next.js 14 App Router + Tailwind
- Convex (queries / mutations / actions / cron)
- Vercel AI SDK v6 + `@ai-sdk/google` (Gemini 2.5 Flash)
- Resend
- Zod for strict AI output validation

## Run the overnight orchestrator manually

```bash
npx convex run overnight:run '{"dryRun": false, "skipEmail": false}'
```

## Environment

See `.env.example`. Production: `NEXT_PUBLIC_CONVEX_URL` on Vercel; all
other secrets (Gemini, Resend, owner email) live in Convex env via
`npx convex env set --prod ...`.
