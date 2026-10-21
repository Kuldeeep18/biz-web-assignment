// Where the travelling pup should be for a given scroll position.
//
// Every [data-pup-stop] on the page is a resting spot. While a stop's section is
// in view the pup rests on it; between two rests it walks a curve across the
// screen. Rests are measured as scroll ranges, so the pup's place is a pure
// function of scrollY and scrolling back up replays the walk in reverse.

import { PUP_W } from "./pupGeometry";

export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; right: number; bottom: number };
/** Visible part of the 300×240 pup drawing: left, top, right, bottom */
type Box = [number, number, number, number];

/** The pup's feet in its drawing; this is the point that sits on a stop */
export const ANCHOR: Point = { x: 150, y: 228 };
// A peeking pup only shows its head, so it lines up by its chin instead
const PEEK_ANCHOR: Point = { x: 150, y: 159 };

const WALK_BOX: Box = [48, 30, 288, 236];
const POSE_BOX: Record<string, Box> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};

// A stop is "home" while its middle is between 42% and 78% down the screen
const REST_BAND = [0.42, 0.78];
// Travelling pups are drawn a little larger than the stop they rest on
const TRAVEL_SCALE = 1.12;

/** How a stop moves as the page scrolls: with the page, or held by a sticky parent */
type Track = { kind: "page"; top: number } | { kind: "pin"; top: number; from: number; to: number };

export type Stop = {
  x: number;
  track: Track;
  scale: number;
  behind: boolean;
  box: Box;
  pose: string;
  facing: number;
  act: string;
  /** element whose sideways movement the pup walks along with, in place */
  treadmill: HTMLElement | null;
};

export type Journey = {
  stops: Stop[];
  /** scroll range of each rest; the gaps between them are the walks */
  rests: [number, number][];
  /** scroll distance over which a walk eases in from and out to a moving stop */
  blend: number;
};

export type Place = {
  x: number;
  y: number;
  scale: number;
  front: boolean;
  airborne: boolean;
  /** index of the stop being rested on, or walked from */
  k: number;
  /** 0 while resting, 0–1 through a walk */
  t: number;
  /** distance walked along the current curve, for leg swing and paw prints */
  walked: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const smootherstep = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before a, 1 after b, eased in between */
const ramp = (a: number, b: number, v: number) => (a === b ? +(v >= b) : smoothstep(clamp01((v - a) / (b - a))));
const lerpBox = (a: Box, b: Box, t: number): Box => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];

// Rounded max/min: equal to Math.max/min away from the limit, but with a soft
// corner so the pup eases into a screen edge instead of stopping dead
const softMax = (v: number, floor: number, k = 8) => {
  const s = (v - floor) / k;
  return s > 20 ? v : floor + k * Math.log1p(Math.exp(s));
};
const softMin = (v: number, ceil: number, k = 8) => -softMax(-v, -ceil, k);

function cubic(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y };
}

/** The part of the viewport the pup may use: below the header, above the phone action bar */
export function safeArea(): Rect {
  const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
  const bar = document.querySelector("[data-whatsapp-bar]");
  const barTop = bar?.getClientRects().length ? bar.getBoundingClientRect().top : innerHeight;
  return { left: 10, top: header + 10, right: document.documentElement.clientWidth - 10, bottom: Math.min(innerHeight, barTop) - 10 };
}

function trackTop(track: Track, scroll: number) {
  if (track.kind === "page") return track.top - scroll;
  if (scroll < track.from) return track.top - (scroll - track.from);
  if (scroll > track.to) return track.top - (scroll - track.to);
  return track.top;
}

/** Screen position of a stop's anchor at a given scroll */
function anchorOf(stop: Stop, scroll: number): Point {
  return { x: stop.x + ANCHOR.x * stop.scale, y: trackTop(stop.track, scroll) + ANCHOR.y * stop.scale };
}

