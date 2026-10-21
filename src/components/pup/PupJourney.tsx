"use client";

import React, { useEffect, useRef } from "react";
import { PupVector } from "./PupVector";
import { PupDriver, PUP_ACTIONS, spawnHearts, type ActionStep } from "./pupDriver";
import { POSES, PUP_W } from "./pupGeometry";
import { ANCHOR, measureJourney, placeAt, safeArea, settledScroll, type Journey, type Point } from "./pupPath";
import { onFrame } from "@/lib/frame";

const PAW_PATH =
  "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5z M14.6 22.8c-2.8 0-5 2.9-5 6.4s2.2 6.4 5 6.4 5-2.9 5-6.4-2.2-6.4-5-6.4z M24.2 9.6c-2.9 0-5.2 3.1-5.2 7s2.3 7 5.2 7 5.2-3.1 5.2-7-2.3-7-5.2-7z M39.8 9.6c-2.9 0-5.2 3.1-5.2 7s2.3 7 5.2 7 5.2-3.1 5.2-7-2.3-7-5.2-7z M49.4 22.8c-2.8 0-5 2.9-5 6.4s2.2 6.4 5 6.4 5-2.9 5-6.4-2.2-6.4-5-6.4z";

// Paw prints are left every PRINT_STEP drawing-pixels walked, alternating paws
const PRINT_STEP = 34;
// Seconds without scrolling before the pup settles out of a half-finished hop
const SETTLE_AFTER = 0.25;

