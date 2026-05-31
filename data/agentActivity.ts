import type { OvernightAction, OvernightSummary, Agent } from "./types";

/**
 * The "agent worked while you slept" log surfaced from Today's overnight strip.
 * Realistic 9 PM → 8 AM window. Autonomous entries are already applied;
 * needs-you entries are routed to Today as cards.
 */
export const overnightActions: OvernightAction[] = [
  {
    id: "oa-1",
    time: "9:14 PM",
    agent: "Catering",
    summary: "Sequence step 2 delivered to 6 prospects",
    lane: "autonomous",
    impactUSD: 0,
  },
  {
    id: "oa-2",
    time: "10:02 PM",
    agent: "Guest Retention",
    summary: "Scanned 84 accounts · flagged 2 as lapsed",
    lane: "autonomous",
    impactUSD: 1060,
    href: "/card/retention-lapsed-2",
  },
  {
    id: "oa-3",
    time: "11:42 PM",
    agent: "Catering",
    summary: "Acme Tech Holdings replied to outreach #4 · routed to you",
    lane: "needs-you",
    impactUSD: 1840,
    href: "/card/acme-hot-reply",
  },
  {
    id: "oa-4",
    time: "12:14 AM",
    agent: "Catering",
    summary: "Re-engagement draft queued for Westlake + Stride · 15% offer",
    lane: "autonomous",
    revertable: true,
  },
  {
    id: "oa-5",
    time: "1:32 AM",
    agent: "Catering",
    summary: "Klar Design Studio · call attempted, voicemail logged",
    lane: "autonomous",
  },
  {
    id: "oa-6",
    time: "3:00 AM",
    agent: "Catering",
    summary: "17 new prospects matched Round Rock segment · proposal staged",
    lane: "needs-you",
    impactUSD: 5400,
    href: "/card/segment-roundrock-17",
  },
  {
    id: "oa-7",
    time: "4:55 AM",
    agent: "Waste Control",
    summary: "Tue/Wed chicken thigh over-prep · recommend -22%",
    lane: "autonomous",
    impactUSD: 480,
    revertable: true,
    href: "/card/waste-roundrock",
  },
  {
    id: "oa-8",
    time: "5:30 AM",
    agent: "Prep Forecast",
    summary: "Order #4421 → +30% basmati on tomorrow lunch prep",
    lane: "autonomous",
    impactUSD: 160,
    revertable: true,
    href: "/card/prep-basmati-4421",
  },
  {
    id: "oa-9",
    time: "7:10 AM",
    agent: "Catering",
    summary: "GreenBox Inc. all-vegan request · couldn't decide, routed to you",
    lane: "needs-you",
    impactUSD: 2880,
    href: "/card/greenbox-judgment",
  },
];

export const overnightSummary: OvernightSummary = {
  ranTotal: 23,
  autonomous: 19,
  needsYou: 4,
  savedMinutes: 47,
  impactUSD: 11820,
  window: "9 PM – 8 AM",
};

/**
 * Quick per-agent activity used by Settings and Insights tiles.
 */
export const agentActivity: { agent: Agent; actionsToday: number; autonomousToday: number }[] = [
  { agent: "Catering",        actionsToday: 14, autonomousToday: 10 },
  { agent: "Waste Control",   actionsToday: 3,  autonomousToday: 3  },
  { agent: "Guest Retention", actionsToday: 4,  autonomousToday: 4  },
  { agent: "Prep Forecast",   actionsToday: 2,  autonomousToday: 2  },
];
