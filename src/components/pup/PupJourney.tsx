"use client";

import React, { useEffect, useRef } from "react";
import { PupVector } from "./PupVector";
import { PupDriver, PUP_ACTIONS, spawnHearts, type ActionStep } from "./pupDriver";
import { POSES, PUP_W } from "./pupGeometry";

const PAW_PATH =
  "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5z M14.6 22.8c-2.8 0-5 2.9-5 6.4s2.2 6.4 5 6.4 5-2.9 5-6.4-2.2-6.4-5-6.4z M24.2 9.6c-2.9 0-5.2 3.1-5.2 7s2.3 7 5.2 7 5.2-3.1 5.2-7-2.3-7-5.2-7z M39.8 9.6c-2.9 0-5.2 3.1-5.2 7s2.3 7 5.2 7 5.2-3.1 5.2-7-2.3-7-5.2-7z M49.4 22.8c-2.8 0-5 2.9-5 6.4s2.2 6.4 5 6.4 5-2.9 5-6.4-2.2-6.4-5-6.4z";

type Point = { x: number; y: number };

type StopData = {
  el: HTMLElement;
  rect: DOMRect;
  pose: string;
  facing: number;
  act: string;
  behind: boolean;
  lane: boolean;
  scale: number;
  centerX: number;
  centerY: number;
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function bezierPoint(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const inv = 1 - t;
  const inv2 = inv * inv;
  const inv3 = inv2 * inv;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: inv3 * p0.x + 3 * inv2 * t * c1.x + 3 * inv * t2 * c2.x + t3 * p1.x,
    y: inv3 * p0.y + 3 * inv2 * t * c1.y + 3 * inv * t2 * c2.y + t3 * p1.y,
  };
}

