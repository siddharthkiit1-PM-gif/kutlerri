import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import IntentBadge from "@/components/IntentBadge";
import { businesses } from "@/data/businesses";

export default function BusinessesPage() {
  const sorted = [...businesses].sort((a, b) => b.intent - a.intent);
  const hot = sorted.filter((b) => b.level === "hot").length;
  const warm = sorted.filter((b) => b.level === "warm").length;
  const cold = sorted.filter((b) => b.level === "cold").length;

  return (
    <section className="px-4 py-4">
      {/* Summary row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          <span className="num">{sorted.length}</span> businesses ranked by intent
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-full text-[12px] font-semibold text-ink-700 border border-line bg-white"
        >
          <Filter size={14} strokeWidth={1.75} />
          Filter
        </button>
      </div>

      <div className="flex gap-3 mb-4 text-[11px] text-ink-500">
        <Tally label="Hot"  count={hot}  dot="bg-hot-bar" />
        <Tally label="Warm" count={warm} dot="bg-warm-bar" />
        <Tally label="Cold" count={cold} dot="bg-cold-bar" />
      </div>

      <ul className="bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] overflow-hidden divide-y divide-line">
        {sorted.map((b) => (
          <li key={b.id}>
            <Link
              href={`/catering/businesses/${b.id}`}
              className="block px-4 py-3.5 active:bg-canvas"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink-900 tracking-tightish truncate">
                    {b.name}
                  </p>
                  <p className="text-[12px] text-ink-500 truncate">
                    {b.industry} · {b.size} · {b.distanceMi}mi
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <IntentBadge score={b.intent} level={b.level} size="sm" showLabel={false} />
                  <ChevronRight size={16} strokeWidth={1.75} className="text-ink-300" />
                </div>
              </div>

              <p className="mt-2 text-[12.5px] text-ink-700 leading-[17px]">
                {b.topSignal}
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">
                {b.lastTouchpoint}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tally({
  label,
  count,
  dot,
}: {
  label: string;
  count: number;
  dot: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="num text-ink-900 font-semibold">{count}</span>
      <span>{label}</span>
    </span>
  );
}
