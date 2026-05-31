import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MicroBar from "@/components/MicroBar";
import { contactsRanked } from "@/data/contacts";
import { businesses } from "@/data/businesses";
import type { ContactStatus } from "@/data/types";

const STATUS_META: Record<ContactStatus, { label: string; klass: string }> = {
  replied: { label: "Replied",  klass: "bg-hot-bg text-hot-fg" },
  clicked: { label: "Clicked",  klass: "bg-brand/10 text-brand" },
  opened:  { label: "Opened",   klass: "bg-warm-bg text-warm-fg" },
  lapsed:  { label: "Lapsed",   klass: "bg-canvas text-ink-500 ring-1 ring-line" },
  cold:    { label: "Cold",     klass: "bg-canvas text-ink-400" },
};

export default function CateringContactsPage() {
  const businessCount = new Set(contactsRanked.map((c) => c.businessId)).size;
  const topReplied = contactsRanked.filter((c) => c.status === "replied").length;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="px-1 text-[12px] text-ink-400">
          <span className="num text-ink-700 font-semibold">{contactsRanked.length}</span> contacts ·{" "}
          <span className="num text-ink-700 font-semibold">{businessCount}</span> businesses
        </p>
        <p className="px-1 text-[11.5px] text-ink-400">
          Ranked by engagement
        </p>
      </div>

      <div className="mb-3 rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Replied this week
          </p>
          <p className="mt-0.5 text-[20px] font-semibold text-ink-900 num">{topReplied}</p>
        </div>
        <p className="text-[11.5px] text-ink-400 max-w-[180px] text-right leading-[15px]">
          The agent surfaces who&apos;s replying, not who has the loudest title.
        </p>
      </div>

      <ul className="bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] overflow-hidden divide-y divide-line">
        {contactsRanked.map((c) => {
          const biz = businesses.find((b) => b.id === c.businessId);
          const status = STATUS_META[c.status ?? "cold"];
          return (
            <li key={c.id}>
              <Link
                href={biz ? `/catering/businesses/${biz.id}` : "#"}
                className="px-4 py-3 flex items-center gap-3 active:bg-canvas"
              >
                <span className="h-9 w-9 rounded-full bg-canvas text-ink-700 text-[12px] font-semibold flex items-center justify-center shrink-0">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink-900 truncate">
                      {c.name}
                    </p>
                    <span className={`text-[10.5px] uppercase tracking-[0.05em] font-semibold px-1.5 py-0.5 rounded-full ${status.klass}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-500 truncate">
                    {c.title}{biz ? ` · ${biz.name}` : ""}
                  </p>
                  <p className="text-[11.5px] text-ink-400 mt-0.5 truncate">
                    {c.activity}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className="num text-[13.5px] font-semibold text-ink-900">
                    {c.score ?? 0}
                  </span>
                  <MicroBar value={c.score ?? 0} width={48} />
                </div>
                <ChevronRight size={14} strokeWidth={1.75} className="text-ink-300 shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
