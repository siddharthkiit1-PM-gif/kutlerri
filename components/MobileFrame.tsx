import BottomTabBar from "./BottomTabBar";

export default function MobileFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-stretch md:items-center justify-center md:py-10 md:px-6 bg-[#EDEDF1]">
      <div
        className="
          relative w-full md:w-[390px] md:max-w-[390px]
          md:h-[820px]
          bg-canvas md:rounded-[44px]
          md:shadow-frame md:ring-1 md:ring-black/5
          md:border md:border-black/10
          overflow-hidden
          flex flex-col
        "
      >
        {/* Desktop-only phone bezel notch hint */}
        <div className="hidden md:flex justify-center pt-2 pb-1">
          <div className="h-1.5 w-24 rounded-full bg-black/15" />
        </div>

        {/* Status bar (cosmetic) */}
        <div className="px-6 pt-2 pb-1 flex items-center justify-between text-[12px] font-medium text-ink-900">
          <span className="num">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <rect x="0.5" y="3" width="2" height="6" rx="0.5" fill="currentColor" />
              <rect x="4" y="2" width="2" height="7" rx="0.5" fill="currentColor" />
              <rect x="7.5" y="1" width="2" height="8" rx="0.5" fill="currentColor" />
              <rect x="11" y="0" width="2" height="9" rx="0.5" fill="currentColor" />
            </svg>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
              <path
                d="M1 5.4C2.6 3.8 4.7 3 7 3s4.4.8 6 2.4M3.2 7.2c1-1 2.4-1.5 3.8-1.5s2.8.5 3.8 1.5M5.4 9c.4-.4 1-.6 1.6-.6s1.2.2 1.6.6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none" aria-hidden>
              <rect
                x="0.5"
                y="0.5"
                width="20"
                height="10"
                rx="2.5"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <rect x="2" y="2" width="14" height="7" rx="1.2" fill="currentColor" />
              <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Scrollable content area */}
        <main className="phone-scroll flex-1 overflow-y-auto overscroll-contain pb-[88px]">
          {children}
        </main>

        {/* Bottom tab bar — sticky, in-frame */}
        <BottomTabBar />
      </div>
    </div>
  );
}
