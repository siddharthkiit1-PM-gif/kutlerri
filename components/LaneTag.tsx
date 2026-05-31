import { Sparkles, AlertCircle } from "lucide-react";
import type { Lane } from "@/data/types";

/** Two clear lanes — "Autonomous" (agent ran it) vs "Needs you" (decision). */
export default function LaneTag({
  lane,
  size = "sm",
}: {
  lane: Lane;
  size?: "sm" | "md";
}) {
  const isNeedsYou = lane === "needs-you";
  const pad =
    size === "md" ? "px-2.5 py-1 text-[11.5px]" : "px-1.5 py-0.5 text-[10.5px]";
  const colors = isNeedsYou
    ? "bg-brand/10 text-brand ring-1 ring-brand/15"
    : "bg-ink-900/[0.04] text-ink-500";
  const Icon = isNeedsYou ? AlertCircle : Sparkles;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-[0.06em] ${colors} ${pad}`}
    >
      <Icon size={size === "md" ? 12 : 10} strokeWidth={2.2} aria-hidden />
      {isNeedsYou ? "Needs you" : "Autonomous"}
    </span>
  );
}
