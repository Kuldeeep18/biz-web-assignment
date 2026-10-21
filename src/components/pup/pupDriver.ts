import {
  PUP_W,
  PUP_HEAD_CENTER,
  PUP_EYE_Y,
  PUP_R,
  POSES,
  computeFrame,
  interpolatePose,
  DEFAULT_DYNAMICS,
  type PupPose,
  type PupDynamics,
} from "./pupGeometry";

const ATTR_BINDINGS: [string, string, string][] = [
  ["root", "transform", "root"],
  ["shadow", "transform", "shadow"],
  ["shadow", "opacity", "shadowOpacity"],
  ["body", "transform", "body"],
  ["body", "opacity", "side"],
  ["bf", "transform", "bf"],
  ["bf", "opacity", "backLegs"],
  ["bn", "transform", "bn"],
  ["bn", "opacity", "backLegs"],
  ["ff", "transform", "ff"],
  ["fn", "transform", "fn"],
  ["tail", "transform", "tail"],
  ["haunch", "transform", "haunch"],
  ["haunch", "opacity", "haunchOpacity"],
  ["head", "transform", "head"],
  ["earL", "transform", "earL"],
  ["earR", "transform", "earR"],
  ["eyes", "transform", "eyes"],
  ["open", "opacity", "openEyes"],
  ["blink", "transform", "blink"],
  ["happy", "opacity", "happyEyes"],
  ["shut", "opacity", "shutEyes"],
  ["tongue", "opacity", "tongue"],
  ["mouth", "opacity", "mouth"],
  ["ledge", "opacity", "ledge"],
];

const spring = (dt: number, speed: number) => 1 - Math.exp(-dt / speed);
const clamp = (val: number, min = -1, max = 1) => Math.max(min, Math.min(max, val));

export class PupDriver {
  svg: SVGElement;
  els = new Map<string, Element>();
  written = new Map<string, string>();
  pose: PupPose;
  target: PupPose;
  m: PupDynamics;
  facing: number;
  facingTarget: number;
  strideTarget = 0;
  wagTarget = 0.35;
  gazeTarget = { x: 0, y: 0 };
  tilt = 0;
  tiltTarget = 0;
  earV = 0;
  nextBlink = 1.2;
  blinkAt = -1;
  woofUntil = 0;
  bounce = 0;
  bounceV = 0;
  offset = 0;
  offsetTarget = 0;
  pet = 0;
  petTarget = 0;
  turn = 0.07;
  lean = 0;

  constructor(svg: SVGElement, initialPose = "sit", facing = 1) {
    this.svg = svg;
    this.m = { ...DEFAULT_DYNAMICS };
    this.facing = facing;
    this.facingTarget = facing;
    svg.querySelectorAll("[data-p]").forEach((el) => {
      const p = el.getAttribute("data-p");
      if (p) this.els.set(p, el);
    });
    this.pose = { ...(POSES[initialPose] ?? POSES.sit) };
    this.target = this.pose;
  }

  setPose(pose: string | PupPose) {
    this.target = typeof pose === "string" ? POSES[pose] ?? POSES.sit : pose;
  }

  jump(pose: string, facing?: number) {
    this.pose = { ...(POSES[pose] ?? POSES.sit) };
    this.target = this.pose;
    if (facing !== undefined) {
      this.facing = this.facingTarget = facing;
    }
  }

  face(dir: number, turnSpeed = 0.07) {
    this.facingTarget = dir;
    this.turn = turnSpeed;
  }

  get facingDir() {
    return this.facingTarget;
  }

  stride(s: number) {
    this.strideTarget = clamp(s, 0, 1);
  }

  advance(d: number) {
    this.m.phase += (d / 46) * Math.PI;
  }

  walkedTo(d: number) {
    this.m.phase = (d / 46) * Math.PI;
  }

  wag(w: number) {
    this.wagTarget = clamp(w, 0, 1);
  }

  cock(deg: number) {
    this.tiltTarget = deg;
  }

  lookAt(point: { x: number; y: number } | null) {
    if (!point) {
      this.gazeTarget = { x: 0, y: 0 };
      return;
    }
    const r = this.svg.getBoundingClientRect();
    const headX = this.facingTarget > 0 ? PUP_HEAD_CENTER[0] : PUP_W - PUP_HEAD_CENTER[0];
    const sx = r.left + (headX / PUP_W) * r.width;
    const sy = r.top + (PUP_EYE_Y / PUP_R) * r.height;
    const dx = point.x - sx;
    const dy = point.y - sy;
    const dist = Math.hypot(dx, dy) || 1;
    const strength = Math.min(1, dist / 160);
    this.gazeTarget = {
      x: (dx / dist) * strength * this.facingTarget,
      y: (dy / dist) * strength,
    };
  }

