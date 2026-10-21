// Precise vector geometry, poses, and kinematics for TeddyPups mascot

export const PUP_W = 300;
export const PUP_R = 240;
export const PUP_EYE_Y = 98;
export const PUP_GROUND_Y = 228;
export const PUP_HEAD_CENTER: [number, number] = [212, 100];

export const COLORS = {
  ink: "#2a170e",
  fur: "#f2be6b",
  muzzle: "#fbe3b4",
  shadow: "#e4a352",
  blush: "#f9b9a6",
  collar: "#a24a1a",
} as const;

export const JOINTS = {
  bodyRotCenter: [196, 206] as [number, number],
  shoulderN: [186, 194] as [number, number],
  shoulderF: [168, 192] as [number, number],
  hipN: [110, 194] as [number, number],
  hipF: [94, 192] as [number, number],
  tailBase: [84, 150] as [number, number],
  earLOrigin: [174, 82] as [number, number],
  earROrigin: [250, 82] as [number, number],
};

function cloud(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  bumps: number,
  r: number,
  phase = -Math.PI / 2,
  skewDeg = 0
): string {
  const rad = (skewDeg * Math.PI) / 180;
  const pt = (t: number, extraR: number) => {
    const nx = Math.cos(t) * (rx + extraR);
    const ny = Math.sin(t) * (ry + (ry / rx) * extraR);
    const px = cx + nx * Math.cos(rad) - ny * Math.sin(rad);
    const py = cy + nx * Math.sin(rad) + ny * Math.cos(rad);
    return `${px.toFixed(1)} ${py.toFixed(1)}`;
  };

  let d = "";
  for (let i = 0; i < bumps; i++) {
    const t0 = phase + (i / bumps) * Math.PI * 2;
    const t1 = phase + ((i + 1) / bumps) * Math.PI * 2;
    const tm = (t0 + t1) / 2;
    d += (i === 0 ? `M${pt(t0, 0)}` : "") + `Q${pt(tm, 2.1 * r)} ${pt(t1, 0)}`;
  }
  return `${d}Z`;
}

function legPath(topWidth: number, length: number): string {
  const half = topWidth / 2;
  return `M${-half} -14 C${-half} 4 -12 ${length - 18} -12 ${length - 9} C-12 ${length - 2} -7 ${length} 0 ${length} C9 ${length} 13 ${length - 3} 13 ${length - 9} C13 ${length - 18} ${half} 4 ${half} -14`;
}

export const PATHS = {
  body: cloud(140, 170, 64, 36, 15, 3.4, 0.95 * Math.PI),
  chest: cloud(192, 166, 30, 32, 9, 3.2, 0.6 * Math.PI),
  tail: cloud(70, 126, 17, 16, 9, 3.2),
  tailStem: "M86 152 C80 146 76 140 74 136",
  haunch: cloud(110, 204, 30, 24, 10, 3.2, Math.PI),
  haunchPaw:
    "M112 214 C126 212 142 214 146 221 C148 226 144 229 136 229 L116 229 C108 229 104 224 106 219 Z",
  head: cloud(212, 100, 51, 46, 16, 3.6),
  topknot: cloud(212, 52, 17, 12, 8, 2.9, Math.PI),
  earL: cloud(170, 112, 19, 34, 10, 3.2, -Math.PI / 2, 12),
  earR: cloud(254, 112, 19, 34, 10, 3.2, -Math.PI / 2, -12),
  muzzle:
    "M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z",
  nose: "M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z",
  mouth:
    "M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2",
  mouthOpen:
    "M203 126 Q212 122 221 126 Q219 138 212 139 Q205 138 203 126 Z",
  tongue: "M207.6 127.4 Q212 136.6 216.4 127.4 Z",
  collar: "M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z",
  tag: "M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z",
  ledgePaws:
    "M175 159 C175 148 181 142 190 142 C199 142 205 148 205 159 Z M219 159 C219 148 225 142 234 142 C243 142 249 148 249 159 Z",
  ledgeToes: "M186 153 v-4.5 M194 153 v-4.5 M230 153 v-4.5 M238 153 v-4.5",
  shadow: { cx: 150, cy: 230, rx: 92, ry: 7 },
  toes(y: number) {
    return `M-3.5 ${y - 7} v5 M4.5 ${y - 7} v5`;
  },
};

export const LEGS = {
  front: legPath(24, PUP_GROUND_Y - JOINTS.shoulderN[1]),
  frontFar: legPath(22, PUP_GROUND_Y - JOINTS.shoulderF[1]),
  back: legPath(30, PUP_GROUND_Y - JOINTS.hipN[1]),
  backFar: legPath(28, PUP_GROUND_Y - JOINTS.hipF[1]),
};

export type PupPose = {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  stretch: number;
  headX: number;
  headY: number;
  headRot: number;
  earL: number;
  earR: number;
  tail: number;
  fn: number;
  ff: number;
  bn: number;
  bf: number;
  sit: number;
  eyes: number;
  happy: number;
  tongue: number;
  mouth: number;
  front: number;
};

const BASE_POSE: PupPose = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};

