"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Building2,
  Briefcase,
  Mail,
} from "lucide-react";
import { getCard } from "@/data/cards";
import IntentBadge from "@/components/IntentBadge";
import SignalStack from "@/components/SignalStack";
import AgentChip from "@/components/AgentChip";
import LaneTag from "@/components/LaneTag";
import ImpactChip from "@/components/ImpactChip";
import PoweredByChip from "@/components/PoweredByChip";
import type { CardBase, Option } from "@/data/types";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convertCardDoc } from "@/lib/convexAdapters";

export default function CardDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const staticCard = useMemo(() => getCard(params.id), [params.id]);

  // If not a static demo id, try Convex (skip the query when we already have static).
  const convexDoc = useQuery(
    api.cards.get,
    staticCard ? "skip" : { cardId: params.id as Id<"cards"> },
  );

  const approve = useMutation(api.cards.approve);
  const decline = useMutation(api.cards.decline);
  const skip = useMutation(api.cards.skip);
  const [busy, setBusy] = useState<null | "approve" | "decline" | "skip">(null);

  const card: CardBase | null = staticCard
    ? staticCard
    : convexDoc
      ? convertCardDoc(convexDoc as any)
      : null;

  if (!staticCard && convexDoc === undefined) {
    return <LoadingShell />;
  }
  if (!card) {
    return <NotFoundShell />;
  }

  const isConvexCard = !staticCard;

  async function onPrimary() {
    if (!isConvexCard) {
      // Demo card — no Convex mutation; just bounce to Today.
      router.push("/");
      return;
    }
    try {
      setBusy("approve");
      await approve({ cardId: params.id as Id<"cards"> });
      router.push("/");
    } finally {
      setBusy(null);
    }
  }
  async function onDecline() {
    if (!isConvexCard) {
      router.push("/");
      return;
    }
    try {
      setBusy("decline");
      await decline({ cardId: params.id as Id<"cards"> });
      router.push("/");
    } finally {
      setBusy(null);
    }
  }
  async function onSkip() {
    if (!isConvexCard) {
      router.push("/");
      return;
    }
    try {
      setBusy("skip");
      await skip({ cardId: params.id as Id<"cards"> });
      router.push("/");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <DetailHeader card={card} />

      <div className="px-4 pb-8 space-y-3">
        {card.type === "HOT_REPLY" && <HotReplyBody card={card} />}
        {card.type === "NEEDS_JUDGMENT" && <NeedsJudgmentBody card={card} />}
        {card.type === "NEW_SEGMENT" && <NewSegmentBody card={card} />}
        {card.type === "WASTE_ALERT" && <WasteBody card={card} />}
        {card.type === "RETENTION_RISK" && <RetentionBody card={card} />}
        {card.type === "PREP_RECOMMENDATION" && <PrepBody card={card} />}

        <ActionBar
          actions={card.actions}
          primaryTone={primaryTone(card)}
          onPrimary={onPrimary}
          onSecondary={onDecline}
          onTertiary={onSkip}
          busy={busy}
        />
      </div>
    </div>
  );
}

function primaryTone(card: CardBase): "brand" | "ink" {
  if (card.type === "NEEDS_JUDGMENT" || card.type === "PREP_RECOMMENDATION") {
    return "ink";
  }
  return "brand";
}

function DetailHeader({ card }: { card: CardBase }) {
  return (
    <header className="px-4 pt-3 pb-4 bg-canvas">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Back to today"
          className="-ml-2 h-11 w-11 rounded-full flex items-center justify-center text-ink-700 active:bg-line/70"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </Link>
        <div className="flex items-center gap-1.5">
          {card.lane && <LaneTag lane={card.lane} />}
        </div>
        <div className="w-11" aria-hidden />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <AgentChip agent={card.agent} />
        {card.poweredBy && <PoweredByChip agent={card.poweredBy} />}
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="text-[22px] leading-[27px] font-semibold tracking-tightish text-ink-900">
          {card.title}
        </h1>
        {typeof card.intentScore === "number" && (
          <IntentBadge
            score={card.intentScore}
            level={card.intentLevel}
            size="lg"
          />
        )}
      </div>
      {card.subtitle && (
        <p className="mt-1.5 text-[13px] text-ink-500">{card.subtitle}</p>
      )}

      {typeof card.impactUSD === "number" && card.impactUSD > 0 && (
        <div className="mt-2.5">
          <ImpactChip
            usd={card.impactUSD}
            kind={card.impactKind}
            size="md"
            tone="brand"
          />
        </div>
      )}
    </header>
  );
}

/* ---------------- Bodies ---------------- */