export function PupJourney() {
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layerEl = layerRef.current;
    const actorEl = actorRef.current;
    const bodyEl = bodyRef.current;
    const bubbleEl = bubbleRef.current;
    const printsEl = printsRef.current;
    if (!layerEl || !actorEl || !bodyEl || !bubbleEl || !printsEl) return;

    const svg = bodyEl.querySelector<SVGElement>("svg");
    if (!svg) return;

    const printSvgs = Array.from(printsEl.querySelectorAll<SVGElement>("svg"));
    let printIdx = 0;

    let driver: PupDriver | null = null;
    let stops: StopData[] = [];
    let stopHoldRanges: [start: number, end: number][] = [];
    let isInitialized = false;

    let activeStopIdx = -1;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now() / 1000;
    let lastScrollTime = lastTime;
    let scrollDir = 1;
    let prevPos: Point | null = null;
    let bubbleHideTime = 0;
    let actionQueue: ActionStep[] = [];
    let busyUntil = 0;
    let mousePos: { x: number; y: number; t: number } | null = null;
    let treadmillPrevLeft: number | null = null;
    let treadmillIdleTimer = 0;
    let autoActionTimer = lastTime;

    const say = (text: string, dur = 1.6) => {
      bubbleEl.textContent = text;
      bubbleEl.dataset.show = "true";
      bubbleHideTime = performance.now() / 1000 + dur;
    };

    const actionCtx = {
      get d() { return driver!; },
      get rest() {
        const key = activeStopIdx >= 0 ? stops[activeStopIdx]?.pose ?? "sit" : "sit";
        return POSES[key] ?? POSES.sit;
      },
      get facing() {
        return activeStopIdx >= 0 ? stops[activeStopIdx]?.facing ?? 1 : 1;
      },
      say,
      hearts: () => {
        if (prevPos) spawnHearts(layerEl, prevPos.x, prevPos.y);
      },
    };

    const measureStops = () => {
      const stopEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-pup-stop]")
      ).filter((el) => el.getClientRects().length > 0);

      if (stopEls.length < 2) {
        if (isInitialized) teardown();
        return;
      }

      const scroll = window.scrollY;
      stops = stopEls.map((el) => {
        const rect = el.getBoundingClientRect();
        const pose = el.dataset.pose || "sit";
        const facing = el.dataset.facing === "left" ? -1 : 1;
        const act = el.dataset.act || "";
        const behind = el.dataset.behind === "true";
        const lane = el.dataset.lane === "true";
        const scale = clamp(rect.width / PUP_W, 0.45, 1.4);

        return {
          el,
          rect,
          pose,
          facing,
          act,
          behind,
          lane,
          scale,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + scroll + rect.height * 0.72,
        };
      });

      const viewportH = window.innerHeight;
      stopHoldRanges = stops.map((s, idx) => {
        const top = s.centerY - viewportH * 0.55;
        const bottom = s.centerY - viewportH * 0.45;
        return [
          idx === 0 ? -Infinity : top,
          idx === stops.length - 1 ? Infinity : bottom,
        ];
      });

      for (let i = 0; i < stopHoldRanges.length - 1; i++) {
        const cur = stopHoldRanges[i];
        const nxt = stopHoldRanges[i + 1];
        if (nxt[0] < cur[1]) {
          const mid = (cur[1] + nxt[0]) / 2;
          cur[1] = mid;
          nxt[0] = mid;
        }
      }

      if (!isInitialized) {
        isInitialized = true;
        document.documentElement.dataset.pup = "live";
        layerEl.hidden = false;
        driver = new PupDriver(svg, stops[0].pose, stops[0].facing);
        activeStopIdx = 0;
      }
    };

    const getJourneyProgress = (scrollY: number) => {
      if (stops.length < 2) return null;
      if (scrollY <= stopHoldRanges[0][1]) {
        return { k: 0, t: 0 };
      }
      for (let i = 0; i < stops.length - 1; i++) {
        const endHold = stopHoldRanges[i][1];
        const nextStartHold = stopHoldRanges[i + 1][0];
        if (scrollY < nextStartHold) {
          const dist = Math.max(1, nextStartHold - endHold);
          return { k: i, t: clamp((scrollY - endHold) / dist, 0, 1) };
        }
        if (scrollY <= stopHoldRanges[i + 1][1]) {
          return { k: i + 1, t: 0 };
        }
      }
      return { k: stops.length - 1, t: 0 };
    };

    let rafId: number | null = null;

    const onFrame = () => {
      if (!isInitialized || !driver) return;
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastTime);
      lastTime = now;

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(scrollDiff) > 0.5) {
        lastScrollTime = now;
        scrollDir = scrollDiff > 0 ? 1 : -1;
      }

      while (actionQueue.length && actionQueue[0][0] <= now) {
        const step = actionQueue.shift();
        step?.[1](now);
      }

      const progress = getJourneyProgress(currentScrollY);
      if (!progress) {
        rafId = requestAnimationFrame(onFrame);
        return;
      }

      const { k, t } = progress;
      const isResting = t === 0;

      let targetX = 0;
      let targetY = 0;
      let targetScale = 1;
      let isFront = true;
      let isAirborne = false;

      if (isResting) {
        const stop = stops[k];
        targetScale = stop.scale;
        targetX = stop.centerX;
        targetY = stop.centerY - currentScrollY;
        isFront = !stop.behind;

        if (activeStopIdx !== k) {
          activeStopIdx = k;
          actionQueue = [];
          driver.reset();
          driver.setPose(stop.pose);
          driver.face(stop.facing, 0.14);
          driver.stride(0);
          driver.wag(stop.act === "basket" ? 0.3 : 0.7);
          driver.jolt(0.4);
          autoActionTimer = now + 2.5;

          if (stop.act === "peekaboo") {
            actionQueue = PUP_ACTIONS.peekaboo(actionCtx, now);
          }
        }

        const treadmill = stop.el.closest("[data-treadmill]") ?? document.querySelector("[data-treadmill]");
        if (treadmill && !actionQueue.length) {
          const tLeft = treadmill.getBoundingClientRect().left;
          const tDiff = treadmillPrevLeft === null ? 0 : tLeft - treadmillPrevLeft;
          treadmillPrevLeft = tLeft;

          driver.walkedTo(-tLeft / targetScale);
          if (Math.abs(tDiff) > 0.15) {
            treadmillIdleTimer = 0;
            driver.setPose("walk");
            driver.stride(1);
            driver.face(tDiff < 0 ? 1 : -1, 0.16);
          } else {
            treadmillIdleTimer += dt;
            if (treadmillIdleTimer > 0.25) {
              driver.setPose("stand");
              driver.stride(0);
            }
          }
        } else {
          treadmillPrevLeft = null;
        }

        if (stop.act === "tilt" && !actionQueue.length && now - autoActionTimer > 1.2) {
          const s = Math.sin(0.9 * now);
          driver.cock(s > 0.35 ? 13 : s < -0.35 ? -10 : 0);
        }

        if (stop.act === "basket" && !actionQueue.length && now > autoActionTimer) {
          autoActionTimer = now + 4 + 3 * Math.random();
          if (Math.random() < 0.7) driver.jolt(0.55);
          else driver.yawn(now, 0.7);
        }

        if (!actionQueue.length && !treadmill && stop.act !== "basket" && now - autoActionTimer > 9) {
          autoActionTimer = now;
          if (Math.random() < 0.55) {
            actionQueue = PUP_ACTIONS.tilt(actionCtx, now);
          } else {
            actionQueue = [
              [now, () => driver?.wag(1)],
              [now + 2.4, () => driver?.wag(0.7)],
            ];
          }
        }
      } else {
        activeStopIdx = -1;
        const stopA = stops[k];
        const stopB = stops[k + 1];

        const p0: Point = {
          x: stopA.centerX,
          y: stopA.centerY - currentScrollY,
        };
        const p1: Point = {
          x: stopB.centerX,
          y: stopB.centerY - currentScrollY,
        };

        const dx = p1.x - p0.x;
        const c1: Point = { x: p0.x + dx * 0.2, y: p0.y + (p1.y - p0.y) * 0.1 };
        const c2: Point = { x: p1.x - dx * 0.2, y: p1.y - (p1.y - p0.y) * 0.1 };

        const smoothT = t * t * (3 - 2 * t);
        const pos = bezierPoint(p0, c1, c2, p1, smoothT);
        targetX = pos.x;
        targetY = pos.y;
        targetScale = lerp(stopA.scale, stopB.scale, t);

        isAirborne = (stopA.behind && t < 0.36) || (stopB.behind && t > 0.68);
        isFront = !(stopA.behind && t < 0.12) && !(stopB.behind && t > 0.92);

        if (isAirborne) {
          driver.setPose("hop");
          driver.stride(0);
        } else {
          driver.setPose("walk");
          driver.stride(1);
        }

        driver.advance(Math.abs(scrollDiff) * 0.85);

        if (prevPos) {
          const moveX = targetX - prevPos.x;
          if (Math.abs(moveX) > 0.6) {
            driver.face(moveX > 0 ? 1 : -1, 0.16);
          }
        }

        if (printSvgs.length && prevPos && !isAirborne && Math.abs(scrollDiff) > 2) {
          const pSvg = printSvgs[printIdx++ % printSvgs.length];
          const angle = Math.atan2(targetY - prevPos.y, targetX - prevPos.x) + Math.PI / 2;
          const sz = 14 * Math.max(0.75, targetScale);
          pSvg.style.transform = `translate(${targetX - sz / 2}px, ${targetY - sz / 2}px) rotate(${angle}rad)`;
          pSvg.style.width = `${sz}px`;
          pSvg.style.height = `${sz}px`;
          pSvg.animate(
            [
              { opacity: 0 },
              { opacity: 0.45, offset: 0.08 },
              { opacity: 0.45, offset: 0.5 },
              { opacity: 0 },
            ],
            { duration: 2400, easing: "ease-out" }
          );
        }
      }

      layerEl.dataset.front = isFront ? "true" : "false";

      if (mousePos && now - mousePos.t < 2.5) {
        driver.lookAt(mousePos);
      } else {
        driver.lookAt(null);
      }

      actorEl.style.transform = `translate3d(${(targetX - (PUP_W / 2) * targetScale).toFixed(2)}px, ${(targetY - 228 * targetScale).toFixed(2)}px, 0) scale(${targetScale.toFixed(3)})`;

      if (bubbleEl.dataset.show === "true" && now > bubbleHideTime) {
        bubbleEl.dataset.show = "false";
      }

      driver.tick(dt, now);
      prevPos = { x: targetX, y: targetY };
      rafId = requestAnimationFrame(onFrame);
    };

    const teardown = () => {
      isInitialized = false;
      delete document.documentElement.dataset.pup;
      layerEl.hidden = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    measureStops();
    window.addEventListener("resize", measureStops);
    window.addEventListener("scroll", () => {
      if (!isInitialized) measureStops();
    }, { passive: true });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        mousePos = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
      }
    };

    const onClick = () => {
      if (!driver) return;
      const now = performance.now() / 1000;
      const actions = ["woof", "hop", "love", "tilt", "sneeze", "spin"];
      const actName = actions[Math.floor(Math.random() * actions.length)];
      driver.reset();
      actionQueue = (PUP_ACTIONS[actName] ?? PUP_ACTIONS.woof)(actionCtx, now);
      busyUntil = (actionQueue[actionQueue.length - 1]?.[0] ?? now) + 0.4;
      autoActionTimer = now;
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && driver) {
        driver.petting(true);
        driver.wag(1);
      }
    };

    const onPointerLeave = () => {
      if (driver) {
        driver.petting(false);
        driver.wag(0.7);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    actorEl.addEventListener("click", onClick);
    actorEl.addEventListener("pointerenter", onPointerEnter);
    actorEl.addEventListener("pointerleave", onPointerLeave);

    rafId = requestAnimationFrame(onFrame);

    return () => {
      teardown();
      window.removeEventListener("resize", measureStops);
      window.removeEventListener("pointermove", onPointerMove);
      actorEl.removeEventListener("click", onClick);
      actorEl.removeEventListener("pointerenter", onPointerEnter);
      actorEl.removeEventListener("pointerleave", onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={printsRef} className="pup-prints" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>

      <div ref={layerRef} className="pup-layer" hidden data-front="true" aria-hidden="true">
        <div ref={actorRef} className="pup-actor">
          <div ref={bodyRef} className="pup-actor__body">
            <PupVector pose="peek" />
          </div>
          <span className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
