import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, range } from "@/lib/signals/rng";

export type ApolloPayload = {
  companyName: string;
  headcount: number;
  headcountGrowth90d: number;
  industry: string;
  technologies: string[];
  hqCity: string;
  hqState: string;
};

export function generateApolloSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0xa9_01_10_8b);
  // Apollo enrichment is always available (firmographic baseline)
  const growth = range(rng, -5, 28);
  const ageDays = rng() * 30;
  const observedAt = now - ageDays * 86_400_000;
  const [city, state] = account.city.split(", ");

  const payload: ApolloPayload = {
    companyName: account.name,
    headcount: account.headcount,
    headcountGrowth90d: growth,
    industry: account.industry,
    technologies: ["Slack", "Google Workspace", "Notion"].slice(0, range(rng, 1, 3)),
    hqCity: city ?? account.city,
    hqState: state ?? "TX",
  };

  return [{
    source: "apollo_firmographics",
    weight: growth > 10 ? 0.8 : 0.4,
    label: `${account.headcount} headcount · ${growth > 0 ? "+" : ""}${growth}% in 90d`,
    rawPayload: payload,
    observedAt,
  }];
}
