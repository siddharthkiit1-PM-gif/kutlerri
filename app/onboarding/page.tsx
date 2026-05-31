"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  Circle,
  MapPin,
  Briefcase,
  TrendingUp,
  Building2,
  CalendarClock,
  Receipt,
  Users,
} from "lucide-react";

type POS = "toast" | "square" | "clover";
type Radius = 3 | 5 | 10;

const SIGNALS = [
  { id: "posmatch",    label: "POS guest → workplace match",  source: "Toast POS · Internal",   icon: Receipt,       on: true,  badge: "Highest weight" },
  { id: "funding",     label: "Funding events",               source: "Crunchbase",             icon: TrendingUp,    on: true },
  { id: "hiringlinkedin", label: "Hiring spikes",             source: "LinkedIn Jobs",          icon: Briefcase,     on: true },
  { id: "hiringindeed", label: "Hiring spikes",               source: "Indeed",                 icon: Briefcase,     on: true },
  { id: "firmographics", label: "Firmographics & headcount",  source: "Apollo.io",              icon: Building2,     on: true },
  { id: "atsteam",     label: "ATS team expansion",           source: "Greenhouse · Lever",     icon: CalendarClock, on: false },
  { id: "retention",   label: "Guest retention drop-offs",    source: "Cross-agent · Internal", icon: Users,         on: true,  badge: "Cross-agent" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pos, setPos] = useState<POS>("toast");
  const [radius, setRadius] = useState<Radius>(5);
  const [signals, setSignals] = useState(
    Object.fromEntries(SIGNALS.map((s) => [s.id, s.on]))
  );

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="px-4 pt-2 flex items-center justify-between">
        <Steps current={step} />
        <Link
          href="/"
          className="min-h-[44px] px-2 inline-flex items-center text-[13px] font-semibold text-ink-500 active:text-ink-900"
        >
          Skip
        </Link>
      </div>

      <div className="px-5 pt-6 pb-4 flex-1 overflow-y-auto">
        {step === 1 && (
          <>
            <Heading
              eyebrow="Step 1 of 3"
              title="Connect your POS"
              meta="Kutlerri reads guest history and order patterns to seed intent."
            />
            <ul className="mt-6 space-y-2">
              {(
                [
                  { id: "toast",  name: "Toast",  meta: "Recommended · most US restaurants" },
                  { id: "square", name: "Square", meta: "Tipping, modifiers, dine-in" },
                  { id: "clover", name: "Clover", meta: "Multi-location supported" },
                ] as { id: POS; name: string; meta: string }[]
              ).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPos(p.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white ring-1 ${
                      pos === p.id ? "ring-brand" : "ring-line"
                    } active:bg-canvas text-left`}
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-ink-900">{p.name}</p>
                      <p className="text-[12px] text-ink-500 mt-0.5">{p.meta}</p>
                    </div>
                    {pos === p.id ? (
                      <span className="h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <Circle size={20} strokeWidth={1.5} className="text-ink-300" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 2 && (
          <>
            <Heading
              eyebrow="Step 2 of 3"
              title="Set your delivery radius"
              meta="Catering Agent will only surface businesses inside this radius."
            />

            <div className="mt-6 flex gap-2 justify-center">
              {([3, 5, 10] as Radius[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`min-h-[44px] min-w-[78px] px-4 rounded-full text-[14px] font-semibold ${
                    radius === r
                      ? "bg-ink-900 text-white"
                      : "bg-white text-ink-700 ring-1 ring-line"
                  }`}
                >
                  {r} mi
                </button>
              ))}
            </div>

            <FakeMap radius={radius} />
          </>
        )}

        {step === 3 && (
          <>
            <Heading
              eyebrow="Step 3 of 3"
              title="Pick which intent signals matter"
              meta="You can change these any time in Settings."
            />
            <ul className="mt-6 space-y-2">
              {SIGNALS.map((s) => {
                const Icon = s.icon;
                const on = signals[s.id];
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSignals((p) => ({ ...p, [s.id]: !p[s.id] }))
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white ring-1 ring-line active:bg-canvas text-left"
                    >
                      <span className="h-9 w-9 rounded-lg bg-canvas text-ink-700 flex items-center justify-center shrink-0">
                        <Icon size={16} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[14px] font-semibold text-ink-900 truncate">
                            {s.label}
                          </p>
                          {s.badge && (
                            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">
                              {s.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-ink-400 truncate">
                          {s.source}
                        </p>
                      </div>
                      <Toggle on={on} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="px-5 pt-2 pb-6 bg-canvas">
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            className="w-full min-h-[48px] rounded-xl bg-brand text-white text-[15px] font-semibold inline-flex items-center justify-center gap-1 active:opacity-90"
          >
            Continue
            <ChevronRight size={18} strokeWidth={2.2} />
          </button>
        ) : (
          <Link
            href="/"
            className="w-full min-h-[48px] rounded-xl bg-brand text-white text-[15px] font-semibold inline-flex items-center justify-center active:opacity-90"
          >
            Finish setup
          </Link>
        )}
      </div>
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5 py-3">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1 rounded-full transition-all ${
            n === current ? "w-7 bg-ink-900" : "w-3 bg-ink-300"
          }`}
        />
      ))}
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: string;
}) {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
        {eyebrow}
      </p>
      <h1 className="text-[24px] leading-[28px] font-semibold tracking-tightish text-ink-900 mt-1">
        {title}
      </h1>
      <p className="mt-2 text-[13.5px] text-ink-500 leading-[19px]">{meta}</p>
    </>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      className={`relative inline-block h-6 w-10 rounded-full transition-colors ${
        on ? "bg-brand" : "bg-ink-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function FakeMap({ radius }: { radius: Radius }) {
  const ringSize =
    radius === 3 ? "h-32 w-32" : radius === 5 ? "h-44 w-44" : "h-60 w-60";
  return (
    <div className="mt-6 relative h-64 rounded-2xl bg-white ring-1 ring-line overflow-hidden">
      {/* grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ECECEF 1px, transparent 1px), linear-gradient(to bottom, #ECECEF 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`relative ${ringSize}`}>
          <div className="absolute inset-0 rounded-full bg-brand/10 ring-1 ring-brand/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-3 w-3 rounded-full bg-brand ring-4 ring-white" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] text-ink-500 bg-white/85 px-2 py-1 rounded-md">
        <MapPin size={12} strokeWidth={1.75} />
        Round Rock, TX · {radius} mi
      </div>
    </div>
  );
}
