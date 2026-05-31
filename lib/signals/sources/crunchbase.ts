import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type CrunchbaseFundingPayload = {
  companyName: string;
  fundingType: "seed" | "series_a" | "series_b" | "series_c";
  amountUSD: number;
  announcedAt: number;
  leadInvestor: string;
  employeeCountRange: string;
};

const ROUNDS = ["seed", "series_a", "series_b", "series_c"] as const;
const INVESTORS = [
  "Sequoia Capital", "a16z", "Accel", "Benchmark",
  "Founders Fund", "GV", "Index Ventures", "Lightspeed",
];

export function generateCrunchbaseSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0xc4_2b_a5_e2);
  // Only ~30% of accounts have a recent funding event
  if (rng() > 0.30) return [];

  const round = pick(rng, ROUNDS as unknown as string[]) as CrunchbaseFundingPayload["fundingType"];
  const amount =
    round === "seed" ? range(rng, 1, 5) * 1_000_000
    : round === "series_a" ? range(rng, 6, 18) * 1_000_000
    : round === "series_b" ? range(rng, 18, 60) * 1_000_000
    : range(rng, 60, 180) * 1_000_000;

  const ageDays = rng() * 14;
  const observedAt = now - ageDays * 86_400_000;

  const payload: CrunchbaseFundingPayload = {
    companyName: account.name,
    fundingType: round,
    amountUSD: amount,
    announcedAt: observedAt,
    leadInvestor: pick(rng, INVESTORS),
    employeeCountRange: `${Math.floor(account.headcount * 0.9)}-${Math.floor(account.headcount * 1.1)}`,
  };

  const usdLabel = `$${(amount / 1_000_000).toFixed(0)}M`;
  const roundLabel = round === "series_a" ? "Series A" : round === "series_b" ? "Series B" : round === "series_c" ? "Series C" : "Seed";

  return [{
    source: "crunchbase_funding",
    weight: round === "series_b" || round === "series_c" ? 1.0 : 0.7,
    label: `${usdLabel} ${roundLabel} announced ${Math.round(ageDays)}d ago`,
    rawPayload: payload,
    observedAt,
  }];
}
