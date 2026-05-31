"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUBTABS = [
  { href: "/catering",            label: "Today" },
  { href: "/catering/businesses", label: "Businesses" },
  { href: "/catering/contacts",   label: "Contacts" },
  { href: "/catering/campaign",   label: "Campaign" },
  { href: "/catering/engage",     label: "Engage" },
];

export default function CateringSubTabs() {
  const pathname = usePathname() || "/catering";

  return (
    <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur hairline">
      <nav
        aria-label="Catering sections"
        className="phone-scroll overflow-x-auto"
      >
        <ul className="flex gap-1 px-4 py-2 min-w-max">
          {SUBTABS.map((t) => {
            const active =
              t.href === "/catering"
                ? pathname === "/catering"
                : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`block min-h-[44px] px-3 py-2.5 rounded-full text-[13px] font-semibold tracking-tightish transition-colors ${
                    active
                      ? "bg-ink-900 text-white"
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
