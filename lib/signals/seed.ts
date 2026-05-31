/**
 * V1 seed accounts — 10 businesses in/around Round Rock, TX.
 * Mirrors the names referenced in data/businesses.ts and data/cards.ts so
 * the same hero stories (Acme Tech reply, GreenBox judgment, etc.) survive
 * the migration from static data to live Convex+AI.
 */
export type SeedAccount = {
  name: string;
  domain: string;
  industry: string;
  headcount: number;
  city: string;
  distanceMiles: number;
};

export const SEED_ACCOUNTS: SeedAccount[] = [
  { name: "Acme Tech Holdings", domain: "acmetech.com",   industry: "Software",     headcount: 220, city: "Round Rock, TX", distanceMiles: 1.2 },
  { name: "Stripe Austin",      domain: "stripe.com",     industry: "Fintech",      headcount: 180, city: "Austin, TX",     distanceMiles: 4.1 },
  { name: "Indeed HQ",          domain: "indeed.com",     industry: "Recruiting",   headcount: 410, city: "Austin, TX",     distanceMiles: 4.7 },
  { name: "BigCommerce",        domain: "bigcommerce.com",industry: "E-commerce",   headcount: 320, city: "Austin, TX",     distanceMiles: 3.9 },
  { name: "Westlake Marketing", domain: "westlakemkt.com",industry: "Agency",       headcount:  45, city: "Round Rock, TX", distanceMiles: 0.8 },
  { name: "GreenBox Inc.",      domain: "greenbox.io",    industry: "Healthtech",   headcount:  90, city: "Round Rock, TX", distanceMiles: 2.0 },
  { name: "Stride Capital",     domain: "stridecap.com",  industry: "VC",           headcount:  28, city: "Round Rock, TX", distanceMiles: 1.5 },
  { name: "Klar Robotics",      domain: "klarbots.com",   industry: "Hardware",     headcount:  72, city: "Round Rock, TX", distanceMiles: 2.6 },
  { name: "Patel Dental Group", domain: "pateldental.com",industry: "Healthcare",   headcount:  38, city: "Round Rock, TX", distanceMiles: 1.1 },
  { name: "Heritage Title Co.", domain: "heritagetx.com", industry: "Legal",        headcount:  54, city: "Round Rock, TX", distanceMiles: 1.9 },
];
