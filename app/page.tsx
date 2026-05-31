"use client";
import AppHeader from "@/components/AppHeader";
import TodayCard from "@/components/TodayCard";
import AgentOvernightStrip from "@/components/AgentOvernightStrip";
import { cardsRanked } from "@/data/cards";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { convertCardDoc } from "@/lib/convexAdapters";
import type { CardBase } from "@/data/types";

export default function TodayPage() {
  // Convex returns undefined while loading, [] when empty, or live data.
  const live = useQuery(api.cards.today);
  const stats = useQuery(api.cards.stats);

  const liveNeedsYou: CardBase[] = (live ?? [])
    .filter((c: any) => c.lane === "needs-you")
    .map(convertCardDoc);

  // Autonomous lane stays on static demo cards (V1 scope = Catering only).
  const autonomous = cardsRanked.filter((c) => c.lane === "autonomous");

  // Fallback to static needs-you cards while Convex hasn't returned yet
  // (i.e. first paint, or NEXT_PUBLIC_CONVEX_URL not configured).
  const needsYou: CardBase[] =
    live === undefined || liveNeedsYou.length === 0
      ? cardsRanked.filter((c) => c.lane === "needs-you")
      : liveNeedsYou;

  const needsYouCount = stats?.needsYou ?? needsYou.length;

  return (
    <div>
      <AppHeader
        eyebrow="Today · Tuesday Apr 15"
        title={`${needsYouCount} ${needsYouCount === 1 ? "thing needs" : "things need"} you`}
        meta="4 agents · ranked by $ impact"
      />

      <AgentOvernightStrip />

      <section className="px-4 pb-3 space-y-3">
        <SectionLabel>Needs you · {needsYou.length}</SectionLabel>
        {needsYou.map((c) => (
          <TodayCard key={c.id} card={c} />
        ))}
      </section>

      <section className="px-4 pb-6 space-y-3">
        <SectionLabel>Autonomous · {autonomous.length}</SectionLabel>
        {autonomous.map((c) => (
          <TodayCard key={c.id} card={c} />
        ))}
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 pt-1 text-[10.5px] uppercase tracking-[0.08em] font-semibold text-ink-400">
      {children}
    </p>
  );
}
