import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { businesses, getBusiness } from "@/data/businesses";
import IntentBadge from "@/components/IntentBadge";
import type { BusinessDetail, Business } from "@/data/types";

export function generateStaticParams() {
  return businesses.map((b) => ({ id: b.id }));
}

export default function BusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = getBusiness(params.id);
  if (!data) notFound();

  // Acme has full detail; others get a slim detail built from the row.
  const detail: BusinessDetail =
    "scoreBreakdown" in data
      ? (data as BusinessDetail)
      : buildSlimDetail(data as Business);

  return (
    <div>
      <header className="px-4 pt-3 pb-4 bg-canvas">
        <div className="flex items-center justify-between">
          <Link
            href="/catering/businesses"
            aria-label="Back to businesses"
            className="-ml-2 h-11 w-11 rounded-full flex items-center justify-center text-ink-700 active:bg-line/70"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Business
          </span>
          <div className="w-11" />
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[26px] font-semibold tracking-tightish text-ink-900 truncate">
              {detail.name}
            </h1>
            <p className="mt-1 text-[12.5px] text-ink-500">
              {detail.industry}
            </p>
            <p className="mt-1 text-[12px] text-ink-400 flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Users size={12} strokeWidth={1.75} /> {detail.size}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} strokeWidth={1.75} /> {detail.distanceMi}mi
              </span>
            </p>
          </div>
          <IntentBadge
            score={detail.intent}
            level={detail.level}
            size="lg"
          />
        </div>
      </header>

      <div className="px-4 pb-8 space-y-3">
        {/* Recommended action — prominent at top */}
        <section className="rounded-2xl bg-white ring-1 ring-brand/20 shadow-card px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-brand">
            Recommended action
          </p>
          <p className="mt-1.5 text-[15px] leading-[20px] font-semibold text-ink-900">
            {detail.recommendation}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 min-h-[44px] rounded-xl bg-brand text-white text-[14px] font-semibold active:opacity-90"
            >
              Approve & Send
            </button>
            <button
              type="button"
              className="min-h-[44px] px-4 rounded-xl border border-line bg-white text-ink-900 text-[14px] font-semibold active:bg-canvas"
            >
              Edit
            </button>
          </div>
        </section>

        {/* Score breakdown */}
        <section className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Intent score breakdown
            </p>
            <p className="text-[20px] font-semibold text-ink-900 num">
              {detail.intent}
            </p>
          </div>

          <StackedBar segments={detail.scoreBreakdown} total={detail.intent} />

          <ul className="mt-3.5 space-y-2.5">
            {detail.scoreBreakdown.map((seg, i) => (
              <li key={seg.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13.5px] text-ink-900 font-medium truncate">
                      {seg.label}
                    </p>
                    <p className="text-[11.5px] text-ink-400 truncate">
                      {seg.source}
                    </p>
                  </div>
                </div>
                <p className="text-[13.5px] font-semibold text-ink-700 num">
                  +{seg.pts}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Contacts */}
        <section className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Contacts · {detail.contacts.length}
            </p>
          </div>
          <ul className="divide-y divide-line">
            {detail.contacts.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-canvas text-ink-700 text-[12px] font-semibold flex items-center justify-center shrink-0">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink-900 truncate">
                    {c.name}
                  </p>
                  <p className="text-[12px] text-ink-500 truncate">
                    {c.title} · {c.activity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Activity timeline */}
        <section className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400 mb-3">
            Activity timeline
          </p>
          <ol className="relative ml-1 space-y-3 border-l border-line pl-4">
            {detail.activity.map((ev, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full bg-ink-300" />
                <p className="text-[11.5px] uppercase tracking-[0.05em] text-ink-400 font-semibold">
                  {ev.date}
                </p>
                <p className="text-[13.5px] text-ink-900 mt-0.5 leading-[18px]">
                  {ev.label}
                </p>
                {ev.source && (
                  <p className="text-[11.5px] text-ink-400 mt-0.5">
                    {ev.source}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

const SEGMENT_COLORS = ["#5B3FFF", "#8C75FF", "#B7A8FF", "#DDD4FF"];

function StackedBar({
  segments,
  total,
}: {
  segments: { label: string; pts: number }[];
  total: number;
}) {
  // total may differ from sum (we trust the displayed score = total)
  const sum = segments.reduce((a, s) => a + s.pts, 0) || 100;
  return (
    <div className="w-full">
      <div
        className="h-2.5 w-full rounded-full bg-canvas overflow-hidden flex"
        role="img"
        aria-label={`Score breakdown summing to ${total}`}
      >
        {segments.map((s, i) => {
          const pct = (s.pts / sum) * 100;
          return (
            <div
              key={s.label}
              style={{
                width: `${pct}%`,
                background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
              }}
              aria-hidden
            />
          );
        })}
      </div>
    </div>
  );
}

function buildSlimDetail(b: Business): BusinessDetail {
  return {
    ...b,
    recommendation:
      b.level === "hot"
        ? "Quote based on top signal · 24hr turnaround"
        : b.level === "warm"
        ? "Add to next 3-touch sequence"
        : "Keep dormant · revisit when a signal fires",
    scoreBreakdown: defaultBreakdown(b),
    contacts: [
      { id: `${b.id}-c1`, businessId: b.id, name: "Primary contact", title: "Office Manager", activity: "No recent activity", initials: "PC" },
    ],
    activity: [
      { date: "Recently", label: b.topSignal, source: "Auto-detected" },
      { date: "Earlier",  label: b.lastTouchpoint, source: "CRM" },
    ],
  };
}

function defaultBreakdown(b: Business) {
  // Distribute the score across 4 buckets proportionally to feel believable.
  const split = (n: number) => Math.max(2, Math.round(b.intent * n));
  return [
    { label: "Internal signals", pts: split(0.40), source: "POS guest match (Toast)" },
    { label: "Funding events",   pts: split(0.25), source: "Crunchbase" },
    { label: "Hiring activity",  pts: split(0.20), source: "LinkedIn Jobs" },
    { label: "Email engagement", pts: split(0.15), source: "Internal" },
  ];
}