/** Moves an anchor point so the visible part of the pup stays inside `safe` */
function keepInside(p: Point, scale: number, box: Box, safe: Rect): Point {
  const left = (ANCHOR.x - box[0]) * scale;
  const right = (box[2] - ANCHOR.x) * scale;
  const up = (ANCHOR.y - box[1]) * scale;
  const down = (box[3] - ANCHOR.y) * scale;
  return {
    x:
      safe.right - safe.left > left + right
        ? softMin(softMax(p.x, safe.left + left), safe.right - right)
        : (safe.left + safe.right) / 2 - (right - left) / 2,
    y: safe.bottom - safe.top > up + down ? softMin(softMax(p.y, safe.top + up), safe.bottom - down) : safe.bottom - down,
  };
}

function stickyParent(el: HTMLElement) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (getComputedStyle(p).position === "sticky") return p;
  }
  return null;
}

/** Works out how a stop at `rect` moves with scrolling, including sticky parents */
function trackFor(el: HTMLElement, rect: DOMRect): Track {
  const sticky = stickyParent(el);
  if (!sticky) return { kind: "page", top: rect.top + scrollY };

  const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const offset = rect.top - sticky.getBoundingClientRect().top;
  // Measure where the sticky block sits unpinned, and where its parent ends
  const inline = sticky.style.position;
  sticky.style.position = "relative";
  const natural = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const end = parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = inline;

  const from = natural.top + scrollY - stickyTop;
  const to = end + scrollY - natural.height - stickyTop;
  if (to <= from) return { kind: "page", top: natural.top + scrollY + offset };
  return { kind: "pin", top: stickyTop + offset, from, to };
}

/** Scroll range during which the pup should rest on `stop` */
function restRange(stop: Stop, scene: Element | null, safe: Rect): [number, number] {
  if (stop.track.kind === "pin") return [stop.track.from, stop.track.to];

  const h = safe.bottom - safe.top;
  const top = stop.track.top + stop.box[1] * stop.scale;
  const bottom = stop.track.top + stop.box[3] * stop.scale;
  const mid = (top + bottom) / 2;
  // scrolls at which the pup's middle enters the band at the bottom and leaves it at the top
  let start = mid - (safe.top + REST_BAND[1] * h);
  let end = mid - (safe.top + REST_BAND[0] * h);
  // ...but only while the whole pup is on screen
  start = Math.max(start, bottom - safe.bottom);
  end = Math.min(end, top - safe.top);
  if (start > end) start = end = mid - (safe.top + h / 2);

  // Leave before the section itself scrolls away: by the time its top is 8% above the header
  if (scene && stop.act !== "basket" && stop.act !== "peekaboo") {
    const leaveBy = scene.getBoundingClientRect().top + scrollY - safe.top + 0.08 * h;
    const onScreen = bottom - safe.bottom;
    if (end > leaveBy) {
      const newEnd = Math.max(leaveBy, onScreen + 0.12 * h);
      return [Math.max(onScreen, newEnd - Math.max(end - start, 0.2 * h)), newEnd];
    }
  }
  return [start, end];
}

/**
 * Makes the rests fit together: the first and last are open-ended, overlapping
 * rests meet halfway, and every walk gets at least `walks[i]` of scroll so a long
 * trip across the screen isn't over in a flick of the wheel.
 */
function fitRests(ranges: [number, number][], walks: number[], maxScroll: number) {
  const rests = ranges.map(([a, b]): [number, number] => (a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]));
  if (!rests.length) return rests;
  rests[0][0] = -Infinity;
  const last = rests[rests.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);

  for (let i = 0; i < rests.length - 1; i++) {
    const cur = rests[i];
    const next = rests[i + 1];
    if (next[0] < cur[1]) {
      const mid = (cur[1] + next[0]) / 2;
      cur[1] = Math.max(cur[0], mid);
      next[0] = Math.min(next[1], mid);
      if (next[0] < cur[1]) next[0] = cur[1];
    }
    // Not enough room to walk: take it from both rests, then from whichever has some left
    let short = walks[i] - (next[0] - cur[1]);
    if (short > 0) {
      const fromCur = Math.min(short / 2, cur[1] - cur[0]);
      const fromNext = Math.min(short / 2, next[1] - next[0]);
      cur[1] -= fromCur;
      next[0] += fromNext;
      short -= fromCur + fromNext;
      const more = Math.min(short, next[1] - next[0]);
      next[0] += more;
      short -= more;
      if (short > 0) cur[1] -= Math.min(short, cur[1] - cur[0]);
    }
  }
  // Making room for the last walk can push the last rest past the bottom of the
  // page; it must stay reachable, so the rest before it gives way instead
  if (rests.length > 1 && last[0] > maxScroll - 1) {
    const before = rests[rests.length - 2];
    before[1] = Math.max(before[0], before[1] - (last[0] - (maxScroll - 1)));
    last[0] = Math.max(before[1], maxScroll - 1);
  }
  for (const r of rests) if (r[1] < r[0]) r[1] = r[0];
  return rests;
}

