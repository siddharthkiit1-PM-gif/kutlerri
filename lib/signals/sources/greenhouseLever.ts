import type { Signal } from "@/lib/types/domain";
import type { SeedAccount } from "@/lib/signals/seed";
import { mulberry32, pick, range } from "@/lib/signals/rng";

export type AtsPayload = {
  companyName: string;
  atsProvider: "greenhouse" | "lever";
  openRolesByTeam: Record<string, number>;
  totalOpenRoles: number;
  snapshotAt: number;
};

export function generateAtsSignals(
  account: SeedAccount,
  seed: number,
  now: number,
): Signal[] {
  const rng = mulberry32(seed ^ 0x6e_b0_05_e1);
  if (rng() > 0.25) return [];

  const total = range(rng, 2, 16);
  const ageDays = rng() * 7;
  const observedAt = now - ageDays * 86_400_000;
  const byTeam: Record<string, number> = {};
  let remaining = total;
  for (const t of ["Eng", "Sales", "Ops", "G&A"]) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, range(rng, 0, 6));
    if (take > 0) byTeam[t] = take;
    remaining -= take;
  }

  const payload: AtsPayload = {
    companyName: account.name,
    atsProvider: pick(rng, ["greenhouse", "lever"] as const),
    openRolesByTeam: byTeam,
    totalOpenRoles: total,
    snapshotAt: observedAt,
  };

  return [{
    source: "greenhouse_lever_ats",
    weight: Math.min(1, total / 12),
    label: `${total} open roles via ${payload.atsProvider}`,
    rawPayload: payload,
    observedAt,
  }];
}
