import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type IndeedJobsPayload = {
  companyName: string;
  jobTitle: string;
  postedAt: number;
  location: string;
  totalPostsLast14d: number;
  salaryRange: string;
};

const TITLES = [
  "Receptionist", "Office Coordinator", "Inside Sales",
  "Technical Recruiter", "Operations Analyst", "HR Generalist",
];

export function generateIndeedSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0x1d_ee_d0_07);
  if (rng() > 0.40) return [];

  const total = range(rng, 1, 8);
  const ageDays = rng() * 12;
  const observedAt = now - ageDays * 86_400_000;
  const lo = range(rng, 45, 85);

  const payload: IndeedJobsPayload = {
    companyName: account.name,
    jobTitle: pick(rng, TITLES),
    postedAt: observedAt,
    location: account.city,
    totalPostsLast14d: total,
    salaryRange: `$${lo}k - $${lo + range(rng, 15, 40)}k`,
  };

  return [{
    source: "indeed_jobs",
    weight: Math.min(1, total / 8),
    label: `${total} Indeed posts (${account.city})`,
    rawPayload: payload,
    observedAt,
  }];
}
