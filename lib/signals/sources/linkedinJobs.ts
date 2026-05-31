import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type LinkedInJobsPayload = {
  companyName: string;
  jobTitle: string;
  postedAt: number;
  location: string;
  totalPostsLast14d: number;
  departmentBreakdown: Record<string, number>;
};

const TITLES = [
  "Office Manager", "Executive Assistant", "Software Engineer",
  "Product Manager", "Account Executive", "Operations Lead",
  "Recruiter", "Customer Success", "Designer",
];

export function generateLinkedInJobsSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0x1f_ed_b3_ab);
  if (rng() > 0.45) return [];

  const total = range(rng, 2, 14);
  const ageDays = rng() * 10;
  const observedAt = now - ageDays * 86_400_000;

  const breakdown: Record<string, number> = {};
  let remaining = total;
  for (const dept of ["Engineering", "GTM", "Operations", "People"]) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, range(rng, 0, 5));
    if (take > 0) breakdown[dept] = take;
    remaining -= take;
  }

  const payload: LinkedInJobsPayload = {
    companyName: account.name,
    jobTitle: pick(rng, TITLES),
    postedAt: observedAt,
    location: account.city,
    totalPostsLast14d: total,
    departmentBreakdown: breakdown,
  };

  return [{
    source: "linkedin_jobs",
    weight: Math.min(1, total / 10),
    label: `${total} job posts in last 14d (${Object.keys(breakdown).join(", ")})`,
    rawPayload: payload,
    observedAt,
  }];
}
