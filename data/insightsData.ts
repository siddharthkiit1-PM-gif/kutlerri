import type { InsightMetric, InsightSourceROI } from "./types";

export const headlineMetrics: InsightMetric[] = [
  { label: "Catering booked",    value: "$48.2k", delta: "+18%", hint: "vs prior 30d" },
  { label: "Hot prospects live",  value: "9",      delta: "+3",    hint: "intent ≥ 80" },
  { label: "Reply rate",          value: "22%",    delta: "+4pt",  hint: "all sequences" },
  { label: "Avg. response time",  value: "1.4h",   delta: "−42%",  hint: "agent vs you-alone" },
];

export const minutesSavedToday = {
  used: 11,
  cap: 15, // your "deserve no more than 15 minutes/day" target from the deck
  label: "Today's owner minutes",
};

export const autonomousMix = {
  autonomous: 19,
  needsYou: 4,
  ratioLabel: "83% autonomous · 17% needs you",
};

export const weeklyBooked = {
  values: [12, 18, 9, 22, 26, 31, 28],
  labels: ["W1","W2","W3","W4","W5","W6","W7"],
  title: "Booked revenue · weekly ($k)",
};

export const sourceROI: InsightSourceROI[] = [
  { source: "Toast POS Guest Match",  bookedUSD: 18400, share: 0.38 },
  { source: "Crunchbase funding",      bookedUSD: 11600, share: 0.24 },
  { source: "LinkedIn Jobs hiring",    bookedUSD:  8200, share: 0.17 },
  { source: "Indeed hiring",           bookedUSD:  4900, share: 0.10 },
  { source: "Apollo.io firmographics", bookedUSD:  3200, share: 0.07 },
  { source: "Greenhouse / Lever ATS",  bookedUSD:  1900, share: 0.04 },
];