export const POSES: Record<string, PupPose> = {
  stand: BASE_POSE,
  walk: { ...BASE_POSE, tail: -6, tongue: 1 },
  sit: { ...BASE_POSE, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...BASE_POSE, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...BASE_POSE, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1, tongue: 0 },
  lie: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 12, headY: 40, headRot: 3, fn: -84, ff: -80, sit: 1, tail: 58, tongue: 0 },
  sleep: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 14, headY: 44, headRot: -8, fn: -84, ff: -80, sit: 1, tail: 64, eyes: 0, earL: 4, earR: -4 },
  settle: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 10, headY: 16, fn: -84, ff: -80, sit: 1, tail: 40, tongue: 1 },
  hop: { ...BASE_POSE, bodyRot: -9, stretch: 1.06, headY: -6, fn: -42, ff: -32, bn: 40, bf: 30, earL: -26, earR: 26, tail: -24, tongue: 1 },
  sniff: { ...BASE_POSE, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...BASE_POSE, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: { ...BASE_POSE, bodyRot: -36, bodyY: -6, headX: -18, headY: -18, sit: 1, fn: -70, ff: -64, tail: 30, happy: 1, tongue: 1 },
};

export type PupDynamics = {
  phase: number;
  stride: number;
  time: number;
  wag: number;
  gazeX: number;
  gazeY: number;
  blink: number;
  ear: number;
};

export const DEFAULT_DYNAMICS: PupDynamics = {
  phase: 0,
  stride: 0,
  time: 0,
  wag: 0,
  gazeX: 0,
  gazeY: 0,
  blink: 0,
  ear: 0,
};

const round2 = (n: number) => Math.round(100 * n) / 100;
const rotStr = (deg: number, [cx, cy]: [number, number]) => `rotate(${round2(deg)} ${cx} ${cy})`;

export function interpolatePose(from: PupPose, to: PupPose, t: number): PupPose {
  const out = { ...from };
  for (const k of Object.keys(from) as (keyof PupPose)[]) {
    out[k] = from[k] + (to[k] - from[k]) * t;
  }
  return out;
}

export function computeFrame(p: PupPose, d: PupDynamics = DEFAULT_DYNAMICS) {
  const sinPhase = Math.sin(d.phase);
  const sinPhasePi = Math.sin(d.phase + Math.PI);
  const legSwing = 20 + 10 * d.stride;
  const bobFactor = (1 - Math.cos(2 * d.phase)) / 2;
  const isMoving = +(d.stride > 0.01);
  const breathe = Math.sin(2.4 * d.time) * (1 - isMoving);

  const bodyY = p.bodyY - bobFactor * (2.5 + 4 * d.stride) * isMoving + 0.6 * breathe;
  const bodyRot = p.bodyRot + 1.6 * Math.sin(d.phase) * isMoving;
  const counterRot = -p.bodyRot;

  const wagAmp = 5 + 17 * d.wag;
  const wagSpeed = 1.2 + 2.6 * d.wag;
  const tailRot = p.tail + Math.sin(d.time * wagSpeed * Math.PI * 2) * wagAmp;

  const headBob = -((1 - Math.cos(2 * d.phase - 0.7)) / 2) * (2 + 3 * d.stride) * isMoving + 0.9 * breathe;

  const [bx, by] = JOINTS.bodyRotCenter;
  const [snx, sny] = JOINTS.shoulderN;
  const [sfx, sfy] = JOINTS.shoulderF;
  const [hnx, hny] = JOINTS.hipN;
  const [hfx, hfy] = JOINTS.hipF;

  return {
    body: `translate(${round2(p.bodyX)} ${round2(bodyY)}) ${rotStr(bodyRot, [bx, by])} translate(${bx} 0) scale(${round2(p.stretch)} 1) translate(${-bx} 0)`,
    fn: `translate(${snx} ${sny}) rotate(${round2(p.fn + counterRot + sinPhase * legSwing * isMoving)})`,
    ff: `translate(${sfx} ${sfy}) rotate(${round2(p.ff + counterRot + sinPhasePi * legSwing * isMoving)})`,
    bn: `translate(${hnx} ${hny}) rotate(${round2(p.bn + sinPhasePi * legSwing * isMoving)})`,
    bf: `translate(${hfx} ${hfy}) rotate(${round2(p.bf + sinPhase * legSwing * isMoving)})`,
    tail: rotStr(tailRot, JOINTS.tailBase),
    haunch: `translate(0 ${round2(-0.06 * p.bodyRot)})`,
    head: `translate(${round2(p.headX)} ${round2(p.headY + headBob)}) ${rotStr(
      p.headRot + 1.4 * Math.sin(d.phase) * isMoving,
      PUP_HEAD_CENTER
    )}`,
    earL: rotStr(p.earL + d.ear + 4 * Math.sin(2 * d.phase) * isMoving, JOINTS.earLOrigin),
    earR: rotStr(p.earR - d.ear - 4 * Math.sin(2 * d.phase) * isMoving, JOINTS.earROrigin),
    eyes: `translate(${round2(3.4 * d.gazeX)} ${round2(2.6 * d.gazeY)})`,
    blink: `translate(0 ${round2(PUP_EYE_Y * d.blink * 0.92)}) scale(1 ${round2(1 - 0.92 * d.blink)})`,
    openEyes: round2(Math.max(0, p.eyes - p.happy)),
    happyEyes: round2(Math.min(p.happy, p.eyes)),
    shutEyes: round2(1 - p.eyes),
    tongue: round2(p.tongue * (1 - p.mouth)),
    mouth: round2(p.mouth),
    backLegs: round2(1 - p.sit),
    haunchOpacity: round2(p.sit * (1 - p.front)),
    side: round2(1 - p.front),
    ledge: round2(p.front),
    shadow: `translate(${round2(0.6 * p.bodyX)} 0) scale(${round2(1 - 0.05 * bobFactor * isMoving)} 1)`,
    shadowOpacity: round2(0.12 * (1 - p.front)),
  };
}
