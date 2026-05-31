import TodayCard from "@/components/TodayCard";
import { cateringCards } from "@/data/cards";

export default function CateringTodayPage() {
  return (
    <section className="px-4 py-4 space-y-3">
      <p className="px-1 text-[12px] text-ink-400">
        Catering-only queue · {cateringCards.length} cards
      </p>
      {cateringCards.map((c) => (
        <TodayCard key={c.id} card={c} />
      ))}
    </section>
  );
}
