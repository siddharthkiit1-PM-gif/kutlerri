/**
 * Bridge between Convex's stored card shape and the legacy CardBase that
 * components/TodayCard.tsx + app/card/[id]/page.tsx already render.
 * Keeping the legacy shape lets the prototype UI consume Convex data with
 * zero component rewrites.
 */
import type { CardBase, Option } from "@/data/types";

type AnyDoc = Record<string, any>;

const LANE_MAP = { "needs-you": "needs-you", autonomous: "autonomous" } as const;

export function convertCardDoc(doc: AnyDoc): CardBase {
  const base: CardBase = {
    id: String(doc._id),
    type: doc.type,
    agent: doc.agent,
    crossAgent: !!doc.poweredBy,
    poweredBy: doc.poweredBy,
    lane: LANE_MAP[doc.lane as "needs-you" | "autonomous"],
    impactUSD: doc.impactUSD,
    impactKind: doc.impactKind,
    title: doc.title,
    subtitle: doc.subtitle,
    intentScore: doc.intentScore,
    intentLevel: doc.intentLevel,
    aiRecommendation: doc.aiRecommendation,
    actions: actionsFor(doc.type),
    aiReplyDraft: doc.aiReplyDraft,
  };

  if (doc.type === "NEW_SEGMENT" && doc.aiSegmentBrief) {
    const b = doc.aiSegmentBrief;
    base.segmentCriteria = b.criteria;
    base.segmentSamples = b.candidateAccounts?.slice?.(0, 3) ?? [];
    base.segmentExpectedReply = `${b.expectedReplyRate}% (Gemini forecast)`;
    base.segmentSequence = (b.sequence ?? []).map((s: AnyDoc) => {
      const channel =
        s.channel === "linkedin_dm" ? "LinkedIn DM" : "Email";
      return `Day ${s.dayOffset} — ${channel}`;
    });
  }

  if (doc.type === "NEEDS_JUDGMENT" && Array.isArray(doc.aiJudgmentOptions)) {
    base.options = (doc.aiJudgmentOptions as AnyDoc[]).map<Option>((o) => ({
      letter: String(o.letter ?? "A").toLowerCase() as "a" | "b" | "c",
      title: o.title,
      predicted: o.predicted ?? o.action ?? "",
    }));
    base.needsJudgmentReason = "AI couldn't decide — needs your call";
  }

  return base;
}

function actionsFor(type: string): string[] {
  switch (type) {
    case "HOT_REPLY":
      return ["Approve & Send", "Edit Quote", "Decline"];
    case "NEW_SEGMENT":
      return ["Approve & Launch", "Edit Segment", "Schedule"];
    case "NEEDS_JUDGMENT":
      return ["Pick option"];
    default:
      return ["Open"];
  }
}
