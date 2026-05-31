import Link from "next/link";
import { Moon, ChevronRight } from "lucide-react";
import { overnightSummary } from "@/data/agentActivity";

/**
 * "Agents worked while you slept" hero strip that opens the Today queue.
 * Tapping opens /agent-log for a full timeline of autonomous + needs-you actions.
 */
export default function AgentOvernightStrip() {
  const { ranTotal, autonomous, needsYou, savedMinutes, impactUSD, window: windowLabel } =
    overnightSummary;

  const usd = impactUSD >= 1000 ? `$${(impactUSD / 1000).toFixed(1)}k` : `$${impactUSD}`;

  return (
    <Link
      href="/agent-log"
      className="block mx-4 mt-1 mb-3 rounded-2xl bg-ink-900 text-white shadow-card active:opacity-95"
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-white/60">
            <Moon size={12} strokeWidth={2.2} />
            Overnight · {windowLabel}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-white/80">
            See log
            <ChevronRight size={14} strokeWidth={2} />
          </span>
        </div>

        <p className="mt-1.5 text-[16px] leading-[20px] font-semibold tracking-tightish">
          Your agents ran{" "}
          <span className="num">{ranTotal}</span> actions while you slept.
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Autonomous"  value={autonomous.toString()} tone="muted" />
          <Stat label="Need you"     value={needsYou.toString()}   tone="brand" />
          <Stat label="Time saved"   value={`${savedMinutes}m`}    tone="muted" />
        </div>

        <p className="mt-2.5 text-[11.5px] text-white/50">
          <span className="text-white/80 font-semibold num">{usd}</span> of impact
          surfaced or applied
        </p>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "brand";
}) {
  return (
    <div className="rounded-xl bg-white/[0.06] px-3 py-2">
      <p className="text-[10.5px] uppercase tracking-[0.07em] font-semibold text-white/50">
        {label}
      </p>
      <p
        className="mt-0.5 text-[17px] font-semibold num text-white"
        style={tone === "brand" ? { color: "#C5BAFF" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
