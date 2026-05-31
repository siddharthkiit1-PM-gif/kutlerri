/**
 * Intent scoring engine — deterministic, pure functions.
 *
 * Formula (per signal):
 *   contribution = SOURCE_WEIGHTS[source] * clamp01(signal.weight)
 *                  * recencyDecay(observedAt, now) * 100
 *
 * Final score (diminishing returns over many weak signals):
 *   score = round(clamp(100 * (1 - exp(-Σcontribution / 100)), 0, 100))
 *
 * recencyDecay:
 *   ≤7d  → 1.0
 *   7–30d → linear 1.0 → 0.4
 *   >30d → 0.2
 *
 * Calibration (verified by tests):
 *   - Fresh Toast match alone        → ~63 (warm-high)
 *   - Fresh Toast + Crunchbase       → ~83 (hot)
 *   - 10 weak/stale signals          → does not beat 2 strong fresh signals
 */
import type { Signal, ScoredAccount, IntentLevel } from "@/lib/types/domain";

export const SOURCE_WEIGHTS: Record<Signal["source"], number> = {
  toast_pos_guest_match: 1.0,
  retention_cross_agent: 0.85,
  crunchbase_funding:    0.75,
  linkedin_jobs:         0.65,
  indeed_jobs:           0.60,
  greenhouse_lever_ats:  0.55,
  apollo_firmographics:  0.45,
};

const SOURCE_LABEL: Record<Signal["source"], string> = {
  toast_pos_guest_match: "Toast POS Guest Match",
  retention_cross_agent: "Guest Retention (cross-agent)",
  crunchbase_funding:    "Crunchbase funding",
  linkedin_jobs:         "LinkedIn Jobs",
  indeed_jobs:           "Indeed",
  greenhouse_lever_ats:  "Greenhouse / Lever ATS",
  apollo_firmographics:  "Apollo.io firmographics",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function recencyDecay(observedAt: number, now: number = Date.now()): number {
  const ageDays = Math.max(0, (now - observedAt) / DAY_MS);
  if (ageDays <= 7) return 1.0;
  if (ageDays >= 30) return 0.2;
  // linear 1.0 → 0.4 between 7 and 30 days
  return 1.0 - ((ageDays - 7) / 23) * 0.6;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function levelFor(score: number): IntentLevel {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

type Contribution = { signal: Signal; value: number };

export function scoreSignals(
  signals: Signal[],
  now: number = Date.now(),
): { score: number; level: IntentLevel; topSignals: Signal[]; reasonChain: string[] } {
  if (signals.length === 0) {
    return { score: 0, level: "cold", topSignals: [], reasonChain: [] };
  }

  const contributions: Contribution[] = signals.map((s) => ({
    signal: s,
    value:
      (SOURCE_WEIGHTS[s.source] ?? 0) *
      clamp01(s.weight) *
      recencyDecay(s.observedAt, now) *
      100,
  }));

  // sort desc by contribution
  contributions.sort((a, b) => b.value - a.value);

  const sum = contributions.reduce((acc, c) => acc + c.value, 0);
  const raw = 100 * (1 - Math.exp(-sum / 100));
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  const topSignals = contributions.slice(0, 4).map((c) => c.signal);
  const reasonChain = contributions
    .slice(0, 3)
    .filter((c) => c.value > 0)
    .map((c) => `${SOURCE_LABEL[c.signal.source]}: ${c.signal.label}`);

  return { score, level: levelFor(score), topSignals, reasonChain };
}

/** Convenience: produce a ScoredAccount given account identity + signals. */
export function buildScoredAccount(
  account: { accountId: string; name: string },
  signals: Signal[],
  now: number = Date.now(),
): ScoredAccount {
  const { score, level, topSignals, reasonChain } = scoreSignals(signals, now);
  return {
    accountId: account.accountId,
    name: account.name,
    intentScore: score,
    intentLevel: level,
    topSignals,
    reasonChain,
  };
}
