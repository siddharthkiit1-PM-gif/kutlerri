import Link from "next/link";
import { Mail, MessageSquare, PhoneCall, ChevronRight, Sparkles } from "lucide-react";
import MicroBar from "@/components/MicroBar";
import { engageRanked, likelyRepliesThisWeek } from "@/data/engage";
import type { EngageChannel } from "@/data/types";

const ICONS = {
  email: Mail,
  dm: MessageSquare,
  call: PhoneCall,
} satisfies Record<EngageChannel, unknown>;

export default function EngagePage() {
  return (
    <section className="px-4 py-4">
      <div className="mb-3 rounded-2xl bg-white ring-1 ring-black/[0.03] shadow-card px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Likely replies · this week
          </p>
          <p className="mt-0.5 text-[20px] font-semibold text-ink-900 num">{likelyRepliesThisWeek}</p>
        </div>
        <p className="inline-flex items-center gap-1 text-[11.5px] text-ink-500 max-w-[180px] text-right leading-[15px]">
          <Sparkles size={11} strokeWidth={2} className="text-brand" />
          Ranked by predicted reply, not last sent.
        </p>
      </div>

      <ul className="bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] overflow-hidden divide-y divide-line">
        {engageRanked.map((t) => {
          const Icon = ICONS[t.channel];
          return (
            <li key={t.id}>
              <Link
                href={t.businessId ? `/catering/businesses/${t.businessId}` : "#"}
                className="px-4 py-3 flex items-start gap-3 active:bg-canvas"
              >
                <span className="mt-0.5 h-9 w-9 rounded-full bg-canvas text-ink-700 flex items-center justify-center shrink-0">
                  <Icon size={15} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[14px] font-semibold text-ink-900 truncate">
                      {t.name}
                    </p>
                    <p className="text-[11.5px] text-ink-400 shrink-0 num">{t.when}</p>
                  </div>
                  <p
                    className={`text-[12.5px] leading-[17px] mt-0.5 truncate ${
                      t.unread ? "text-ink-900" : "text-ink-500"
                    }`}
                  >
                    {t.last}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/[0.06] px-2 py-0.5 text-[11px] font-semibold text-brand">
                      <Sparkles size={10} strokeWidth={2.2} />
                      {t.predictedReply}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <MicroBar value={t.replyLikelihood} width={64} />
                    <span className="text-[11px] text-ink-500">
                      <span className="num font-semibold text-ink-700">{t.replyLikelihood}%</span>{" "}
                      reply
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-center flex items-center gap-1">
                  {t.unread && (
                    <span className="h-2 w-2 rounded-full bg-brand" aria-label="Unread" />
                  )}
                  <ChevronRight size={14} strokeWidth={1.75} className="text-ink-300" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