function HotReplyBody({ card }: { card: CardBase }) {
  return (
    <>
      {card.aiRecommendation && (
        <Panel kicker="AI Recommendation" tone="brand">
          <p className="text-[15px] leading-[20px] text-ink-900 font-medium">
            {card.aiRecommendation}
          </p>
          <p className="mt-2 text-[12px] text-ink-500">
            Generated overnight by Gemini from fresh intent signals.
          </p>
        </Panel>
      )}

      {card.aiReplyDraft && (
        <Panel kicker="AI-drafted reply" icon={<Mail size={14} strokeWidth={2} />} tone="brand">
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-[19px] text-ink-900">
            {card.aiReplyDraft}
          </pre>
          <p className="mt-2 text-[12px] text-ink-500">
            Approve below to send via Resend; Edit Quote to tweak before sending.
          </p>
        </Panel>
      )}

      {card.trigger && (
        <Panel kicker="Trigger" icon={<MessageSquare size={14} strokeWidth={2} />}>
          <p className="text-[14px] text-ink-900">{card.trigger}</p>
        </Panel>
      )}

      {card.signals && card.signals.length > 0 && (
        <Panel kicker="Why this is hot">
          <SignalStack signals={card.signals} />
        </Panel>
      )}

      {card.business && (
        <Link
          href={`/catering/businesses/${slugify(card.business)}`}
          className="block bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] px-4 py-3.5 active:bg-canvas"
        >
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Open business profile
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink-900">
            {card.business} →
          </p>
        </Link>
      )}
    </>
  );
}

