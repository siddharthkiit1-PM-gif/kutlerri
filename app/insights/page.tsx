import AppHeader from "@/components/AppHeader";
import { TrendingUp, Users, DollarSign, Activity, Timer, Sparkles } from "lucide-react";
import {
  headlineMetrics,
  minutesSavedToday,
  autonomousMix,
  weeklyBooked,
  sourceROI,
} from "@/data/insightsData";

const ICONS = [DollarSign, Activity, TrendingUp, Users];

export default function InsightsPage() {
  return (
    <div>
      <AppHeader
        eyebrow="Insights"
        title="Last 30 days"
        meta="Performance across 4 agents · ranked by $ booked"
      />

      {/* Headline metrics — 2x2 grid */}
      <section className="px-4 pb-3 grid grid-cols-2 gap-2">
        {headlineMetrics.map((m, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Tile
              key={m.label}
              icon={<Icon size={14} strokeWidth={1.75} />}
              label={m.label}
              value={m.value}
              delta={m.delta}
              hint={m.hint}
            />
          );
        })}
      </section>

      {/* Owner time tile */}
      <section className="px-4 pb-3">
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              <Timer size={12} strokeWidth={2} />
              {minutesSavedToday.label}
            </span>
            <span className="text-[11.5px] text-ink-400">
              cap <span className="num font-semibold text-ink-700">{minutesSavedToday.cap}m</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold text-ink-900 num leading-none">
              {minutesSavedToday.used}
            </span>
            <span className="text-[14px] text-ink-500">/ {minutesSavedToday.cap} min</span>
          </div>
          <div className="mt-2.5 h-2 w-full rounded-full bg-canvas overflow-hidden">
            <div
              className="h-full bg-brand"
              style={{
                width: `${Math.min(100, (minutesSavedToday.used / minutesSavedToday.cap) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[12px] text-ink-500 leading-[16px]">
            You deserve no more than 15 minutes a day. Agents handle the rest.
          </p>
        </div>
      </section>

      {/* Autonomous mix tile */}
      <section className="px-4 pb-3">
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              <Sparkles size={12} strokeWidth={2} />
              Autonomous vs needs-you
            </span>
            <span className="text-[11.5px] text-ink-500">today</span>
          </div>
          <SplitBar
            autonomous={autonomousMix.autonomous}
            needsYou={autonomousMix.needsYou}
          />
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-ink-700" />
              <span className="text-ink-700">Autonomous</span>
              <span className="text-ink-400 num">· {autonomousMix.autonomous}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-brand" />
              <span className="text-ink-700">Needs you</span>
              <span className="text-ink-400 num">· {autonomousMix.needsYou}</span>
            </span>
          </div>
          <p className="mt-2 text-[11.5px] text-ink-400">{autonomousMix.ratioLabel}</p>
        </div>
      </section>

      {/* Weekly bar chart */}
      <section className="px-4 pb-3">
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            {weeklyBooked.title}
          </p>
          <BarChart values={weeklyBooked.values} />
          <div className="flex justify-between mt-2 text-[10.5px] text-ink-400">
            {weeklyBooked.labels.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Source ROI */}
      <section className="px-4 pb-8">
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Intent source ROI · last 30d
          </p>
          <ul className="mt-3 space-y-2.5">
            {sourceROI.map((s) => (
              <li key={s.source}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-900 font-medium truncate">{s.source}</span>
                  <span className="text-ink-700 num font-semibold">
                    ${(s.bookedUSD / 1000).toFixed(s.bookedUSD >= 10000 ? 0 : 1)}k
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-canvas overflow-hidden">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${s.share * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-ink-400">
            Internal POS guest match still beats every external source — that&apos;s our moat.
          </p>
        </div>
      </section>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  delta,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  hint?: string;
}) {
  const negative = delta.includes("−");
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-ink-400">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold">
          {label}
        </p>
      </div>
      <p className="mt-1 text-[22px] font-semibold text-ink-900 num leading-none">{value}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <p
          className={`text-[11.5px] font-semibold num ${
            negative ? "text-ink-700" : "text-brand"
          }`}
        >
          {delta}
        </p>
        {hint && <span className="text-[11px] text-ink-400">· {hint}</span>}
      </div>
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-3 h-32 flex items-end gap-2">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-md bg-brand/15 relative overflow-hidden"
          style={{ height: `${(v / max) * 100}%` }}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-md bg-brand"
            style={{ height: "32%" }}
          />
        </div>
      ))}
    </div>
  );
}

function SplitBar({
  autonomous,
  needsYou,
}: {
  autonomous: number;
  needsYou: number;
}) {
  const total = autonomous + needsYou || 1;
  const aPct = (autonomous / total) * 100;
  return (
    <div className="mt-2 h-3 w-full rounded-full bg-canvas overflow-hidden flex">
      <div className="bg-ink-700" style={{ width: `${aPct}%` }} />
      <div className="bg-brand flex-1" />
    </div>
  );
}
