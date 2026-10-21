// Teddy, the fluffy apricot mascot. Pure SVG, no images.
//
// Fur is built from "clouds": a core ellipse ringed by bump circles. Every
// circle is drawn twice — first as a thick dark outline, then as a fill on
// top — so overlapping parts merge into one fluffy silhouette.

type Circle = [cx: number, cy: number, r: number];

function cloud(cx: number, cy: number, rx: number, ry: number, bumps: number, r: number, phase = -90): Circle[] {
  const out: Circle[] = [[cx, cy, Math.min(rx, ry)]];
  if (rx !== ry) {
    // fill out an oval core with a few inner circles
    const steps = 3;
    for (let i = -steps; i <= steps; i++) {
      const t = i / steps;
      if (rx > ry) out.push([cx + t * (rx - ry), cy, ry]);
      else out.push([cx, cy + t * (ry - rx), rx]);
    }
  }
  for (let i = 0; i < bumps; i++) {
    const a = ((phase + (360 / bumps) * i) * Math.PI) / 180;
    out.push([+(cx + rx * Math.cos(a)).toFixed(1), +(cy + ry * Math.sin(a)).toFixed(1), r]);
  }
  return out;
}

function Fur({ circles, className }: { circles: Circle[]; className?: string }) {
  return (
    <g className={className}>
      <g className="pup-outline">
        {circles.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g className="pup-fur">
        {circles.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </g>
  );
}

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="pup-muzzle" cx="0" cy="22" rx="27" ry="20" />
      <ellipse className="pup-cheek" cx="-31" cy="18" rx="8" ry="5.5" />
      <ellipse className="pup-cheek" cx="31" cy="18" rx="8" ry="5.5" />
      <g className="pup-eye">
        <ellipse className="pup-ink" cx="-18" cy="0" rx="6.5" ry="8.5" />
        <circle className="pup-shine" cx="-15.6" cy="-3.4" r="2.4" />
      </g>
      <g className="pup-eye">
        <ellipse className="pup-ink" cx="18" cy="0" rx="6.5" ry="8.5" />
        <circle className="pup-shine" cx="20.4" cy="-3.4" r="2.4" />
      </g>
      <path className="pup-ink" d="M-8 12c0-4 16-4 16 0 0 4.5-4.5 7.5-8 7.5s-8-3-8-7.5z" />
      <path className="pup-line" d="M0 19.5v4.5m-8 1.5c3.5 4.5 12.5 4.5 16 0" />
    </g>
  );
}

const HEAD = (cx: number, cy: number) => [...cloud(cx, cy, 48, 46, 14, 15), ...cloud(cx, cy - 56, 12, 12, 7, 9)];
const EARS = (cx: number, cy: number) => [
  ...cloud(cx - 54, cy + 14, 9, 20, 6, 11),
  ...cloud(cx + 54, cy + 14, 9, 20, 6, 11),
];

export type PupPose = "face" | "sit" | "walk";

export function Pup({
  pose = "sit",
  className,
  collar = true,
  title,
}: {
  pose?: PupPose;
  className?: string;
  collar?: boolean;
  title?: string;
}) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

  if (pose === "face") {
    // Head peeking over a ledge, paws resting on it
    return (
      <svg viewBox="0 0 200 200" className={`pup ${className ?? ""}`} {...a11y} overflow="visible">
        <Fur circles={[...EARS(100, 112), ...HEAD(100, 112)]} className="pup-bob" />
        <Face x={100} y={110} />
        <Fur circles={[...cloud(72, 186, 16, 10, 7, 7), ...cloud(128, 186, 16, 10, 7, 7)]} />
        <path className="pup-line" d="M66 182v8m12-8v8m44-8v8m12-8v8" strokeWidth="2.5" />
      </svg>
    );
  }

  if (pose === "walk") {
    // Side-on trot; legs swing via CSS (.pup-leg)
    return (
      <svg viewBox="0 0 260 200" className={`pup pup--walk ${className ?? ""}`} {...a11y} overflow="visible">
        <ellipse className="pup-shadow" cx="135" cy="192" rx="90" ry="7" />
        {[
          [100, 0],
          [176, 1],
        ].map(([x, i]) => (
          <g key={`b${x}`} className={`pup-leg pup-leg--${i ? "a" : "b"}`} style={{ transformOrigin: `${x}px 135px` }}>
            <Fur circles={[...cloud(x + 8, 160, 9, 20, 6, 8), ...cloud(x + 10, 183, 13, 8, 6, 6)]} className="pup-far" />
          </g>
        ))}
        <Fur
          circles={[
            ...cloud(150, 128, 58, 34, 16, 14),
            ...cloud(216, 92, 10, 12, 6, 9),
            ...cloud(70, 78, 44, 42, 13, 14),
            ...cloud(70, 26, 11, 11, 7, 8),
            ...cloud(36, 104, 8, 18, 6, 10),
          ]}
        />
        {[
          [92, 1],
          [168, 0],
        ].map(([x, i]) => (
          <g key={`f${x}`} className={`pup-leg pup-leg--${i ? "a" : "b"}`} style={{ transformOrigin: `${x}px 135px` }}>
            <Fur circles={[...cloud(x, 160, 9, 20, 6, 8), ...cloud(x - 2, 183, 13, 8, 6, 6)]} />
          </g>
        ))}
        <Face x={62} y={74} s={0.82} />
        {collar && <Collar x={74} y={114} w={62} />}
      </svg>
    );
  }

  // Sitting, facing us
  return (
    <svg viewBox="0 0 200 230" className={`pup ${className ?? ""}`} {...a11y} overflow="visible">
      <Fur circles={[...cloud(152, 182, 12, 12, 7, 9)]} className="pup-tail" />
      <Fur
        circles={[
          ...cloud(100, 166, 42, 44, 14, 14),
          ...cloud(74, 210, 16, 10, 7, 8),
          ...cloud(126, 210, 16, 10, 7, 8),
          ...EARS(100, 78),
          ...HEAD(100, 78),
        ]}
      />
      <path className="pup-line" d="M100 176v30M68 206v8m12-8v8m40-8v8m12-8v8" strokeWidth="2.5" />
      <Face x={100} y={76} />
      {collar && <Collar x={100} y={128} w={66} />}
    </svg>
  );
}

function Collar({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <path className="pup-collar" d={`M${x - w / 2} ${y - 4}q${w / 2} ${14} ${w} 0`} />
      <circle className="pup-tagdisc" cx={x} cy={y + 10} r="6.5" />
    </g>
  );
}
