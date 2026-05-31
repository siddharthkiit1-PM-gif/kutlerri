/**
 * Toast POS guest-match signals.
 *
 * Real-world swap-in: Toast's /guest API + employee email enrichment.
 * Payload shape mirrors the webhook events Toast Partners receive.
 */
import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type ToastGuestMatchPayload = {
  orderId: string;
  employeeEmail: string;
  employerDomain: string;
  employerName: string;
  orderCountLast90d: number;
  lastOrderAt: number;
  avgTicketUSD: number;
  locationId: string;
};

export function generateToastSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed);
  // Probability of having Toast match: deterministic per account
  if (rng() > 0.55) return [];

  const matchCount = range(rng, 1, 3);
  const out: Signal[] = [];
  for (let i = 0; i < matchCount; i++) {
    const orderCount = range(rng, 3, 14);
    const avg = range(rng, 12, 28);
    const ageDays = rng() * 9; // 0–9 days old (mostly fresh)
    const observedAt = now - ageDays * 86_400_000;
    const firstName = pick(rng, ["alex", "priya", "sam", "jordan", "morgan", "kai", "riley"]);
    const lastName = pick(rng, ["chen", "patel", "kim", "rivera", "okafor", "nguyen"]);
    const payload: ToastGuestMatchPayload = {
      orderId: `tst_${Math.floor(rng() * 1e9).toString(36)}`,
      employeeEmail: `${firstName}.${lastName}@${account.domain}`,
      employerDomain: account.domain,
      employerName: account.name,
      orderCountLast90d: orderCount,
      lastOrderAt: observedAt - range(rng, 0, 5) * 86_400_000,
      avgTicketUSD: avg,
      locationId: "loc_round_rock_01",
    };
    out.push({
      source: "toast_pos_guest_match",
      weight: Math.min(1, orderCount / 10), // more orders = stronger signal
      label: `${orderCount} weekly orders from ${account.name} employees`,
      rawPayload: payload,
      observedAt,
    });
  }
  return out;
}
