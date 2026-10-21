import React from "react";
import {
  COLORS,
  LEGS,
  PATHS,
  PUP_EYE_Y,
  PUP_R,
  PUP_W,
  POSES,
  computeFrame,
  type PupPose,
} from "./pupGeometry";

const STROKE_INK = {
  stroke: COLORS.ink,
  strokeWidth: 3.4,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const STROKE_OUTLINE = {
  ...STROKE_INK,
  fill: "none",
};

function Leg({
  part,
  d,
  len,
  fill,
  transform,
  opacity,
}: {
  part: string;
  d: string;
  len: number;
  fill: string;
  transform?: string;
  opacity?: number;
}) {
  return (
    <g data-p={part} transform={transform} opacity={opacity}>
      <path d={`${d}Z`} fill={fill} />
      <path d={d} {...STROKE_OUTLINE} />
      <path d={PATHS.toes(len)} {...STROKE_OUTLINE} strokeWidth={2.4} />
    </g>
  );
}

function Pupils() {
  return (
    <>
      <ellipse cx={194} cy={PUP_EYE_Y} rx={7.4} ry={8.6} fill={COLORS.ink} />
      <ellipse cx={230} cy={PUP_EYE_Y} rx={7.4} ry={8.6} fill={COLORS.ink} />
      <circle cx={196.6} cy={PUP_EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={232.6} cy={PUP_EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={192} cy={PUP_EYE_Y + 3.2} r={1.2} fill="#fff" />
      <circle cx={228} cy={PUP_EYE_Y + 3.2} r={1.2} fill="#fff" />
    </>
  );
}

export function PupVector({
  pose = "sit",
  facing = "right",
  className = "",
  label,
  style,
}: {
  pose?: string | PupPose;
  facing?: "left" | "right" | number;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const p = typeof pose === "string" ? POSES[pose] ?? POSES.sit : pose;
  const f = computeFrame(p);
  const facingDir = typeof facing === "number" ? facing : facing === "left" ? -1 : 1;
  const rootTransform =
    facingDir < 0 ? `translate(${PUP_W} 0) scale(-1 1)` : undefined;

  return (
    <svg
      viewBox={`0 0 ${PUP_W} ${PUP_R}`}
      className={`pup-svg ${className}`}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
      focusable="false"
    >
      <g data-p="root" transform={rootTransform}>
        <ellipse
          data-p="shadow"
          cx={PATHS.shadow.cx}
          cy={PATHS.shadow.cy}
          rx={PATHS.shadow.rx}
          ry={PATHS.shadow.ry}
          fill={COLORS.ink}
          opacity={f.shadowOpacity}
          transform={f.shadow}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        <g data-p="body" transform={f.body} opacity={f.side}>
          <Leg
            part="bf"
            d={LEGS.backFar}
            len={PUP_R - 192}
            fill={COLORS.shadow}
            transform={f.bf}
            opacity={f.backLegs}
          />
          <Leg
            part="ff"
            d={LEGS.frontFar}
            len={PUP_R - 192}
            fill={COLORS.shadow}
            transform={f.ff}
          />
          <g data-p="tail" transform={f.tail}>
            <path d={PATHS.tailStem} {...STROKE_OUTLINE} strokeWidth={9} />
            <path
              d={PATHS.tailStem}
              stroke={COLORS.fur}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <path d={PATHS.tail} fill={COLORS.fur} {...STROKE_INK} />
          </g>
          <Leg
            part="bn"
            d={LEGS.back}
            len={PUP_R - 194}
            fill={COLORS.fur}
            transform={f.bn}
            opacity={f.backLegs}
          />
          <path d={PATHS.body} fill={COLORS.fur} {...STROKE_INK} />
          <path d={PATHS.chest} fill={COLORS.fur} {...STROKE_INK} />
          <Leg
            part="fn"
            d={LEGS.front}
            len={PUP_R - 194}
            fill={COLORS.fur}
            transform={f.fn}
          />
        </g>

        <g data-p="haunch" opacity={f.haunchOpacity} transform={f.haunch}>
          <path d={PATHS.haunch} fill={COLORS.fur} {...STROKE_INK} />
          <path d={PATHS.haunchPaw} fill={COLORS.fur} {...STROKE_INK} />
          <path d="M132 222v5M139 222v5" {...STROKE_OUTLINE} strokeWidth={2.4} />
        </g>

        <g data-p="head" transform={f.head}>
          <path d={PATHS.collar} fill={COLORS.collar} {...STROKE_INK} strokeWidth={3} />
          <path d={PATHS.tag} fill={COLORS.muzzle} {...STROKE_INK} strokeWidth={2.4} />
          <path
            data-p="earL"
            d={PATHS.earL}
            fill={COLORS.shadow}
            {...STROKE_INK}
            transform={f.earL}
          />
          <path
            data-p="earR"
            d={PATHS.earR}
            fill={COLORS.shadow}
            {...STROKE_INK}
            transform={f.earR}
          />
          <path d={PATHS.head} fill={COLORS.fur} {...STROKE_INK} />
          <path d={PATHS.topknot} fill={COLORS.fur} {...STROKE_INK} strokeWidth={3} />
          <path d={PATHS.muzzle} fill={COLORS.muzzle} />
          <circle cx={181} cy={116} r={7} fill={COLORS.blush} opacity={0.85} />
          <circle cx={243} cy={116} r={7} fill={COLORS.blush} opacity={0.85} />
          <g data-p="eyes" transform={f.eyes}>
            <g data-p="open" opacity={f.openEyes}>
              <g data-p="blink" transform={f.blink}>
                <Pupils />
              </g>
            </g>
          </g>
          <path
            data-p="happy"
            d="M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101"
            {...STROKE_OUTLINE}
            opacity={f.happyEyes}
          />
          <path
            data-p="shut"
            d="M186.5 97 Q194 103.5 201.5 97 M222.5 97 Q230 103.5 237.5 97"
            {...STROKE_OUTLINE}
            opacity={f.shutEyes}
          />
          <path d={PATHS.nose} fill={COLORS.ink} />
          <path d={PATHS.mouth} {...STROKE_OUTLINE} strokeWidth={3} />
          <path
            data-p="tongue"
            d={PATHS.tongue}
            fill="#e98c8c"
            stroke={COLORS.ink}
            strokeWidth={2.2}
            strokeLinejoin="round"
            opacity={f.tongue}
          />
          <g data-p="mouth" opacity={f.mouth}>
            <path
              d={PATHS.mouthOpen}
              fill="#6b2a1c"
              {...STROKE_INK}
              strokeWidth={2.6}
            />
            <path
              d="M206.5 133.5 Q212 130 217.5 133.5 Q215 138 212 138 Q209 138 206.5 133.5 Z"
              fill="#e98c8c"
            />
          </g>
        </g>

        <g data-p="ledge" opacity={f.ledge}>
          <path d={PATHS.ledgePaws} fill={COLORS.fur} {...STROKE_INK} />
          <path d={PATHS.ledgeToes} {...STROKE_OUTLINE} strokeWidth={2.4} />
        </g>
      </g>
    </svg>
  );
}
