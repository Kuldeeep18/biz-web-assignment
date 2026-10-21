// One requestAnimationFrame loop shared by everything that moves with the scroll.
// Smooth scrolling must set this frame's scroll position before the pup reads it,
// otherwise the pup is drawn one frame behind the page and shivers against it.
// Callbacks run phase by phase: every "scroll" callback, then every "render" one.

type Phase = "scroll" | "render";
type FrameCallback = (time: number) => void;

const phases: Record<Phase, Set<FrameCallback>> = { scroll: new Set(), render: new Set() };
let rafId: number | null = null;

const tick = (time: number) => {
  rafId = null;
  for (const cb of phases.scroll) cb(time);
  for (const cb of phases.render) cb(time);
  if (phases.scroll.size || phases.render.size) rafId = requestAnimationFrame(tick);
};

/** Runs `cb` every frame in the given phase; returns a function that stops it. */
export function onFrame(phase: Phase, cb: FrameCallback) {
  phases[phase].add(cb);
  rafId ??= requestAnimationFrame(tick);
  return () => {
    phases[phase].delete(cb);
  };
}