  woof(now: number) {
    this.woofUntil = now + 0.34;
    this.bounceV = -150;
    this.earV += 260;
  }

  jolt(power = 1) {
    this.earV += 220 * power;
  }

  hop(power = 1) {
    this.bounceV = -230 * power;
    this.earV += 200 * power;
  }

  yawn(now: number, dur = 0.9) {
    this.woofUntil = now + dur;
  }

  dash(offset: number) {
    this.offsetTarget = offset;
  }

  petting(active: boolean) {
    this.petTarget = active ? 1 : 0;
  }

  reset() {
    this.strideTarget = 0;
    this.wagTarget = 0.35;
    this.tiltTarget = 0;
    this.offsetTarget = 0;
    this.gazeTarget = { x: 0, y: 0 };
  }

  tick(dt: number, time: number) {
    const delta = Math.min(dt, 0.05);
    const m = this.m;
    m.time = time;

    this.pose = interpolatePose(this.pose, this.target, spring(delta, 0.16));
    this.facing += (this.facingTarget - this.facing) * spring(delta, this.turn);

    m.stride += (this.strideTarget - m.stride) * spring(delta, 0.12);
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0;

    m.wag += (this.wagTarget - m.wag) * spring(delta, 0.4);
    m.gazeX += (this.gazeTarget.x - m.gazeX) * spring(delta, 0.07);
    m.gazeY += (this.gazeTarget.y - m.gazeY) * spring(delta, 0.07);

    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * spring(delta, 0.18);
    this.earV += (-150 * m.ear - 10 * this.earV) * delta;
    m.ear = clamp(m.ear + this.earV * delta, -28, 28);

    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * delta;
    this.bounce += this.bounceV * delta;

    const prevOffset = this.offset;
    this.offset += (this.offsetTarget - this.offset) * spring(delta, 0.2);
    if (Math.abs(this.offsetTarget - this.offset) < 0.05) {
      this.offset = this.offsetTarget;
    }
    const offsetDiff = Math.abs(this.offset - prevOffset);
    if (offsetDiff) this.advance(offsetDiff);

    const speedStride = delta > 0 ? Math.min(1, offsetDiff / delta / 180) : 0;
    this.pet += (this.petTarget - this.pet) * spring(delta, 0.15);

    if (time > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = time;
      this.nextBlink = time + 2.2 + 3.8 * Math.random();
      if (Math.random() < 0.18) {
        this.nextBlink = time + 0.32;
      }
    }
    const blinkProgress = (time - this.blinkAt) / 0.15;
    m.blink = blinkProgress >= 0 && blinkProgress <= 1 ? Math.sin(blinkProgress * Math.PI) : 0;

    const currentPose: PupPose = {
      ...this.pose,
      headRot: this.pose.headRot + this.tilt,
      bodyRot: this.pose.bodyRot + this.lean,
      bodyY: this.pose.bodyY + this.bounce,
      headY: this.pose.headY + 1.15 * this.bounce,
      mouth: time < this.woofUntil ? 1 : this.pose.mouth,
      happy: Math.max(this.pose.happy, this.pet),
    };

    const dynamicsToUse = speedStride > m.stride ? { ...m, stride: speedStride } : m;
    const frame = computeFrame(currentPose, dynamicsToUse);

    const facingVal = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing;
    const rootTransform = `translate(${this.offset.toFixed(1)} 0) translate(${PUP_W / 2} 0) scale(${facingVal.toFixed(3)} 1) translate(${-PUP_W / 2} 0)`;

    for (const [part, attr, prop] of ATTR_BINDINGS) {
      const el = this.els.get(part);
      if (!el) continue;
      const val = prop === "root" ? rootTransform : String((frame as Record<string, string | number>)[prop]);
      const key = `${part}:${attr}`;
      if (this.written.get(key) !== val) {
        el.setAttribute(attr, val);
        this.written.set(key, val);
      }
    }
  }
}

export type ActionContext = {
  d: PupDriver;
  rest: PupPose;
  facing: number;
  say: (text: string, duration?: number) => void;
  hearts: () => void;
};

export type ActionStep = [time: number, fn: (now: number) => void];

