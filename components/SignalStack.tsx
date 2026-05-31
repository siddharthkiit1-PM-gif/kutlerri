import type { Signal } from "@/data/types";

export default function SignalStack({
  signals,
  dense = false,
}: {
  signals: Signal[];
  dense?: boolean;
}) {
  return (
    <ul className={`flex flex-col ${dense ? "gap-1.5" : "gap-2.5"}`}>
      {signals.map((s, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ink-300 shrink-0"
            aria-hidden
          />
          <div className="text-[13px] leading-[18px] text-ink-700">
            <span>{s.label}</span>
            <span className="text-ink-400"> — {s.source}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
