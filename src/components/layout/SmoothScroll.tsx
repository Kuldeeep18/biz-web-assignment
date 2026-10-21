"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { onFrame } from "@/lib/frame";

// A mouse wheel scrolls in ~100px jumps, and the pup is placed from the scroll
// position, so it would jump with it. Lenis eases each wheel step over several
// frames instead. Touch scrolling is already smooth, so it is left native.
export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      anchors: true,
      stopInertiaOnNavigate: true,
      // dialogs scroll on their own
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      // the open mobile menu locks the page
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });
    const stop = onFrame("scroll", (time) => lenis.raf(time));
    return () => {
      stop();
      lenis.destroy();
    };
  }, []);

  return null;
}
