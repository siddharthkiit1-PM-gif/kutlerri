/**
 * Seedable RNG — mulberry32. Inline, no deps, deterministic.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
export const range = (rng: () => number, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
