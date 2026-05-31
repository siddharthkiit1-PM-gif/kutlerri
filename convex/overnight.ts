"use node";
/**
 * Overnight run — the heart of V1, now multi-tenant.
 *
 * `run` is the cron entry point. It lists every authenticated user and
 * calls `runForOwner` sequentially. Each per-owner run:
 *   1. Simulate fresh signals across their 10 seed accounts.
 *   2. Replace signals + recompute scores in Convex.
 *   3. Generate exactly 3 owner cards (HOT_REPLY / NEW_SEGMENT / NEEDS_JUDGMENT)
 *      with Gemini-authored content tied to live signals.
 *   4. Log agentRuns entries for each card + autonomous baseline actions.
 *   5. Send the morning digest via Resend to that owner's email.
 */
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { simulateOvernight } from "@/lib/signals/simulate";
import { buildScoredAccount } from "@/lib/scoring";
import type { ScoredAccount, Signal } from "@/lib/types/domain";
import {
  draftReply,
  segmentBrief,
  judgment,
  overnightDigest,
  renderDigestEmail,
} from "@/lib/ai";

const WINDOW = "9 PM – 8 AM";

type AccountRow = {
  _id: Id<"accounts">;
  name: string;
};

type ContactRow = {
  _id: Id<"contacts">;
  accountId: Id<"accounts">;
  name: string;
  title: string;
  email?: string;
};

type RunSummary = {
  ranTotal: number;
  cardsForYou: number;
  autonomousCount: number;
  digest: string;
  emailId: string | null;
  dryRun: boolean;
};

/** Cron entry point — loops over every signed-up tenant. */
export const run = internalAction({
  args: { dryRun: v.optional(v.boolean()), skipEmail: v.optional(v.boolean()) },
  handler: async (ctx, { dryRun, skipEmail }) => {
    const users = (await ctx.runQuery(internal.users._listAll, {})) as Array<{
      _id: Id<"users">;
      email?: string;
    }>;

    const results: Array<{ ownerId: Id<"users">; result: RunSummary }> = [];
    for (const u of users) {
      const result = (await ctx.runAction(internal.overnight.runForOwner, {
        ownerId: u._id,
        dryRun,
        skipEmail,
      })) as RunSummary;
      results.push({ ownerId: u._id, result });
    }

    return {
      tenants: results.length,
      ranTotal: results.reduce((s, r) => s + r.result.ranTotal, 0),
      cardsForYou: results.reduce((s, r) => s + r.result.cardsForYou, 0),
      autonomousCount: results.reduce((s, r) => s + r.result.autonomousCount, 0),
    };
  },
});