function NewSegmentBody({ card }: { card: CardBase }) {
  return (
    <>
      {card.aiRecommendation && (
        <Panel kicker="AI Recommendation" tone="brand">
          <p className="text-[15px] leading-[20px] text-ink-900 font-medium">
            {card.aiRecommendation}
          </p>
        </Panel>
      )}
      {card.segmentCriteria && card.segmentCriteria.length > 0 && (
        <Panel kicker="Segment criteria">
          <ul className="space-y-1.5">
            {card.segmentCriteria.map((c) => (
              <li key={c} className="flex items-center gap-2 text-[13.5px] text-ink-700">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                {c}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {card.segmentSamples && card.segmentSamples.length > 0 && (
        <Panel kicker="Sample names">
          <div className="flex flex-wrap gap-1.5">
            {card.segmentSamples.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1.5 text-[12.5px] font-medium text-ink-700"
              >
                <Building2 size={12} strokeWidth={2} className="text-ink-400" />
                {n}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {card.segmentSequence && card.segmentSequence.length > 0 && (
        <Panel kicker="AI sequence" icon={<Sparkles size={14} strokeWidth={2} />}>
          <ol className="space-y-2.5">
            {card.segmentSequence.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 num">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14px] text-ink-900">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {card.segmentExpectedReply && (
        <Panel kicker="Expected outcome">
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] text-ink-700">Reply rate</p>
            <p className="text-[20px] font-semibold text-ink-900 num">
              {card.segmentExpectedReply.split(" ")[0]}
            </p>
          </div>
        </Panel>
      )}
    </>
  );
}

function NeedsJudgmentBody({ card }: { card: CardBase }) {
  return (
    <>
      <div className="rounded-2xl bg-brand/[0.06] ring-1 ring-brand/20 px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-brand">
          <AlertCircle size={16} strokeWidth={2.2} />
          <p className="text-[12px] uppercase tracking-[0.08em] font-semibold">
            AI couldn't decide — needs your call
          </p>
        </div>
        <p className="mt-2 text-[14px] text-ink-700 leading-[19px]">
          {card.aiRecommendation ?? card.subtitle ?? card.title}
        </p>
      </div>

      {card.options && card.options.length > 0 && (
        <Panel kicker="Options · pick one">
          <ul className="space-y-2.5">
            {card.options.map((o) => (
              <JudgmentOption key={o.letter} option={o} />
            ))}
          </ul>
        </Panel>
      )}

      <p className="px-1 text-[12px] text-ink-400 leading-[16px]">
        Your decision becomes training data — the agent will weigh future
        similar requests against the path you choose here.
      </p>
    </>
  );
}

function JudgmentOption({ option }: { option: Option }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-xl bg-canvas">
      <span className="mt-0.5 h-7 w-7 rounded-full bg-brand text-white text-[12px] font-bold flex items-center justify-center shrink-0 uppercase">
        {option.letter}
      </span>
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-ink-900">{option.title}</p>
        <p className="text-[12.5px] text-ink-500 leading-[17px] mt-0.5">
          {option.predicted}
        </p>
      </div>
    </li>
  );
}

function WasteBody({ card }: { card: CardBase }) {
  return (
    <Panel kicker="AI Recommendation" tone="brand">
      <p className="text-[15px] leading-[20px] text-ink-900 font-medium">
        {card.aiRecommendation}
      </p>
    </Panel>
  );
}

function RetentionBody({ card }: { card: CardBase }) {
  return (
    <>
      <Panel kicker="AI Recommendation" tone="brand">
        <p className="text-[15px] leading-[20px] text-ink-900 font-medium">
          {card.aiRecommendation}
        </p>
        {card.lapsedTrigger && (
          <p className="mt-1.5 text-[12px] text-ink-400">Trigger: {card.lapsedTrigger}</p>
        )}
      </Panel>

      {card.lapsedAccounts && (
        <Panel kicker="Lapsed accounts">
          <ul className="divide-y divide-line">
            {card.lapsedAccounts.map((a) => (
              <li key={a.name} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-[14.5px] font-semibold text-ink-900">{a.name}</p>
                  <p className="text-[12px] text-ink-400">
                    Last order ${a.lastOrderUSD} · {a.lastOrderDate}
                  </p>
                </div>
                <Briefcase size={16} strokeWidth={1.75} className="text-ink-300" />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

function PrepBody({ card }: { card: CardBase }) {
  return (
    <Panel kicker="AI Recommendation" tone="brand">
      <p className="text-[15px] leading-[20px] text-ink-900 font-medium">{card.title}</p>
      {card.prepOrderId && (
        <p className="mt-1.5 text-[12px] text-ink-500">
          Driven by inbound catering order {card.prepOrderId}.
        </p>
      )}
    </Panel>
  );
}

/* ---------------- Generic UI ---------------- */

function Panel({
  kicker,
  icon,
  tone,
  children,
}: {
  kicker: string;
  icon?: React.ReactNode;
  tone?: "brand";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl px-4 py-3.5 shadow-card ${
        tone === "brand"
          ? "bg-white ring-1 ring-brand/15"
          : "bg-white ring-1 ring-black/[0.03]"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 mb-2 ${
          tone === "brand" ? "text-brand" : "text-ink-400"
        }`}
      >
        {icon}
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold">{kicker}</p>
      </div>
      {children}
    </section>
  );
}

function ActionBar({
  actions,
  primaryTone,
  onPrimary,
  onSecondary,
  onTertiary,
  busy,
}: {
  actions: string[];
  primaryTone: "brand" | "ink";
  onPrimary: () => void;
  onSecondary: () => void;
  onTertiary: () => void;
  busy: null | "approve" | "decline" | "skip";
}) {
  if (actions.length === 0) return null;
  const [primary, ...rest] = actions;
  return (
    <div className="pt-2 flex flex-col gap-2">
      <button
        type="button"
        onClick={onPrimary}
        disabled={busy !== null}
        className={`w-full min-h-[48px] rounded-xl text-[15px] font-semibold tracking-tightish active:opacity-90 disabled:opacity-60 ${
          primaryTone === "brand" ? "bg-brand text-white" : "bg-ink-900 text-white"
        }`}
      >
        {busy === "approve" ? "Sending…" : primary}
      </button>
      {rest.length > 0 && (
        <div className={`grid gap-2 ${rest.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {rest.map((a, i) => {
            const handler = i === 0 ? onSecondary : onTertiary;
            const tag = i === 0 ? "decline" : "skip";
            const label =
              busy === "decline" && tag === "decline"
                ? "Declining…"
                : busy === "skip" && tag === "skip"
                  ? "Skipping…"
                  : a;
            return (
              <button
                key={a}
                type="button"
                onClick={handler}
                disabled={busy !== null}
                className="min-h-[44px] rounded-xl border border-line bg-white text-ink-900 text-[14px] font-semibold tracking-tightish active:bg-canvas disabled:opacity-60"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="px-4 pt-6 pb-8">
      <div className="h-6 w-2/3 bg-line rounded-md animate-pulse mb-3" />
      <div className="h-4 w-1/3 bg-line rounded-md animate-pulse mb-6" />
      <div className="h-28 w-full bg-line rounded-2xl animate-pulse mb-3" />
      <div className="h-28 w-full bg-line rounded-2xl animate-pulse" />
    </div>
  );
}

function NotFoundShell() {
  return (
    <div className="px-4 pt-10 text-center">
      <p className="text-[14px] text-ink-500">
        That card is no longer in your queue.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand"
      >
        ← Back to today
      </Link>
    </div>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
