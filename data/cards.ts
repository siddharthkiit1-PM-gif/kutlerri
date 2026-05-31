import type { CardBase } from "./types";

export const cards: CardBase[] = [
  {
    id: "acme-hot-reply",
    type: "HOT_REPLY",
    agent: "Catering",
    lane: "needs-you",
    impactUSD: 1840,
    impactKind: "Quote value",
    title: "Acme Tech Holdings replied",
    subtitle: "80-person lunch · 24hr turnaround",
    business: "Acme Tech Holdings",
    intentScore: 94,
    intentLevel: "hot",
    trigger: "Replied at 11:42 PM yesterday",
    signals: [
      { label: "$30M Series B announced 3 days ago", source: "Crunchbase" },
      { label: "5 office-manager job posts in last 14 days", source: "LinkedIn Jobs" },
      { label: "3 employees order from us weekly", source: "Toast POS Guest Match" },
      { label: "67% open rate on prior 4 emails", source: "Internal" },
    ],
    aiRecommendation: "Quote 80-person team lunch · $1,840 · 24hr turnaround",
    actions: ["Approve & Send", "Edit Quote", "Decline"],
  },
  {
    id: "segment-roundrock-17",
    type: "NEW_SEGMENT",
    agent: "Catering",
    lane: "needs-you",
    impactUSD: 5400,
    impactKind: "Forecast booked",
    title: "17 hot prospects near Round Rock",
    subtitle: "50+ employees · hiring spike (14d) · 5mi radius",
    segmentCriteria: [
      "50+ employees",
      "Hiring spike in last 14 days",
      "Within 5 mile radius",
    ],
    segmentSamples: ["Stripe Austin", "Indeed HQ", "BigCommerce"],
    segmentExpectedReply: "18% (based on prior 6 campaigns)",
    segmentSequence: [
      "Day 0 — Email",
      "Day 4 — LinkedIn DM",
      "Day 7 — Call",
    ],
    aiRecommendation: "Launch 3-touch sequence to 17 prospects",
    actions: ["Approve & Launch", "Edit Segment", "Schedule"],
  },
  {
    id: "greenbox-judgment",
    type: "NEEDS_JUDGMENT",
    agent: "Catering",
    lane: "needs-you",
    impactUSD: 2880,
    impactKind: "Weekly recurring",
    title: "GreenBox Inc. — all-vegan, 60 people weekly",
    subtitle: "Margin drops 38% → 23%",
    business: "GreenBox Inc.",
    needsJudgmentReason: "AI couldn't decide — needs your call",
    options: [
      {
        letter: "a",
        title: "Standard pricing",
        predicted: "Likely win · margin drops 38% → 23%",
      },
      {
        letter: "b",
        title: "Premium pricing (+18%)",
        predicted: "Moderate win · margin held near 37%",
      },
      {
        letter: "c",
        title: "Decline",
        predicted: "Preserve focus on higher-margin segments",
      },
    ],
    actions: ["Pick option"],
  },
  {
    id: "retention-lapsed-2",
    type: "RETENTION_RISK",
    agent: "Catering",
    crossAgent: true,
    poweredBy: "Guest Retention",
    lane: "needs-you",
    impactUSD: 1060,
    impactKind: "Reactivation value",
    title: "2 lapsed catering accounts",
    subtitle: "Re-engage with 15% welcome-back",
    lapsedTrigger: "3x/mo for 6mo → 0 orders in 60 days",
    lapsedAccounts: [
      { name: "Westlake Marketing", lastOrderUSD: 640, lastOrderDate: "Apr 10" },
      { name: "Stride Capital",     lastOrderUSD: 420, lastOrderDate: "Mar 28" },
    ],
    aiRecommendation: "Send re-engagement email with 15% welcome-back offer",
    actions: ["Approve", "Skip"],
  },
  {
    id: "waste-roundrock",
    type: "WASTE_ALERT",
    agent: "Waste Control",
    crossAgent: true,
    poweredBy: "Catering",
    lane: "autonomous",
    impactUSD: 480,
    impactKind: "Weekly waste saved",
    title: "$480/wk wasted on over-prepped chicken thighs",
    subtitle: "Round Rock location",
    aiRecommendation: "Reduce Tue/Wed prep by 22%",
    actions: ["Approve", "View detail"],
  },
  {
    id: "prep-basmati-4421",
    type: "PREP_RECOMMENDATION",
    agent: "Prep Forecast",
    crossAgent: true,
    poweredBy: "Catering",
    lane: "autonomous",
    impactUSD: 160,
    impactKind: "Avoided stock-out",
    title: "+30% basmati rice tomorrow lunch",
    subtitle: "For inbound catering order #4421",
    prepOrderId: "#4421",
    actions: ["Acknowledge"],
  },
];

export function getCard(id: string) {
  return cards.find((c) => c.id === id);
}

/** Today queue sort: needs-you first (highest impact), then autonomous (highest impact). */
export const cardsRanked: CardBase[] = [...cards].sort((a, b) => {
  const laneRank = (c: CardBase) => (c.lane === "needs-you" ? 0 : 1);
  const laneDiff = laneRank(a) - laneRank(b);
  if (laneDiff !== 0) return laneDiff;
  return (b.impactUSD ?? 0) - (a.impactUSD ?? 0);
});

export const cateringCards = cardsRanked.filter(
  (c) => c.agent === "Catering"
);

export const totalImpactUSD = cards.reduce(
  (s, c) => s + (c.impactUSD ?? 0),
  0
);

export const needsYouCount = cards.filter((c) => c.lane === "needs-you").length;
export const autonomousCount = cards.filter((c) => c.lane === "autonomous").length;
