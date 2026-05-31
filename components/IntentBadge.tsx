import type { IntentLevel } from "@/data/types";

export function levelFromScore(score: number): IntentLevel {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

export function labelFromLevel(l: IntentLevel) {
  return l === "hot" ? "Hot" : l === "warm" ? "Warm" : "Cold";
}

export default function IntentBadge({
  score,
  level,
  size = "md",
  showLabel = true,
}: {
  score: number;
  level?: IntentLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const l: IntentLevel = level ?? levelFromScore(score);

  const tone = {
    hot:  "bg-hot-bg text-hot-fg",
    warm: "bg-warm-bg text-warm-fg",
    cold: "bg-cold-bg text-cold-fg",
  }[l];

  const dot = {
    hot:  "bg-hot-bar",
    warm: "bg-warm-bar",
    cold: "bg-cold-bar",
  }[l];

  const padding =
    size === "lg" ? "px-3 py-1.5 text-13" :
    size === "sm" ? "px-2 py-0.5 text-11" :
                    "px-2.5 py-1 text-[12px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-tightish ${tone} ${padding}`}
      aria-label={`Intent ${score} (${labelFromLevel(l)})`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      <span className="num">{score}</span>
      {showLabel && <span className="opacity-80">· {labelFromLevel(l)}</span>}
    </span>
  );
}
