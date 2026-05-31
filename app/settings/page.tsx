import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { AGENT_META } from "@/components/AgentChip";
import {
  ChevronRight,
  Receipt,
  MapPin,
  Bell,
  ShieldCheck,
  HelpCircle,
  Briefcase,
  TrendingUp,
  CalendarClock,
  Building2,
  Mail,
  Users as UsersIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { agentActivity } from "@/data/agentActivity";
import type { Agent } from "@/data/types";

type Row = {
  icon: LucideIcon;
  label: string;
  meta: string;
  badge?: string;
};

const INTENT_SOURCES: Row[] = [
  { icon: Receipt,        label: "Toast POS Guest Match",   meta: "Internal · 4m ago",     badge: "Highest weight" },
  { icon: TrendingUp,     label: "Crunchbase funding",      meta: "External · 12m ago" },
  { icon: Briefcase,      label: "LinkedIn Jobs hiring",    meta: "External · 23m ago" },
  { icon: Briefcase,      label: "Indeed hiring",           meta: "External · 45m ago" },
  { icon: Building2,      label: "Apollo.io firmographics", meta: "External · 1h ago" },
  { icon: CalendarClock,  label: "Greenhouse / Lever ATS",  meta: "External · 1h ago" },
];

const WORKSPACE: Row[] = [
  { icon: MapPin, label: "Delivery radius",   meta: "5 miles · Round Rock, TX" },
  { icon: Mail,   label: "Email engagement",  meta: "Tracked across all sequences" },
  { icon: UsersIcon, label: "Guest Retention drop-offs", meta: "Cross-agent signal · enabled" },
];

const ACCOUNT: Row[] = [
  { icon: Bell,        label: "Notifications",  meta: "Push · Email · SMS" },
  { icon: ShieldCheck, label: "Permissions",    meta: "Owner" },
  { icon: HelpCircle,  label: "Help & support", meta: "Docs, contact" },
];

export default function SettingsPage() {
  const totalToday = agentActivity.reduce((s, a) => s + a.actionsToday, 0);
  const totalAutonomous = agentActivity.reduce((s, a) => s + a.autonomousToday, 0);

  return (
    <div>
      <AppHeader
        eyebrow="Settings"
        title="Workspace"
        meta={`Round Rock Kitchen · ${agentActivity.length} agents · 1 owner`}
      />

      <div className="px-4 pb-8 space-y-5">
        {/* Intent sources */}
        <section>
          <div className="px-1 mb-1.5 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Intent signal sources · {INTENT_SOURCES.length} active
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-brand font-semibold">
              <Sparkles size={11} strokeWidth={2.2} />
              All live
            </span>
          </div>
          <List rows={INTENT_SOURCES} />
        </section>

        {/* Agents */}
        <section>
          <div className="px-1 mb-1.5 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Agents · {agentActivity.length}
            </p>
            <span className="text-[11px] text-ink-500">
              <span className="num text-ink-900 font-semibold">{totalAutonomous}</span>
              {" / "}
              <span className="num">{totalToday}</span> autonomous today
            </span>
          </div>
          <ul className="bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] overflow-hidden divide-y divide-line">
            {agentActivity.map((a) => {
              const meta = AGENT_META[a.agent as Agent];
              const Icon = meta.icon;
              return (
                <li key={a.agent}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 flex items-center gap-3 active:bg-canvas text-left"
                  >
                    <span className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      a.agent === "Catering"
                        ? "bg-brand/10 text-brand"
                        : "bg-canvas text-ink-700"
                    }`}>
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink-900 truncate">
                        {meta.chip}
                      </p>
                      <p className="text-[12px] text-ink-400 truncate">
                        <span className="num">{a.actionsToday}</span> actions today ·{" "}
                        <span className="num text-ink-700 font-medium">{a.autonomousToday}</span> autonomous
                      </p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-brand/80 mr-1">
                      Active
                    </span>
                    <ChevronRight size={16} strokeWidth={1.75} className="text-ink-300" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Workspace */}
        <section>
          <p className="px-1 mb-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Workspace
          </p>
          <List rows={WORKSPACE} />
        </section>

        {/* Account */}
        <section>
          <p className="px-1 mb-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
            Account
          </p>
          <List rows={ACCOUNT} />
        </section>

        <Link
          href="/onboarding"
          className="block text-center min-h-[44px] py-3 text-[13px] font-semibold text-brand"
        >
          Re-run onboarding
        </Link>
      </div>
    </div>
  );
}

function List({ rows }: { rows: Row[] }) {
  return (
    <ul className="bg-white rounded-2xl shadow-card ring-1 ring-black/[0.03] overflow-hidden divide-y divide-line">
      {rows.map((r) => {
        const Icon = r.icon;
        return (
          <li key={r.label}>
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center gap-3 active:bg-canvas text-left"
            >
              <span className="h-9 w-9 rounded-lg bg-canvas text-ink-700 flex items-center justify-center shrink-0">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink-900 truncate">
                  {r.label}
                </p>
                <p className="text-[12px] text-ink-400 truncate">
                  {r.meta}
                </p>
              </div>
              {r.badge && (
                <span className="text-[10.5px] uppercase tracking-[0.06em] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full mr-1">
                  {r.badge}
                </span>
              )}
              <ChevronRight size={16} strokeWidth={1.75} className="text-ink-300" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
