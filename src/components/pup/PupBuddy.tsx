"use client";

import React, { useEffect, useRef } from "react";
import { PupVector } from "./PupVector";
import { PupDriver, PUP_ACTIONS, spawnHearts, type ActionStep } from "./pupDriver";
import { POSES, type PupPose } from "./pupGeometry";

const PEEK_ACTIONS = ["peekaboo", "woof", "tilt", "sneeze"];
const SNUG_ACTIONS = ["tilt", "love", "sneeze", "woof"];
const DEFAULT_ACTIONS = ["woof", "beg", "bow", "hop", "love", "tilt", "sneeze"];

export function PupBuddy({
  pose = "sit",
  facing = "right",
  act,
  label,
  className = "",
  style,
  asStop = false,
}: {
  pose?: string | PupPose;
  facing?: "left" | "right";
  act?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  asStop?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const bubbleEl = bubbleRef.current;
    if (!el || !bubbleEl) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const svg = el.querySelector<SVGElement>("svg");
    if (!svg) return;

    const dir = facing === "left" ? -1 : 1;
    const poseKey = typeof pose === "string" ? pose : "sit";
    const driver = new PupDriver(svg, poseKey, dir);
    driver.wag(0.6);

    let queue: ActionStep[] = [];
    let lastTime = performance.now() / 1000;
    let lastAutoAction = lastTime;
    let bubbleHideTime = 0;
    let mousePos: { x: number; y: number; t: number } | null = null;
    let actionBusy = false;
    let busyUntil = 0;
    let clickCount = 0;
    let lastClickTime = 0;
    let lastActionKey = "";

    const ctx = {
      d: driver,
      rest: POSES[poseKey] ?? POSES.sit,
      facing: dir,
      say: (msg: string, dur = 1.4) => {
        bubbleEl.textContent = msg;
        bubbleEl.dataset.show = "true";
        bubbleHideTime = performance.now() / 1000 + dur;
      },
      hearts: () => spawnHearts(el, el.clientWidth * (dir > 0 ? 0.7 : 0.3), 0.25 * el.clientHeight),
    };

    let rafId: number | null = null;
    let isIntersecting = false;

    const onTick = () => {
      if (!isIntersecting) return;
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastTime);
      lastTime = now;

      while (queue.length && queue[0][0] <= now) {
        const step = queue.shift();
        step?.[1](now);
      }

      const isBusy = now < busyUntil;
      if (actionBusy !== isBusy) {
        actionBusy = isBusy;
        el.toggleAttribute("data-playing", isBusy);
      }

      driver.lookAt(mousePos && now - mousePos.t < 3 ? mousePos : null);

      if (act === "tilt" && !queue.length) {
        const sinVal = Math.sin(0.9 * now);
        driver.cock(sinVal > 0.35 ? 13 : sinVal < -0.35 ? -10 : 0);
      }

      if (!queue.length && now - lastAutoAction > 9) {
        lastAutoAction = now;
        if (Math.random() < 0.5) {
          queue = PUP_ACTIONS.tilt(ctx, now);
        } else {
          queue = [
            [now, () => driver.wag(1)],
            [now + 2.2, () => driver.wag(0.6)],
          ];
        }
      }

      if (bubbleEl.dataset.show === "true" && now > bubbleHideTime) {
        bubbleEl.dataset.show = "false";
      }

      driver.tick(dt, now);
      rafId = requestAnimationFrame(onTick);
    };

    const updateRunning = (intersecting: boolean) => {
      if (asStop && document.documentElement.dataset.pup === "live") {
        intersecting = false;
      }
      if (intersecting !== isIntersecting) {
        isIntersecting = intersecting;
        if (intersecting) {
          lastTime = performance.now() / 1000;
          rafId = requestAnimationFrame(onTick);
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      updateRunning(entry.isIntersecting);
    });
    io.observe(el);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        mousePos = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
      }
    };

    const onClick = () => {
      const now = performance.now() / 1000;
      clickCount = now - lastClickTime < 0.7 ? clickCount + 1 : 1;
      lastClickTime = now;

      let pool = DEFAULT_ACTIONS;
      if (poseKey === "peek") pool = PEEK_ACTIONS;
      else if (poseKey === "snug") pool = SNUG_ACTIONS;

      const candidates = pool.filter((k) => k !== lastActionKey);
      const actionName =
        clickCount >= 4
          ? "zoomies"
          : candidates[Math.floor(Math.random() * candidates.length)] ?? "woof";

      lastActionKey = actionName;
      driver.reset();
      const fn = PUP_ACTIONS[actionName] ?? PUP_ACTIONS.woof;
      queue = fn(ctx, now);
      busyUntil = (queue[queue.length - 1]?.[0] ?? now) + 0.4;
      lastAutoAction = now;
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        driver.petting(true);
        driver.wag(1);
      }
    };

    const onPointerLeave = () => {
      driver.petting(false);
      driver.wag(0.6);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("click", onClick);
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      updateRunning(false);
      el.removeAttribute("data-playing");
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pose, facing, act, asStop]);

  return (
    <div
      ref={containerRef}
      className={`pup-buddy ${className}`}
      style={style}
      data-facing={facing}
    >
      <PupVector pose={pose} facing={facing} label={label} />
      <span ref={bubbleRef} aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}
