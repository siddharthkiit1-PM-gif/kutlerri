import Link from "next/link";
import {
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { CardBase } from "@/data/types";
import IntentBadge from "./IntentBadge";
import AgentChip from "./AgentChip";
import LaneTag from "./LaneTag";
import ImpactChip from "./ImpactChip";
import PoweredByChip from "./PoweredByChip";

export default function TodayCard({ card }: { card: CardBase }) {
  const isHero = card.type === "NEEDS_JUDGMENT";

  return (
    <Link
      href={`/card/${card.id}`}
      className={`block bg-white rounded-2xl shadow-card transition-colors ${
        isHero ? "ring-1 ring-brand/30" : "ring-1 ring-black/[0.03]"
      } active:bg-canvas`}
    >
      {/* Header: agent chip + lane tag + intent badge */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AgentChip agent={card.agent} />
          {card.crossAgent && (
            <span className="text-ink-300 text-[11px] font-medium normal-case">·</span>
          )}
          {card.crossAgent && (
            <span className="text-[10.5px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Cross-agent
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {card.lane && <LaneTag lane={card.lane} />}
          {typeof card.intentScore === "number" && (
            <IntentBadge score={card.intentScore} level={card.intentLevel} showLabel={false} size="sm" />
          )}
        </div>
      </div>

      {/* Title block */}
      <div className="px-4 pb-3">
        <h3 className="text-[16px] leading-[20px] font-semibold tracking-tightish text-ink-900">
          {card.title}
        </h3>
        {card.subtitle && (
          <p className="mt-1 text-[13px] leading-[18px] text-ink-500">
            {card.subtitle}
          </p>
        )}

        {(typeof card.impactUSD === "number" && card.impactUSD > 0) || card.poweredBy ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {typeof card.impactUSD === "number" && card.impactUSD > 0 && (
              <ImpactChip usd={card.impactUSD} kind={card.impactKind} />
            )}
            {card.poweredBy && <PoweredByChip agent={card.poweredBy} />}
          </div>
        ) : null}
      </div>

      {/* Body switches by type */}
      <div className="px-4 pb-3">{renderBody(card)}</div>

      {/* Footer */}
      <div className="px-4 pt-2 pb-3.5 border-t border-line flex items-center justify-between">
        {isHero ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand">
            <AlertCircle size={14} strokeWidth={2.2} />
            Needs your call
          </span>
        ) : (
          <span className="text-[12px] text-ink-400 truncate">
            {primaryActionHint(card)}
          </span>
        )}
        <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-ink-700">
          Open
          <ChevronRight size={14} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function primaryActionHint(card: CardBase) {
  if (card.type === "HOT_REPLY") return card.trigger ?? "";
  if (card.type === "WASTE_ALERT") return card.aiRecommendation ?? "";
  if (card.type === "NEW_SEGMENT") return `Expected reply: ${card.segmentExpectedReply ?? ""}`;
  if (card.type === "RETENTION_RISK") return card.lapsedTrigger ?? "";
  if (card.type === "PREP_RECOMMENDATION") return `Auto-applied to order ${card.prepOrderId ?? ""}`;
  return "";
}

function renderBody(card: CardBase) {
  switch (card.type) {
    case "HOT_REPLY":
      return (
        <div className="space-y-2.5">
          {card.trigger && (
            <p className="text-[12px] text-ink-500">
              <span className="text-ink-700 font-medium">Trigger:</span> {card.trigger}
            </p>
          )}
          {card.signals && (
            <ul className="space-y-1.5">
              {card.signals.slice(0, 3).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1 w-1 rounded-full bg-ink-300 shrink-0" />
                  <span className="text-[12.5px] text-ink-700 leading-[17px]">
                    {s.label}
                    <span className="text-ink-400"> — {s.source}</span>
                  </span>
                </li>
              ))}
              {card.signals.length > 3 && (
                <li className="text-[11.5px] text-ink-400 pl-3">
                  +{card.signals.length - 3} more signal
                  {card.signals.length - 3 > 1 ? "s" : ""}
                </li>
              )}
            </ul>
          )}
          {card.aiRecommendation && <AIRecommendation text={card.aiRecommendation} />}
        </div>
      );

    case "WASTE_ALERT":
      return (
        <div className="space-y-2.5">
          {card.aiRecommendation && <AIRecommendation text={card.aiRecommendation} />}
        </div>
      );

    case "NEW_SEGMENT":
      return (
        <div className="space-y-2.5">
          {card.segmentCriteria && (
            <p className="text-[12px] text-ink-500">
              <span className="text-ink-700 font-medium">Criteria:</span>{" "}
              {card.segmentCriteria.join(" · ")}
            </p>
          )}
          {card.segmentSamples && (
            <p className="text-[12.5px] text-ink-700 leading-[17px]">
              {card.segmentSamples.join(", ")}{" "}
              <span className="text-ink-400">+14 others</span>
            </p>
          )}
          {card.segmentSequence && (
            <div className="flex flex-wrap gap-1.5">
              {card.segmentSequence.map((step, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-canvas text-[11.5px] text-ink-700 font-medium"
                >
                  {step}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case "RETENTION_RISK":
      return (
        <div className="space-y-2.5">
          {card.lapsedAccounts && (
            <ul className="space-y-1.5">
              {card.lapsedAccounts.map((a) => (
                <li
                  key={a.name}
                  className="flex items-baseline justify-between text-[12.5px]"
                >
                  <span className="text-ink-700">{a.name}</span>
                  <span className="text-ink-400 num">
                    ${a.lastOrderUSD} · {a.lastOrderDate}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {card.aiRecommendation && <AIRecommendation text={card.aiRecommendation} />}
        </div>
      );

    case "PREP_RECOMMENDATION":
      return (
        <p className="text-[12.5px] text-ink-500">
          Auto-applied to tomorrow&apos;s prep sheet unless declined.
        </p>
      );

    case "NEEDS_JUDGMENT":
      return (
        <div className="space-y-2">
          <p className="text-[12.5px] text-ink-700 leading-[17px]">
            {card.needsJudgmentReason}
          </p>
          {card.options && (
            <ul className="space-y-1.5">
              {card.options.map((o) => (
                <li
                  key={o.letter}
                  className="flex items-start gap-2 text-[12.5px]"
                >
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center shrink-0">
                    {o.letter}
                  </span>
                  <span className="text-ink-700">
                    {o.title}
                    <span className="text-ink-400"> — {o.predicted}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
  }
}

function AIRecommendation({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-brand/[0.06] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-brand mb-0.5">
        AI Recommendation
      </p>
      <p className="text-[13px] text-ink-900 leading-[17px]">{text}</p>
    </div>
  );
}
