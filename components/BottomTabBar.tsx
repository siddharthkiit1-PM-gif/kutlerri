"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChefHat, LineChart, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { href: "/",          label: "Today",    icon: Home,         match: (p: string) => p === "/" || p.startsWith("/card") || p.startsWith("/onboarding") || p.startsWith("/agent-log") },
  { href: "/catering",  label: "Catering", icon: ChefHat,      match: (p: string) => p.startsWith("/catering") },
  { href: "/insights",  label: "Insights", icon: LineChart,    match: (p: string) => p.startsWith("/insights") },
  { href: "/settings",  label: "Settings", icon: SettingsIcon, match: (p: string) => p.startsWith("/settings") },
];

export default function BottomTabBar() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Primary"
      className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur shadow-tab"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.75}
                  aria-hidden
                />
                <span className="tracking-tightish">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
