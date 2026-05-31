/**
 * Drives all 7 source generators against SEED_ACCOUNTS to produce a fresh
 * overnight signal batch. Deterministic from rngSeed + now.
 */
import type { Signal, SignalSource } from "@/lib/types/domain";
import { SEED_ACCOUNTS, type SeedAccount } from "@/lib/signals/seed";
import { generateToastSignals } from "@/lib/signals/sources/toastPos";
import { generateCrunchbaseSignals } from "@/lib/signals/sources/crunchbase";
import { generateLinkedInJobsSignals } from "@/lib/signals/sources/linkedinJobs";
import { generateIndeedSignals } from "@/lib/signals/sources/indeedJobs";
import { generateApolloSignals } from "@/lib/signals/sources/apollo";
import { generateAtsSignals } from "@/lib/signals/sources/greenhouseLever";
import { generateRetentionSignals } from "@/lib/signals/sources/retentionCrossAgent";

export type SimulateResult = {
  signalsByAccountName: Record<string, Signal[]>;
  rawCounts: Record<SignalSource, number>;
  accounts: SeedAccount[];
};

const HOT_ACCOUNTS = new Set(["Acme Tech Holdings", "BigCommerce"]);
const WARM_ACCOUNTS = new Set(["Stripe Austin", "Indeed HQ", "Klar Robotics", "GreenBox Inc."]);

export function simulateOvernight(
  opts: { now?: number; rngSeed?: number } = {},
): SimulateResult {
  const now = opts.now ?? Date.now();
  const baseSeed = opts.rngSeed ?? 0x4b_75_74_6c;

  const signalsByAccountName: Record<string, Signal[]> = {};
  const rawCounts: Record<SignalSource, number> = {
    toast_pos_guest_match: 0,
    crunchbase_funding: 0,
    linkedin_jobs: 0,
    indeed_jobs: 0,
    apollo_firmographics: 0,
    greenhouse_lever_ats: 0,
    retention_cross_agent: 0,
  };

  for (let i = 0; i < SEED_ACCOUNTS.length; i++) {
    const acc = SEED_ACCOUNTS[i];
    const accSeed = baseSeed + i * 1009;
    const sigs: Signal[] = [];

    if (HOT_ACCOUNTS.has(acc.name)) {
      // Guarantee hot: force fresh Toast + Crunchbase + LinkedIn
      sigs.push(...forceToast(acc, accSeed, now));
      sigs.push(...forceCrunchbase(acc, accSeed, now));
      sigs.push(...forceLinkedIn(acc, accSeed, now));
      sigs.push(...generateApolloSignals(acc, accSeed, now));
    } else if (WARM_ACCOUNTS.has(acc.name)) {
      // Warm: at least one of LinkedIn/Indeed + Apollo, sometimes Toast
      sigs.push(...generateToastSignals(acc, accSeed, now));
      sigs.push(...forceLinkedIn(acc, accSeed, now));
      sigs.push(...generateIndeedSignals(acc, accSeed, now));
      sigs.push(...generateApolloSignals(acc, accSeed, now));
      sigs.push(...generateAtsSignals(acc, accSeed, now));
    } else {
      sigs.push(...generateToastSignals(acc, accSeed, now));
      sigs.push(...generateCrunchbaseSignals(acc, accSeed, now));
      sigs.push(...generateLinkedInJobsSignals(acc, accSeed, now));
      sigs.push(...generateIndeedSignals(acc, accSeed, now));
      sigs.push(...generateApolloSignals(acc, accSeed, now));
      sigs.push(...generateAtsSignals(acc, accSeed, now));
      sigs.push(...generateRetentionSignals(acc, accSeed, now));
    }

    signalsByAccountName[acc.name] = sigs;
    for (const s of sigs) rawCounts[s.source] += 1;
  }

  return { signalsByAccountName, rawCounts, accounts: SEED_ACCOUNTS };
}

// ── Forced (guaranteed-fresh) generators for hot tier ──────────────────────
function forceToast(acc: SeedAccount, seed: number, now: number): Signal[] {
  const sigs = generateToastSignals(acc, seed, now);
  if (sigs.length > 0) return sigs;
  // Force one strong Toast match
  return [{
    source: "toast_pos_guest_match",
    weight: 1.0,
    label: `12 weekly orders from ${acc.name} employees`,
    rawPayload: {
      orderId: `tst_forced_${acc.domain}`,
      employeeEmail: `team@${acc.domain}`,
      employerDomain: acc.domain,
      employerName: acc.name,
      orderCountLast90d: 12,
      lastOrderAt: now - 86_400_000,
      avgTicketUSD: 22,
      locationId: "loc_round_rock_01",
    },
    observedAt: now - 2 * 86_400_000,
  }];
}

function forceCrunchbase(acc: SeedAccount, seed: number, now: number): Signal[] {
  const sigs = generateCrunchbaseSignals(acc, seed, now);
  if (sigs.length > 0) return sigs;
  return [{
    source: "crunchbase_funding",
    weight: 1.0,
    label: `$30M Series B announced 3d ago`,
    rawPayload: {
      companyName: acc.name,
      fundingType: "series_b" as const,
      amountUSD: 30_000_000,
      announcedAt: now - 3 * 86_400_000,
      leadInvestor: "Accel",
      employeeCountRange: `${acc.headcount - 20}-${acc.headcount + 20}`,
    },
    observedAt: now - 3 * 86_400_000,
  }];
}

function forceLinkedIn(acc: SeedAccount, seed: number, now: number): Signal[] {
  const sigs = generateLinkedInJobsSignals(acc, seed, now);
  if (sigs.length > 0) return sigs;
  return [{
    source: "linkedin_jobs",
    weight: 0.7,
    label: `5 office-manager job posts in last 14 days`,
    rawPayload: {
      companyName: acc.name,
      jobTitle: "Office Manager",
      postedAt: now - 5 * 86_400_000,
      location: acc.city,
      totalPostsLast14d: 5,
      departmentBreakdown: { Operations: 5 },
    },
    observedAt: now - 5 * 86_400_000,
  }];
}
