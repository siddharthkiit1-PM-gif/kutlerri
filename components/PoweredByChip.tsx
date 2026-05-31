import { Link2 } from "lucide-react";
import type { Agent } from "@/data/types";

/** "Powered by sibling agent" attribution — used on cross-agent cards. */
export default function PoweredByChip({ agent }: { agent: Agent }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-500 ring-1 ring-line">
      <Link2 size={10} strokeWidth={2.2} className="text-ink-400" aria-hidden />
      Powered by <span className="text-ink-700 font-semibold">{agent}</span>
    </span>
  );
}
