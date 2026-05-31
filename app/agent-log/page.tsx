"use client";
import Link from "next/link";
import { ArrowLeft, Undo2, ChevronRight, Moon } from "lucide-react";
import AgentChip from "@/components/AgentChip";
import LaneTag from "@/components/LaneTag";
import ImpactChip from "@/components/ImpactChip";
import { overnightActions, overnightSummary } from "@/data/agentActivity";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type DisplayAction = {
  id: string;
  time: string;
  agent: "Catering" | "Waste Control" | "Guest Retention" | "Prep Forecast";
  summary: string;
  lane: "needs-you" | "autonomous";
  impactUSD?: number;
  revertable?: boolean;
  href?: string;
};

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function AgentLogPage() {
  const liveRuns = useQuery(api.agentRuns.latest, { limit: 30 });

  const live: DisplayAction[] = (liveRuns ?? []).map((r) => ({
    id: String(r._id),
    time: formatTime(r.runAt),
    agent: r.agent,
    summary: r.summary,
    lane: r.lane,
    impactUSD: r.impactUSD,
    revertable: r.revertable,
    href: r.href ?? undefined,
  }));

  // Use Convex runs when present, else fall back to static demo data.
  const actions: DisplayAction[] = live.length > 0 ? live : (overnightActions as DisplayAction[]);

  const ranTotal = live.length > 0 ? live.length : overnightSummary.ranTotal;
  const autonomous =
    live.length > 0
      ? live.filter((a) => a.lane === "autonomous").length
      : overnightSummary.autonomous;
  const needsYou =
    live.length > 0
      ? live.filter((a) => a.lane === "needs-you").length
      : overnightSummary.needsYou;
  const savedMinutes = overnightSummary.savedMinutes;
  const impactUSD =
    live.length > 0
      ? live.reduce((s, a) => s + (a.impactUSD ?? 0), 0)
      : overnightSummary.impactUSD;
  const windowLabel = overnightSummary.window;
  const usd = impactUSD >= 1000 ? `$${(impactUSD / 1000).toFixed(1)}k` : `$${impactUSD}`;

  return (
    <div>
      <header className="px-4 pt-3 pb-4 bg-canvas">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to today"
            className="-ml-2 h-11 w-11 rounded-full flex items-center justify-center text-ink-700 active:bg-line/70"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Agent activity
          </span>
          <div className="w-11" />
        </div>

        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            <Moon size={12} strokeWidth={2.2} />
            Overnight · {windowLabel}
          </span>
          <h1 className="mt-1 text-[22px] leading-[26px] font-semibold tracking-tightish text-ink-900">
            Your agents worked while you slept
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            <span className="text-ink-900 font-semibold num">{ranTotal}</span> actions
            · <span className="num">{autonomous}</span> autonomous ·{" "}
            <span className="text-brand font-semibold num">{needsYou}</span> need you
            · <span className="num">{savedMinutes}m</span> saved ·{" "}
            <span className="text-ink-900 font-semibold num">{usd}</span> impact
          </p>
        </div>
      </header>

      <section className="px-4 pb-8">
        <ol className="relative border-l border-line ml-4 pl-5 space-y-3.5">
          {actions.map((a) => (
            <li key={a.id} className="relative">
              <span
                className={`absolute -left-[26px] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-canvas ${
                  a.lane === "needs-you" ? "bg-brand" : "bg-ink-300"
                }`}
                aria-hidden
              />

              <article className="rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <AgentChip agent={a.agent} showLabel={false} />
                    <span className="text-[11.5px] text-ink-400 num shrink-0">
                      {a.time}
                    </span>
                  </div>
                  <LaneTag lane={a.lane} />
                </div>

                <p className="mt-2 text-[13.5px] leading-[18px] text-ink-900">
                  {a.summary}
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {typeof a.impactUSD === "number" && a.impactUSD > 0 && (
                      <ImpactChip usd={a.impactUSD} />
                    )}
                    {a.revertable && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-ink-500 ring-1 ring-line bg-white active:bg-canvas"
                      >
                        <Undo2 size={11} strokeWidth={2.2} />
                        Revert
                      </button>
                    )}
                  </div>
                  {a.href && (
                    <Link
                      href={a.href}
                      className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-brand"
                    >
                      Open
                      <ChevronRight size={14} strokeWidth={2} />
                    </Link>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>

        <p className="mt-5 text-[12px] text-ink-400 px-1 leading-[17px]">
          You deserve no more than 15 minutes a day. Anything you can revert is
          fair game — the agent will learn from your choice.
        </p>
      </section>
    </div>
  );
}