/** Reads every visible stop on the page; null when there are fewer than two */
export function measureJourney(): Journey | null {
  const els = [...document.querySelectorAll<HTMLElement>("[data-pup-stop]")].filter((el) => el.getClientRects().length);
  if (els.length < 2) return null;

  const safe = safeArea();
  const vh = innerHeight;
  const stops: Stop[] = [];
  const ranges: [number, number][] = [];

  for (const el of els) {
    const rect = el.getBoundingClientRect();
    const pose = el.dataset.pose || "sit";
    const act = el.dataset.act ?? "";
    const base = rect.width / PUP_W;
    // the basket pup must fit its basket exactly
    const scale = act === "basket" ? base : TRAVEL_SCALE * base;
    const anchor = pose === "peek" ? PEEK_ANCHOR : ANCHOR;
    const track = trackFor(el, rect);
    // Grow the pup around its anchor so the larger pup still stands on the same spot
    track.top += anchor.y * (base - scale);
    const scene = el.closest("[data-pup-scene]");
    const stop: Stop = {
      x: rect.left + anchor.x * (base - scale),
      track,
      scale,
      behind: el.dataset.behind === "true",
      box: POSE_BOX[pose] ?? WALK_BOX,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      treadmill: act === "treadmill" ? scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null : null,
    };
    stops.push(stop);
    ranges.push(restRange(stop, scene, safe));
  }

  // Each walk needs scroll in proportion to how far the pup travels, within half to 1.4 screens
  const bandH = (REST_BAND[1] - REST_BAND[0]) * vh;
  const walks = stops.slice(1).map((b, i) => {
    const dx = Math.abs(anchorOf(b, 0).x - anchorOf(stops[i], 0).x);
    return Math.min(1.4 * vh, Math.max(0.5 * vh, 1.15 * Math.hypot(dx, bandH)));
  });
  const maxScroll = document.documentElement.scrollHeight - innerHeight;

  return { stops, rests: fitRests(ranges, walks, maxScroll), blend: 0.12 * vh };
}

/** Which stop the scroll is at (t = 0), or how far through the walk after it */
function progress(rests: [number, number][], scroll: number) {
  if (!rests.length || scroll <= rests[0][1]) return { k: 0, t: 0 };
  for (let i = 0; i < rests.length - 1; i++) {
    const leave = rests[i][1];
    const arrive = rests[i + 1][0];
    if (scroll < arrive) return { k: i, t: clamp01((scroll - leave) / Math.max(1, arrive - leave)) };
    if (scroll <= rests[i + 1][1]) return { k: i + 1, t: 0 };
  }
  return { k: rests.length - 1, t: 0 };
}

/**
 * The curve between two rests. It leaves and arrives level, like a pup trotting
 * off and pulling up; a mostly vertical trip bows out sideways towards the middle
 * of the screen so the pup visibly walks rather than sliding up or down.
 */
