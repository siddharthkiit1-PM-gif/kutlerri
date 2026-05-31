import Link from "next/link";
import { Sparkles, ChevronRight, Building2 } from "lucide-react";

export default function CampaignBuilderPage() {
  return (
    <section className="px-4 py-4 space-y-3">
      <Block kicker="Step 1 · Audience">
        <p className="text-[14px] text-ink-900 font-medium">
          17 hot prospects near Round Rock
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["50+ employees", "Hiring spike 14d", "5mi radius"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-canvas text-[12px] font-medium text-ink-700"
            >
              {t}
            </span>
          ))}
        </div>
        <Link
          href="#"
          className="mt-3 flex items-center justify-between min-h-[44px] rounded-xl border border-line bg-white px-3 text-[13.5px] text-ink-700"
        >
          <span className="inline-flex items-center gap-2">
            <Building2 size={14} strokeWidth={1.75} className="text-ink-400" />
            Preview 17 names
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="text-ink-300" />
        </Link>
      </Block>

      <Block kicker="Step 2 · Sequence" icon={<Sparkles size={14} strokeWidth={2} />}>
        <ol className="space-y-2.5">
          {[
            { d: "Day 0", c: "Email", h: "Subject auto-tuned per persona" },
            { d: "Day 4", c: "LinkedIn DM", h: "Connect first, then warm reply" },
            { d: "Day 7", c: "Call", h: "Office-manager direct dial preferred" },
          ].map((s, i) => (
            <li key={s.d} className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 num">
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] text-ink-900">
                  {s.d} — {s.c}
                </p>
                <p className="text-[12px] text-ink-400">{s.h}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>

      <Block kicker="Step 3 · Forecast">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Reply rate" value="18%" />
          <Metric label="Meetings"   value="≈3" />
          <Metric label="Booked $"   value="≈$5.4k" />
        </div>
        <p className="mt-2 text-[11.5px] text-ink-400">
          Based on prior 6 campaigns in this segment.
        </p>
      </Block>

      <div className="pt-1 flex flex-col gap-2">
        <button className="w-full min-h-[48px] rounded-xl bg-brand text-white text-[15px] font-semibold active:opacity-90">
          Approve & Launch
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="min-h-[44px] rounded-xl border border-line bg-white text-ink-900 text-[14px] font-semibold active:bg-canvas">
            Edit Segment
          </button>
          <button className="min-h-[44px] rounded-xl border border-line bg-white text-ink-900 text-[14px] font-semibold active:bg-canvas">
            Schedule
          </button>
        </div>
      </div>
    </section>
  );
}

function Block({
  kicker,
  icon,
  children,
}: {
  kicker: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3.5">
      <div className="flex items-center gap-1.5 mb-2 text-ink-400">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold">
          {kicker}
        </p>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-canvas px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.06em] font-semibold text-ink-400">
        {label}
      </p>
      <p className="text-[16px] font-semibold text-ink-900 num mt-0.5">{value}</p>
    </div>
  );
}