/** Per-tenant overnight pipeline. */
export const runForOwner = internalAction({
  args: {
    ownerId: v.id("users"),
    dryRun: v.optional(v.boolean()),
    skipEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, { ownerId, dryRun, skipEmail }): Promise<RunSummary> => {
    const now = Date.now();
    const sim = simulateOvernight({ now });

    const owner: any = await ctx.runQuery(internal.users._getRaw, { ownerId });
    const ownerName: string = owner?.ownerName ?? owner?.name ?? "there";
    const restaurantName: string = owner?.restaurantName ?? "your restaurant";
    const toEmail: string | undefined = owner?.email;

    const accounts: AccountRow[] = await ctx.runQuery(internal.accounts.listForRun, { ownerId });
    const contacts: ContactRow[] = await ctx.runQuery(internal.contacts.listForRun, { ownerId });
    const contactsByAccount = new Map<string, ContactRow[]>();
    for (const c of contacts) {
      const arr = contactsByAccount.get(String(c.accountId)) ?? [];
      arr.push(c);
      contactsByAccount.set(String(c.accountId), arr);
    }

    // ── 1. Persist signals + scores, build ScoredAccount list ──────────────
    const scored: Array<{ acc: AccountRow; scored: ScoredAccount; signalIds: Id<"signals">[] }> = [];

    for (const acc of accounts) {
      const sigs = sim.signalsByAccountName[acc.name] ?? [];
      const sa = buildScoredAccount(
        { accountId: String(acc._id), name: acc.name },
        sigs,
        now,
      );

      if (!dryRun) {
        const ids = (await ctx.runMutation(internal.signals.replaceForAccount, {
          ownerId,
          accountId: acc._id,
          items: sigs.map((s: Signal) => ({
            source: s.source,
            weight: s.weight,
            label: s.label,
            rawPayload: JSON.stringify(s.rawPayload ?? {}),
            observedAt: s.observedAt,
          })),
        })) as Id<"signals">[];

        await ctx.runMutation(internal.accounts.updateScore, {
          ownerId,
          accountId: acc._id,
          intentScore: sa.intentScore,
          intentLevel: sa.intentLevel,
          lastSignalAt: now,
        });

        scored.push({ acc, scored: sa, signalIds: ids });
      } else {
        scored.push({ acc, scored: sa, signalIds: [] });
      }
    }

    if (!dryRun) {
      await ctx.runMutation(internal.cards.expireOpen, { ownerId });
    }

    // ── 2. Pick the 3 V1 cards: HOT_REPLY, NEW_SEGMENT, NEEDS_JUDGMENT ─────
    const ranked = [...scored].sort((a, b) => b.scored.intentScore - a.scored.intentScore);

    const cardSummaries: Array<{ account: string; what: string; impactUSD?: number }> = [];
    let cardsForYou = 0;

    // HOT_REPLY — top hot account with a Toast signal + a contact
    const hotPick = ranked.find(
      (r) =>
        r.scored.intentLevel === "hot" &&
        (contactsByAccount.get(String(r.acc._id))?.length ?? 0) > 0,
    ) ?? ranked[0];

    if (hotPick) {
      const contact = (contactsByAccount.get(String(hotPick.acc._id)) ?? [])[0];
      const inquirySummary = `Replied last night asking about a 80-person team lunch next Thursday — fast turnaround.`;
      const draft = await draftReply({
        account: hotPick.scored,
        contact: {
          name: contact?.name ?? "the office manager",
          title: contact?.title ?? "Office Manager",
          email: contact?.email,
        },
        inquirySummary,
      });
      if (draft.ok && !dryRun) {
        const cardId = await ctx.runMutation(internal.cards.insert, {
          ownerId,
          type: "HOT_REPLY",
          lane: "needs-you",
          accountId: hotPick.acc._id,
          contactId: contact?._id,
          title: `${hotPick.acc.name} replied`,
          subtitle: "80-person lunch · 24hr turnaround",
          intentScore: hotPick.scored.intentScore,
          intentLevel: hotPick.scored.intentLevel,
          impactUSD: 1840,
          impactKind: "Quote value",
          aiRecommendation: draft.data.recommendation,
          aiReplyDraft: `Subject: ${draft.data.subject}\n\n${draft.data.body}`,
          signalIds: hotPick.signalIds,
        });
        await ctx.runMutation(internal.agentRuns.insert, {
          ownerId,
          agent: "Catering",
          lane: "needs-you",
          summary: `Drafted reply to ${hotPick.acc.name} — ${draft.data.recommendation}`,
          impactUSD: 1840,
          revertable: true,
          cardId,
          href: `/card/${cardId}`,
          window: WINDOW,
        });
        cardSummaries.push({
          account: hotPick.acc.name,
          what: `Reply drafted — ${draft.data.recommendation}`,
          impactUSD: 1840,
        });
        cardsForYou++;
      }
    }

    // NEW_SEGMENT — cluster of warm accounts (intent 50–79)
    const warmCluster = ranked.filter(
      (r) => r.scored.intentScore >= 50 && r.scored.intentScore < 80,
    );
    if (warmCluster.length >= 3) {
      const brief = await segmentBrief({
        candidateAccounts: warmCluster.slice(0, 8).map((r) => r.scored),
        patternHint:
          "Warm Round Rock / Austin businesses with hiring momentum and headcount > 50 — surfaced by overnight Apollo + LinkedIn + ATS sweep.",
      });
      if (brief.ok && !dryRun) {
        const signalUnion = warmCluster.slice(0, 8).flatMap((r) => r.signalIds);
        const cardId = await ctx.runMutation(internal.cards.insert, {
          ownerId,
          type: "NEW_SEGMENT",
          lane: "needs-you",
          title: brief.data.segmentName,
          subtitle: `${warmCluster.length} prospects · ${brief.data.expectedReplyRate}% expected reply`,
          impactUSD: 5400,
          impactKind: "Forecast booked",
          aiRecommendation: brief.data.recommendation,
          aiSegmentBrief: brief.data,
          signalIds: signalUnion,
        });
        await ctx.runMutation(internal.agentRuns.insert, {
          ownerId,
          agent: "Catering",
          lane: "needs-you",
          summary: `New segment: ${brief.data.segmentName} (${warmCluster.length} prospects)`,
          impactUSD: 5400,
          revertable: true,
          cardId,
          href: `/card/${cardId}`,
          window: WINDOW,
        });
        cardSummaries.push({
          account: brief.data.segmentName,
          what: `New segment ready to launch (${warmCluster.length} prospects)`,
          impactUSD: 5400,
        });
        cardsForYou++;
      }
    }

    // NEEDS_JUDGMENT — prefer GreenBox-style margin-conflict account; else top warm
    const judgmentPick =
      ranked.find((r) => r.acc.name === "GreenBox Inc.") ??
      warmCluster[0] ??
      ranked[1];
    if (judgmentPick) {
      const situation =
        judgmentPick.acc.name === "GreenBox Inc."
          ? "All-vegan office of 60 people wants weekly recurring catering. Standard pricing yields a 23% margin (vs target 38%). Premium pricing risks losing the deal."
          : "Account is showing strong intent but has signal conflicts (e.g. hiring spike vs lapsed engagement). Owner judgment needed on pricing/positioning.";
      const j = await judgment({
        account: judgmentPick.scored,
        situation,
      });
      if (j.ok && !dryRun) {
        const cardId = await ctx.runMutation(internal.cards.insert, {
          ownerId,
          type: "NEEDS_JUDGMENT",
          lane: "needs-you",
          accountId: judgmentPick.acc._id,
          title: `${judgmentPick.acc.name} — ${j.data.question.slice(0, 60)}`,
          subtitle: j.data.context.slice(0, 90),
          intentScore: judgmentPick.scored.intentScore,
          intentLevel: judgmentPick.scored.intentLevel,
          impactUSD: 2880,
          impactKind: "Weekly recurring",
          aiRecommendation: j.data.recommendation,
          aiJudgmentOptions: j.data.options,
          signalIds: judgmentPick.signalIds,
        });
        await ctx.runMutation(internal.agentRuns.insert, {
          ownerId,
          agent: "Catering",
          lane: "needs-you",
          summary: `Judgment call queued for ${judgmentPick.acc.name}`,
          impactUSD: 2880,
          revertable: true,
          cardId,
          href: `/card/${cardId}`,
          window: WINDOW,
        });
        cardSummaries.push({
          account: judgmentPick.acc.name,
          what: `Judgment call — ${j.data.question}`,
          impactUSD: 2880,
        });
        cardsForYou++;
      }
    }

    // ── 3. Autonomous baseline ─────────────────────────────────────────────
    const autonomousCount = 4;
    if (!dryRun) {
      await ctx.runMutation(internal.agentRuns.insert, {
        ownerId,
        agent: "Catering",
        lane: "autonomous",
        summary: `Re-scored ${accounts.length} accounts from overnight signal sweep`,
        revertable: false,
        window: WINDOW,
      });
      await ctx.runMutation(internal.agentRuns.insert, {
        ownerId,
        agent: "Catering",
        lane: "autonomous",
        summary: `Suppressed 2 stale prospects (no signals > 30d)`,
        revertable: true,
        window: WINDOW,
      });
    }

    // ── 4. Digest email ────────────────────────────────────────────────────
    const topImpact = cardSummaries.reduce((m, h) => Math.max(m, h.impactUSD ?? 0), 0);
    const digest = await overnightDigest({
      ownerName,
      restaurantName,
      windowLabel: WINDOW,
      cardsForYouCount: cardsForYou,
      cardsAutonomousCount: autonomousCount,
      topImpactUSD: topImpact,
      highlights: cardSummaries,
    });

    let emailId: string | null = null;
    if (digest.ok && !dryRun && !skipEmail && toEmail) {
      const rendered = renderDigestEmail(digest.data);
      try {
        const sent = (await ctx.runAction(internal.email._sendToOwnerInternal, {
          to: toEmail,
          ...rendered,
        })) as { id: string | null };
        emailId = sent.id;
      } catch (err) {
        await ctx.runMutation(internal.agentRuns.insert, {
          ownerId,
          agent: "Catering",
          lane: "autonomous",
          summary: `Digest email failed: ${err instanceof Error ? err.message : String(err)}`,
          revertable: false,
          window: WINDOW,
        });
      }
    }

    return {
      ranTotal: cardsForYou + autonomousCount,
      cardsForYou,
      autonomousCount,
      digest: digest.ok ? digest.data.subject : `error: ${(digest as any).error}`,
      emailId,
      dryRun: !!dryRun,
    };
  },
});
