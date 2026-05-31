"use client";
import AppHeader from "@/components/AppHeader";
import TodayCard from "@/components/TodayCard";
import AgentOvernightStrip from "@/components/AgentOvernightStrip";
import { cardsRanked } from "@/data/cards";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { convertCardDoc } from "@/lib/convexAdapters";
import type { CardBase } from "@/data/types";
import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

export default function TodayPage() {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me);
  const bootstrap = useMutation(api.users.bootstrapNewUser);

  // One-shot bootstrap on first authed render. Idempotent.
  const didBootstrap = useRef(false);
  useEffect(() => {
    if (me && !didBootstrap.current) {
      didBootstrap.current = true;
      bootstrap({}).catch((err) => console.warn("bootstrap failed", err));
    }
  }, [me, bootstrap]);

  const live = useQuery(api.cards.today);
  const stats = useQuery(api.cards.stats);

  const liveNeedsYou: CardBase[] = (live ?? [])
    .filter((c: any) => c.lane === "needs-you")
    .map(convertCardDoc);

  // Autonomous lane stays on static demo cards (V1 scope = Catering only).
  const autonomous = cardsRanked.filter((c) => c.lane === "autonomous");

  // Fallback to static needs-you cards while Convex hasn't returned yet.
  const needsYou: CardBase[] =
    live === undefined || liveNeedsYou.length === 0
      ? cardsRanked.filter((c) => c.lane === "needs-you")
      : liveNeedsYou;

  const needsYouCount = stats?.needsYou ?? needsYou.length;

  return (
    <div>
      <AppHeader
        eyebrow={me?.email ? `Signed in · ${me.email}` : "Today · Tuesday Apr 15"}
        title={`${needsYouCount} ${needsYouCount === 1 ? "thing needs" : "things need"} you`}
        meta="4 agents · ranked by $ impact"
        right={
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-ink-100 bg-white text-ink-400 hover:text-ink-900 hover:border-ink-200 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        }
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