/** One pup that walks from stop to stop as the page scrolls; the stops' own pups hide while it runs */
export function PupJourney() {
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleAtRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layerEl = layerRef.current;
    const actorEl = actorRef.current;
    const bodyEl = bodyRef.current;
    const bubbleAtEl = bubbleAtRef.current;
    const bubbleEl = bubbleRef.current;
    const printsEl = printsRef.current;
    const svg = bodyEl?.querySelector<SVGElement>("svg");
    if (!layerEl || !actorEl || !bodyEl || !bubbleAtEl || !bubbleEl || !printsEl || !svg) return;
    const prints = Array.from(printsEl.querySelectorAll<SVGElement>("svg"));

    let journey: Journey | null = null;
    let driver: PupDriver | null = null;

    let lastTime = performance.now() / 1000;
    let lastScroll = scrollY;
    let lastScrollTime = lastTime;
    let prev: Point | null = null;
    let drawn: { x: number; y: number; scale: number } | null = null;
    // Springy offset from the computed spot, so re-measuring or settling glides instead of jumping
    const offset = { x: 0, y: 0, scale: 0 };
    let settling = false;

    let restIdx = -1;
    let restSince = 0;
    let idleSince = 0;
    let nextBasketMove = 0;
    let stillFor = 0;
    let queue: ActionStep[] = [];
    let treadmillLeft: number | null = null;
    let treadmillIdle = 0;
    let printWalk = { k: -1, n: 0 };
    let printIdx = 0;
    let bubbleHideTime = 0;
    let mouse: { x: number; y: number; t: number } | null = null;

    const say = (text: string, dur = 1.6) => {
      bubbleEl.textContent = text;
      bubbleEl.dataset.show = "true";
      bubbleHideTime = performance.now() / 1000 + dur;
    };

    const actionCtx = {
      get d() {
        return driver!;
      },
      get rest() {
        const stop = restIdx >= 0 ? journey?.stops[restIdx] : null;
        return POSES[stop?.pose ?? "sit"] ?? POSES.sit;
      },
      get facing() {
        return restIdx >= 0 ? journey?.stops[restIdx]?.facing ?? 1 : 1;
      },
      say,
      hearts: () => {
        if (!drawn || !driver) return;
        const headX = driver.facingDir > 0 ? 212 : PUP_W - 212;
        spawnHearts(layerEl, drawn.x + (headX - ANCHOR.x) * drawn.scale, drawn.y - (ANCHOR.y - 40) * drawn.scale);
      },
    };

    const start = () => {
      const j = measureJourney();
      if (!j) return;
      journey = j;
      document.documentElement.dataset.pup = "live";
      layerEl.hidden = false;
      driver = new PupDriver(svg, j.stops[0].pose, j.stops[0].facing);
      lastScroll = scrollY;
      lastTime = lastScrollTime = performance.now() / 1000;
    };

    const stop = () => {
      journey = null;
      driver = null;
      restIdx = -1;
      delete document.documentElement.dataset.pup;
      layerEl.hidden = true;
    };

    // Layout moved (images, fonts, resize): measure again, keeping the pup where it is on screen
    let remeasureTimer = 0;
    const remeasure = () => {
      clearTimeout(remeasureTimer);
      remeasureTimer = window.setTimeout(() => {
        if (!journey) return start();
        const j = measureJourney();
        if (!j) return stop();
        journey = j;
        if (drawn) {
          const now = placeAt(j, scrollY, safeArea());
          offset.x = drawn.x - now.x;
          offset.y = drawn.y - now.y;
          offset.scale = drawn.scale - now.scale;
        }
      }, 120);
    };

    // Runs in the shared frame loop, after smooth scrolling has moved the page
    const renderFrame = () => {
      if (!journey || !driver) return;
      const j = journey;
      const d = driver;
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastTime);
      lastTime = now;

      const scroll = scrollY;
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (Math.abs(scrolled) > 0.5) lastScrollTime = now;

      while (queue.length && queue[0][0] <= now) queue.shift()![1](now);

      const target = now - lastScrollTime > SETTLE_AFTER ? settledScroll(j, scroll) : scroll;
      const place = placeAt(j, target, safeArea());

      const decay = Math.exp(-dt / 0.28);
      offset.x *= decay;
      offset.y *= decay;
      offset.scale *= decay;
      if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05) offset.x = offset.y = 0;
      // Starting or ending a settle: spring from where the pup was drawn
      const isSettling = target !== scroll;
      if (isSettling !== settling && drawn) {
        offset.x = drawn.x - place.x;
        offset.y = drawn.y - place.y;
      }
      settling = isSettling;

      const scale = place.scale + offset.scale;
      const x = place.x + offset.x;
      const y = place.y + offset.y;
      drawn = { x, y, scale };
      const stopAt = j.stops[place.k];

      if (place.t === 0) {
        if (restIdx !== place.k) {
          restIdx = place.k;
          restSince = idleSince = now;
          queue = [];
          treadmillLeft = null;
          d.reset();
          d.setPose(stopAt.pose);
          d.face(stopAt.facing, 0.14);
          d.stride(0);
          d.wag(stopAt.act === "basket" ? 0.3 : 0.7);
          d.jolt(0.4);
          nextBasketMove = now + 2.4;
          if (stopAt.act === "peekaboo") queue = PUP_ACTIONS.peekaboo(actionCtx, now);
        }

        // On a treadmill the pup walks in place, legs matching how far the track has moved
        if (stopAt.treadmill && !queue.length) {
          const left = stopAt.treadmill.getBoundingClientRect().left;
          const moved = treadmillLeft === null ? 0 : left - treadmillLeft;
          treadmillLeft = left;
          d.walkedTo(-left / scale);
          if (Math.abs(moved) > 0.15) {
            treadmillIdle = 0;
            d.setPose("walk");
            d.stride(1);
            d.face(moved < 0 ? 1 : -1, 0.16);
          } else if ((treadmillIdle += dt) > 0.25) {
            d.setPose("stand");
            d.stride(0);
          }
        }

        if (stopAt.act === "tilt" && !queue.length && now - restSince > 1.2) {
          const s = Math.sin(0.9 * now);
          d.cock(s > 0.35 ? 13 : s < -0.35 ? -10 : 0);
        }
        if (stopAt.act === "basket" && !queue.length && now > nextBasketMove) {
          nextBasketMove = now + 4.5 + 3 * Math.random();
          if (Math.random() < 0.7) d.jolt(0.55);
          else d.yawn(now, 0.7);
        }

        // Left alone for a while, the pup does a little something
        if (Math.abs(scrolled) > 0.5) idleSince = now;
        if (!queue.length && !stopAt.treadmill && stopAt.act !== "basket" && now - idleSince > 9) {
          idleSince = now;
          queue =
            Math.random() < 0.55
              ? PUP_ACTIONS.tilt(actionCtx, now)
              : [
                  [now, () => d.wag(1)],
                  [now + 2.4, () => d.wag(0.7)],
                ];
        }
      } else {
        if (restIdx !== -1) {
          restIdx = -1;
          queue = [];
          d.reset();
        }

        const step = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
        stillFor = step > 0.25 ? 0 : stillFor + dt;
        if (place.airborne) {
          d.setPose("hop");
          d.stride(0);
        } else if (stillFor > 0.3) {
          // scrolling paused mid-walk: stand and wait
          d.setPose("stand");
          d.stride(0);
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say("coming?");
        } else {
          d.setPose("walk");
          d.stride(1);
        }
        d.walkedTo(place.walked / Math.max(0.05, scale));

        if (prev) {
          const dx = x - prev.x;
          if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(y - prev.y)) d.face(dx > 0 ? 1 : -1, 0.16);
        }

        // Paw prints stay on the page where they were left
        const n = Math.floor(place.walked / (PRINT_STEP * scale));
        if (printWalk.k === place.k && n !== printWalk.n && !place.airborne && prev && prints.length) {
          const back = n % 2 === 1;
          const pawX = back ? 186 : 110;
          const boxLeft = x - ANCHOR.x * scale;
          const boxTop = y - ANCHOR.y * scale;
          const px = boxLeft + (d.facingDir > 0 ? pawX : PUP_W - pawX) * scale;
          const py = boxTop + 226 * scale + scroll + (back ? -4 : 4) * scale;
          const angle = Math.atan2(y - prev.y + scrolled, x - prev.x) + Math.PI / 2;
          const size = 14 * Math.max(0.75, 1.5 * scale);
          const print = prints[printIdx++ % prints.length];
          print.style.transform = `translate(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
          print.style.width = print.style.height = `${size.toFixed(1)}px`;
          print.animate([{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }], {
            duration: 2600,
            easing: "ease-out",
          });
        }
        printWalk = { k: place.k, n };
      }
      prev = { x, y };

      d.lookAt(mouse && now - mouse.t < 2.5 ? mouse : null);

      actorEl.style.transform = `translate3d(${(x - ANCHOR.x * scale).toFixed(2)}px, ${(y - ANCHOR.y * scale).toFixed(2)}px, 0)`;
      bodyEl.style.transform = `scale(${scale.toFixed(4)})`;
      layerEl.dataset.front = String(place.front);

      if (bubbleEl.dataset.show === "true") {
        if (now > bubbleHideTime) bubbleEl.dataset.show = "false";
        const headX = (d.facingDir > 0 ? 214 : PUP_W - 214) * scale;
        bubbleAtEl.style.transform = `translate(${headX.toFixed(1)}px, ${(30 * scale).toFixed(1)}px)`;
      }

      d.tick(dt, now);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
    };

    const onClick = () => {
      if (!driver) return;
      const now = performance.now() / 1000;
      const actions = ["woof", "hop", "love", "tilt", "sneeze", "spin"];
      const name = actions[Math.floor(Math.random() * actions.length)];
      driver.reset();
      queue = (PUP_ACTIONS[name] ?? PUP_ACTIONS.woof)(actionCtx, now);
      idleSince = now;
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && driver && restIdx >= 0) {
        driver.petting(true);
        driver.wag(1);
      }
    };

    const onPointerLeave = () => {
      if (!driver) return;
      driver.petting(false);
      if (restIdx >= 0) driver.wag(journey?.stops[restIdx]?.act === "basket" ? 0.3 : 0.7);
    };

    start();
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    // entrance animations (like the hero mascot rising) move stops without resizing anything
    addEventListener("animationend", remeasure);
    document.fonts?.ready.then(remeasure);
    addEventListener("pointermove", onPointerMove, { passive: true });
    actorEl.addEventListener("click", onClick);
    actorEl.addEventListener("pointerenter", onPointerEnter);
    actorEl.addEventListener("pointerleave", onPointerLeave);
    const stopFrames = onFrame("render", renderFrame);

    return () => {
      stop();
      stopFrames();
      clearTimeout(remeasureTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      removeEventListener("animationend", remeasure);
      removeEventListener("pointermove", onPointerMove);
      actorEl.removeEventListener("click", onClick);
      actorEl.removeEventListener("pointerenter", onPointerEnter);
      actorEl.removeEventListener("pointerleave", onPointerLeave);
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
          <span ref={bubbleAtRef} className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
