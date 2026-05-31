/**
 * Shared domain types — consumed by lib/scoring, lib/ai, lib/signals.
 * Convex storage shapes live in convex/schema.ts; these are the
 * runtime/working types passed between modules.
 */

export type SignalSource =
  | "toast_pos_guest_match"
  | "crunchbase_funding"
  | "linkedin_jobs"
  | "indeed_jobs"
  | "apollo_firmographics"
  | "greenhouse_lever_ats"
  | "retention_cross_agent";

export type IntentLevel = "hot" | "warm" | "cold";

export type Lane = "needs-you" | "autonomous";

export type Signal = {
  source: SignalSource;
  weight: number;       // 0..1
  label: string;        // human-readable
  rawPayload: unknown;  // the source's native shape
  observedAt: number;
};

export type ScoredAccount = {
  accountId: string;
  name: string;
  intentScore: number;        // 0..100
  intentLevel: IntentLevel;
  topSignals: Signal[];       // ranked, ≤4
  reasonChain: string[];      // why this score, for AI prompts + UI
};

export type CardType = "HOT_REPLY" | "NEW_SEGMENT" | "NEEDS_JUDGMENT";

/** Common shape returned by every AI generator before zod validation. */
export type AIResult<T> = {
  ok: true;
  data: T;
  modelUsed: string;
  latencyMs: number;
} | {
  ok: false;
  error: string;
};
