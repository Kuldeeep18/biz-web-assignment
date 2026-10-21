/** Twinkling ✦ stars, positioned in % of the parent: [left, top, size px, delay s]. */
export function Stars({ stars, className = "" }: { stars: [number, number, number, number][]; className?: string }) {
  return (
    <div className={`stars pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {stars.map(([l, t, s, d], i) => (
        <i
          key={i}
          style={{ left: `${l}%`, top: `${t}%`, ["--s" as string]: `${s}px`, ["--d" as string]: `${d}s` }}
        >
          ✦
        </i>
      ))}
    </div>
  );
}
