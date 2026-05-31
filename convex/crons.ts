/**
 * Overnight run cron — fires once daily at 09:00 UTC ( ≈ 4 AM CT during DST,
 * 3 AM CT in standard time). The owner reads the digest first thing in the
 * morning Central time.
 */
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "overnight catering run",
  { hourUTC: 9, minuteUTC: 0 },
  internal.overnight.run,
  { dryRun: false, skipEmail: false },
);

export default crons;
