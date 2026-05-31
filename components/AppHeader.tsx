import { Bell, Search } from "lucide-react";

export default function AppHeader({
  eyebrow,
  title,
  meta,
  right,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="px-5 pt-3 pb-3 bg-canvas">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[22px] leading-[26px] font-semibold tracking-tightish text-ink-900 mt-0.5">
            {title}
          </h1>
          {meta && (
            <p className="text-[12px] text-ink-400 mt-1">{meta}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {right ?? (
            <>
              <IconButton ariaLabel="Search">
                <Search size={18} strokeWidth={1.75} />
              </IconButton>
              <IconButton ariaLabel="Notifications">
                <Bell size={18} strokeWidth={1.75} />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="h-11 w-11 rounded-full flex items-center justify-center text-ink-700 active:bg-line/70"
    >
      {children}
    </button>
  );
}