function walkCurve(p0: Point, p1: Point, safe: Rect) {
  const dx = p1.x - p0.x;
  const reach = 0.45 * Math.abs(dx);
  const dir = dx >= 0 ? 1 : -1;
  let c1 = { x: p0.x + dir * reach, y: p0.y };
  let c2 = { x: p1.x - dir * reach, y: p1.y };
  const minDx = 0.14 * (safe.right - safe.left);
  if (Math.abs(dx) < minDx) {
    const towardsMiddle = (p0.x + p1.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1;
    const bow = towardsMiddle * (minDx - Math.abs(dx)) * 0.9;
    c1 = { x: c1.x + bow, y: lerp(p0.y, p1.y, 0.2) };
    c2 = { x: c2.x + bow, y: lerp(p0.y, p1.y, 0.8) };
  }
  const inside = (p: Point) => ({
    x: Math.min(safe.right, Math.max(safe.left, p.x)),
    y: Math.min(safe.bottom, Math.max(safe.top, p.y)),
  });
  return { p0, c1: inside(c1), c2: inside(c2), p1 };
}

function lengthAlong(curve: ReturnType<typeof walkCurve>, t: number) {
  const steps = Math.max(1, Math.ceil(32 * t));
  let length = 0;
  let prev = curve.p0;
  for (let i = 1; i <= steps; i++) {
    const p = cubic(curve.p0, curve.c1, curve.c2, curve.p1, (i / steps) * t);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return length;
}

/** Where the pup is drawn at `scroll` */
export function placeAt(j: Journey, scroll: number, safe: Rect): Place {
  const { k, t } = progress(j.rests, scroll);
  const a = j.stops[k];

  if (t <= 0 || k >= j.stops.length - 1) {
    const p = keepInside(anchorOf(a, scroll), a.scale, a.box, safe);
    return { ...p, scale: a.scale, front: !a.behind, airborne: false, k, t: 0, walked: 0 };
  }

  const b = j.stops[k + 1];
  const leave = j.rests[k][1];
  const arrive = j.rests[k + 1][0];
  const span = Math.max(1, arrive - leave);
  const v = clamp01((scroll - leave) / span);

  // The walk runs between where A was when the pup left and where B will be when
  // it arrives, so it crosses the screen instead of being dragged with the page
  const from = anchorOf(a, leave);
  const to = anchorOf(b, arrive);
  const curve = walkCurve(from, to, safe);
  const eased = smootherstep(v);
  const p = cubic(curve.p0, curve.c1, curve.c2, curve.p1, eased);
  const scale = lerp(a.scale, b.scale, smoothstep(clamp01(v / 0.65)));

  // Near each end, follow the stop as it actually moves so leaving and arriving don't jump
  const edge = Math.min(0.3, Math.max(0.06, j.blend / span));
  const fromA = 1 - ramp(0, edge, v);
  const intoB = ramp(1 - edge, 1, v);
  let y = p.y + fromA * (anchorOf(a, scroll).y - from.y) + intoB * (anchorOf(b, scroll).y - to.y);

  // Hop out of, and into, stops the pup sits behind (the hero quilt, the basket)
  let airborne = false;
  if (a.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * a.scale, 72);
    airborne = v < 0.32;
  }
  if (b.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * b.scale, 60);
    airborne = true;
  }
  const front = !((a.behind && v < 0.12) || (b.behind && v > 0.92));

  // Clamp with the outline of the pose it is leaving or arriving in
  const box =
    v < 0.5
      ? lerpBox(a.box, WALK_BOX, ramp(0, a.behind ? 0.36 : 0.06, v))
      : lerpBox(WALK_BOX, b.box, ramp(b.behind ? 0.68 : 0.94, 1, v));
  const inside = keepInside({ x: p.x, y }, scale, box, safe);
  return { ...inside, scale, front, airborne, k, t: v, walked: lengthAlong(curve, eased) };
}

/**
 * When scrolling stops partway through a hop out of or into a stop, the scroll
 * position the pup should settle at instead, so it never hangs in mid-air.
 */
export function settledScroll(j: Journey, scroll: number) {
  const { k, t } = progress(j.rests, scroll);
  if (t <= 0 || k >= j.stops.length - 1) return scroll;
  const hopOut = j.stops[k].behind ? 0.36 : 0;
  const hopIn = j.stops[k + 1].behind ? 0.68 : 1;
  let settled = t;
  if (t < hopOut) settled = t < hopOut / 2 ? 0 : hopOut;
  else if (t > hopIn) settled = t > (1 + hopIn) / 2 ? 1 : hopIn;
  if (settled === t) return scroll;
  const leave = j.rests[k][1];
  return leave + settled * (j.rests[k + 1][0] - leave);
}
