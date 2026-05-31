import type { EngageThread } from "./types";

/**
 * Engage threads ranked by predicted reply-likelihood within 7 days.
 * Each entry includes a plain-language prediction the Catering Agent stands behind.
 */
export const engageThreads: EngageThread[] = [
  {
    id: "acme-thread",
    businessId: "acme-tech",
    name: "Acme Tech Holdings",
    last: "Priya: \"This looks great — can we do Thursday?\"",
    when: "11:42 PM",
    channel: "email",
    unread: true,
    replyLikelihood: 96,
    predictedReply: "Reply received · approve quote to close",
    sentBy: "agent",
  },
  {
    id: "bigcommerce-thread",
    businessId: "bigcommerce",
    name: "BigCommerce",
    last: "Noor downloaded the menu PDF",
    when: "6d",
    channel: "email",
    unread: false,
    replyLikelihood: 64,
    predictedReply: "Likely yes in 2–3 days · follow up with date holds",
    sentBy: "agent",
  },
  {
    id: "indeed-thread",
    businessId: "indeed-hq",
    name: "Indeed HQ",
    last: "Sara clicked the catering menu link",
    when: "5d",
    channel: "email",
    unread: false,
    replyLikelihood: 58,
    predictedReply: "Probable reply · all-hands Apr 22 deadline",
    sentBy: "agent",
  },
  {
    id: "stripe-thread",
    businessId: "stripe-austin",
    name: "Stripe Austin",
    last: "Sequence step 2 opened twice (no reply yet)",
    when: "2d",
    channel: "email",
    unread: false,
    replyLikelihood: 41,
    predictedReply: "Maybe · send sample tray offer to nudge",
    sentBy: "agent",
  },
  {
    id: "westlake-thread",
    businessId: "westlake-marketing",
    name: "Westlake Marketing",
    last: "Re-engagement email queued · 15% welcome-back",
    when: "Today",
    channel: "email",
    unread: false,
    replyLikelihood: 32,
    predictedReply: "Win-back · 1 in 3 lapsed accounts respond at this offer",
    sentBy: "agent",
  },
  {
    id: "patel-thread",
    businessId: "patel-law",
    name: "Patel & Assoc Law",
    last: "Accepted LinkedIn connect · DM in queue",
    when: "3d",
    channel: "dm",
    unread: false,
    replyLikelihood: 24,
    predictedReply: "Slow · send menu after first DM exchange",
    sentBy: "agent",
  },
  {
    id: "klar-thread",
    businessId: "klar-design",
    name: "Klar Design Studio",
    last: "Call attempted, voicemail left",
    when: "5d",
    channel: "call",
    unread: false,
    replyLikelihood: 12,
    predictedReply: "Cold · queue 2-week follow-up touch",
    sentBy: "agent",
  },
];

export const engageRanked = [...engageThreads].sort(
  (a, b) => b.replyLikelihood - a.replyLikelihood
);

export const likelyRepliesThisWeek = engageThreads.filter(
  (t) => t.replyLikelihood >= 50
).length;

export function getEngageThread(id: string) {
  return engageThreads.find((t) => t.id === id);
}
