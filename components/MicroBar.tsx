/** Slim 0–100 progress bar — used as a micro-intent indicator next to a score. */
export default function MicroBar({
  value,
  tone = "auto",
  width = 56,
}: {
  value: number; // 0..100
  tone?: "auto" | "brand" | "neutral";
  width?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    tone === "neutral"
      ? "bg-ink-700"
      : tone === "brand"
      ? "bg-brand"
      : pct >= 80
      ? "bg-hot-bar"
      : pct >= 50
      ? "bg-warm-bar"
      : "bg-cold-bar";
  return (
    <span
      className="inline-block h-1.5 rounded-full bg-canvas overflow-hidden align-middle"
      style={{ width }}
      aria-hidden
    >
      <span
        className={`block h-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