export function spawnHearts(parent: HTMLElement, x: number, y: number) {
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("span");
    heart.className = "pup-heart";
    heart.textContent = "♥";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    parent.append(heart);

    const dx = (Math.random() - 0.5) * 90;
    const dy = -70 - 60 * Math.random();

    heart
      .animate(
        [
          { transform: "translate(-50%, 0) scale(0.4)", opacity: 0 },
          { opacity: 1, offset: 0.2 },
          {
            transform: `translate(calc(-50% + ${dx.toFixed(0)}px), ${dy.toFixed(0)}px) scale(1.1)`,
            opacity: 0,
          },
        ],
        {
          duration: 1150 + 110 * i,
          delay: 80 * i,
          easing: "cubic-bezier(.2,.7,.3,1)",
          fill: "backwards",
        }
      )
      .finished.then(
        () => heart.remove(),
        () => heart.remove()
      );
  }
}

export const PUP_ACTIONS: Record<string, (ctx: ActionContext, now: number) => ActionStep[]> = {
  woof: ({ d, say }, now) => [
    [now, (t) => { d.woof(t); say("woof!"); }],
    [now + 0.42, (t) => { d.woof(t); say("woof woof!"); }],
  ],
  spin: ({ d, rest, facing, say }, now) => [
    [now, () => { d.setPose("stand"); d.hop(0.5); }],
    [now + 0.14, () => d.face(facing === 1 ? -1 : 1)],
    [now + 0.38, () => d.face(facing)],
    [now + 0.62, () => d.face(facing === 1 ? -1 : 1)],
    [now + 0.86, () => { d.face(facing); say("wheee!"); }],
    [now + 1.3, () => d.setPose(rest)],
  ],
  beg: ({ d, rest, say }, now) => [
    [now, () => { d.setPose("beg"); d.wag(1); say("treat, please?", 1.7); }],
    [now + 1.9, () => { d.setPose(rest); d.wag(0.7); }],
  ],
  bow: ({ d, rest, say }, now) => [
    [now, () => { d.setPose("bow"); d.wag(1); say("play with me!"); }],
    [now + 0.55, () => d.hop(0.45)],
    [now + 1.7, () => { d.setPose(rest); d.wag(0.7); }],
  ],
  hop: ({ d, rest, say }, now) => [
    [now, () => { d.setPose("hop"); d.hop(1.1); say("boing!"); }],
    [now + 0.36, () => d.setPose(rest)],
    [now + 0.62, () => { d.setPose("hop"); d.hop(0.8); }],
    [now + 0.98, () => d.setPose(rest)],
  ],
  love: ({ d, rest, say, hearts }, now) => [
    [now, () => { d.setPose({ ...rest, happy: 1, tongue: 1 }); d.wag(1); hearts(); say("I like you!", 1.5); }],
    [now + 1.9, () => { d.setPose(rest); d.wag(0.7); }],
  ],
  tilt: ({ d, say }, now) => [
    [now, () => { d.cock(-14); say("hm?"); }],
    [now + 0.8, () => d.cock(12)],
    [now + 1.6, () => d.cock(0)],
  ],
  sneeze: ({ d, say }, now) => [
    [now, () => d.cock(-8)],
    [now + 0.32, (t) => { d.cock(10); d.jolt(1.4); d.hop(0.35); d.yawn(t, 0.22); say("achoo!"); }],
    [now + 0.8, () => d.cock(0)],
  ],
  zoomies: ({ d, rest, facing, say }, now) => [
    [now, () => { d.setPose("walk"); d.wag(1); say("zoomies!", 2); }],
    [now + 0.05, () => { d.face(1); d.dash(70); }],
    [now + 0.5, () => { d.face(-1); d.dash(-70); }],
    [now + 0.98, () => { d.face(1); d.dash(50); }],
    [now + 1.4, () => { d.face(-1); d.dash(-30); }],
    [now + 1.78, () => { d.face(1); d.dash(0); }],
    [now + 2.25, () => { d.face(facing); d.setPose(rest); d.wag(0.7); }],
  ],
  peekaboo: ({ d, say }, now) => [
    [now, () => d.setPose({ ...POSES.peek, headY: 120 })],
    [now + 0.55, () => { d.setPose("peek"); d.jolt(1.2); say("peekaboo!"); }],
  ],
  wake: ({ d, rest, say }, now) => [
    [now, (t) => { d.setPose("settle"); d.yawn(t, 0.9); say("*yaaawn*"); }],
    [now + 1.25, () => { d.setPose({ ...POSES.settle, happy: 1 }); d.wag(0.8); say("five more minutes…", 1.6); }],
    [now + 3.1, () => { d.setPose(rest); d.wag(0); say("zzz", 2); }],
  ],
};
