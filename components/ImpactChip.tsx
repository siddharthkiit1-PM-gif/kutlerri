import { DollarSign } from "lucide-react";

/** Compact $ impact chip. Used on Today cards, card detail, overnight log. */
export default function ImpactChip({
  usd,
  kind,
  tone = "neutral",
  size = "sm",
}: {
  usd: number;
  kind?: string;
  tone?: "neutral" | "brand";
  size?: "sm" | "md";
}) {
  const formatted = formatUSD(usd);
  const pad =
    size === "md" ? "px-2.5 py-1 text-[12.5px]" : "px-2 py-0.5 text-[11.5px]";
  const colors =
    tone === "brand"
      ? "bg-brand/10 text-brand"
      : "bg-canvas text-ink-700 ring-1 ring-line";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-tightish ${colors} ${pad}`}
      title={kind ? `${formatted} · ${kind}` : formatted}
    >
      <DollarSign
        size={size === "md" ? 12 : 11}
        strokeWidth={2.2}
        className="-ml-0.5 opacity-70"
        aria-hidden
      />
      <span className="num">{formatted.replace("$", "")}</span>
      {kind && (
        <span className="text-ink-400 font-medium normal-case ml-0.5 truncate max-w-[110px]">
          · {kind}
        </span>
      )}
    </span>
  );
}

function formatUSD(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k.toFixed(k >= 10 ? 0 : 1)}k`;
  }
  return `$${n}`;
}
