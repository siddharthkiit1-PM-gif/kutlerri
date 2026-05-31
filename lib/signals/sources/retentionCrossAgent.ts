import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type RetentionCrossAgentPayload = {
  accountName: string;
  lapseReason: string;
  lastOrderUSD: number;
  lastOrderAt: number;
  weeklyOrderingHistory: number[];
};

export function generateRetentionSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0xc7_05_5a_92);
  if (rng() > 0.20) return [];

  const lastOrderUSD = range(rng, 400, 900);
  const daysSinceLast = range(rng, 45, 80);
  const reason = pick(rng, [
    "3x/mo for 6mo → 0 orders in 60 days",
    "Switched cadence — last 2 reminders ignored",
    "Office manager left in March",
  ]);

  const history = Array.from({ length: 12 }, (_, i) => (i < 8 ? range(rng, 2, 5) : 0));

  const payload: RetentionCrossAgentPayload = {
    accountName: account.name,
    lapseReason: reason,
    lastOrderUSD,
    lastOrderAt: now - daysSinceLast * 86_400_000,
    weeklyOrderingHistory: history,
  };

  return [{
    source: "retention_cross_agent",
    weight: 0.85,
    label: `Lapsed — ${reason}`,
    rawPayload: payload,
    observedAt: now - range(rng, 1, 5) * 86_400_000,
  }];
}
