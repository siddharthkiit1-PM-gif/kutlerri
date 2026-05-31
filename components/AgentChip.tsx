import {
  ChefHat,
  Trash2,
  Users,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { Agent } from "@/data/types";

export const AGENT_META: Record<
  Agent,
  { icon: LucideIcon; chip: string; short: string }
> = {
  "Catering":        { icon: ChefHat, chip: "Catering Agent",       short: "Catering" },
  "Waste Control":   { icon: Trash2,  chip: "Waste Control Agent",  short: "Waste" },
  "Guest Retention": { icon: Users,   chip: "Guest Retention Agent",short: "Retention" },
  "Prep Forecast":   { icon: Wheat,   chip: "Prep Forecast Agent",  short: "Prep" },
};

/** Agent icon + label chip — primary surface for "who did this work". */
export default function AgentChip({
  agent,
  tone,
  size = "sm",
  showLabel = true,
}: {
  agent: Agent;
  tone?: "brand" | "neutral";
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const meta = AGENT_META[agent];
  const Icon = meta.icon;
  const isCatering = agent === "Catering";
  const t = tone ?? (isCatering ? "brand" : "neutral");

  const iconBg =
    t === "brand"
      ? "bg-brand/10 text-brand"
      : "bg-ink-900/[0.06] text-ink-700";

  const iconBox =
    size === "md" ? "h-7 w-7" : "h-6 w-6";
  const iconPx =
    size === "md" ? 15 : 14;

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        className={`${iconBox} rounded-md flex items-center justify-center shrink-0 ${iconBg}`}
        aria-hidden
      >
        <Icon size={iconPx} strokeWidth={2} />
      </span>
      {showLabel && (
        <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-500 truncate">
          {meta.chip}
        </span>
      )}
    </span>
  );
}
