import type { Contact } from "./types";

/**
 * Contacts ranked by engagement-derived score (0–100), not seniority.
 * Mirrors the deck principle: "talk to who is actually engaging, not who has the loudest title."
 */
export const contacts: Contact[] = [
  { id: "priya", businessId: "acme-tech",          name: "Priya Shah",   title: "Office Manager", initials: "PS", score: 96, status: "replied",
    activity: "Replied 11:42 PM · opened 4 of 4" },
  { id: "noor",  businessId: "bigcommerce",        name: "Noor Khan",    title: "People Ops",     initials: "NK", score: 78, status: "clicked",
    activity: "Downloaded menu PDF · 6d ago" },
  { id: "rohan", businessId: "stripe-austin",      name: "Rohan Mehta",  title: "Workplace Lead", initials: "RM", score: 71, status: "opened",
    activity: "Opened sequence #2 twice · 2d" },
  { id: "lisa",  businessId: "acme-tech",          name: "Lisa Park",    title: "EA",             initials: "LP", score: 64, status: "clicked",
    activity: "Clicked menu link · 1d ago" },
  { id: "sara",  businessId: "indeed-hq",          name: "Sara Lin",     title: "Office Manager", initials: "SL", score: 58, status: "opened",
    activity: "Opened intro email · 5d ago" },
  { id: "ben",   businessId: "patel-law",          name: "Ben Patel",    title: "Partner",        initials: "BP", score: 52, status: "opened",
    activity: "Accepted LinkedIn DM · 3d ago" },
  { id: "ana",   businessId: "stride-capital",     name: "Ana Reyes",    title: "Chief of Staff", initials: "AR", score: 47, status: "lapsed",
    activity: "Last order 63d ago · $420" },
  { id: "deep",  businessId: "westlake-marketing", name: "Deepa Iyer",   title: "Office Manager", initials: "DI", score: 41, status: "lapsed",
    activity: "Lapsed 50d · $640 last order" },
  { id: "tom",   businessId: "vela-biotech",       name: "Tom Wexler",   title: "Lab Ops",        initials: "TW", score: 38, status: "opened",
    activity: "Opens Friday lunch emails · 7d" },
  { id: "mark",  businessId: "acme-tech",          name: "Mark Chen",    title: "CEO",            initials: "MC", score: 33, status: "opened",
    activity: "Opened 4 emails · never replied" },
  { id: "jules", businessId: "klar-design",        name: "Jules Romero", title: "Studio Manager", initials: "JR", score: 28, status: "cold",
    activity: "Voicemail left · 5d ago" },
  { id: "yui",   businessId: "northbridge-pm",     name: "Yui Tanaka",   title: "Operations",     initials: "YT", score: 24, status: "cold",
    activity: "No reply on 2 outreach steps" },
];

export const contactsRanked = [...contacts].sort(
  (a, b) => (b.score ?? 0) - (a.score ?? 0)
);
