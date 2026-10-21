"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Paw } from "@/components/illustrations/Icons";
import { PupStop } from "@/components/pup/PupStop";
import { Photo } from "@/components/ui/Photo";
import type { Photo as PhotoData } from "@/lib/puppies";

export type Door = { slug: string; name: string; line: string; photo: PhotoData; label: string };

const DOOR_COLORS = [
  "var(--color-cocoa-soft)",
  "var(--color-honey)",
  "color-mix(in oklab, var(--color-toffee) 85%, var(--color-blush))",
  "var(--color-toffee-deep)",
];

export function MeetThePups({ doors }: { doors: Door[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const walker = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  // Pin the stage and turn vertical scroll into sideways travel
  useEffect(() => {
    // Hold the nodes directly: when the page is hidden after navigation React
    // detaches refs, and a late scroll/resize callback must not see null.
    const el = section.current!;
    const stageEl = stage.current!;
    const trackEl = track.current!;
    const walkerEl = walker.current!;
    const mq = matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    let distance = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!mq.matches || !distance) return;
      // how far the sticky stage has been held in place
      const held = stageEl.getBoundingClientRect().top - el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, held / distance));
      trackEl.style.transform = `translate3d(${-p * distance}px,0,0)`;
      walkerEl.style.transform = `translate3d(${p * (window.innerWidth - 160)}px,0,0)`;
    };
    const measure = () => {
      setPinned(mq.matches);
      if (!mq.matches) {
        el.style.height = "";
        trackEl.style.transform = "";
        return;
      }
      distance = Math.max(0, trackEl.scrollWidth - window.innerWidth);
      el.style.height = `${stageEl.offsetHeight + distance}px`;
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    mq.addEventListener("change", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      el.style.height = "";
    };
  }, []);

  // Doors swing open as they come into view, one after another
  useEffect(() => {
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const slug = (e.target as HTMLElement).dataset.slug!;
            timers.push(window.setTimeout(() => setOpen((s) => new Set(s).add(slug)), 250 + i * 160));
            io.unobserve(e.target);
          });
      },
      { rootMargin: "0px -12% 0px 0px", threshold: 0.6 },
    );
    track.current?.querySelectorAll("[data-slug]").forEach((d) => io.observe(d));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section ref={section} className="meet" data-pinned={pinned} aria-labelledby="meet-title">
      <div ref={stage} className="meet__stage pt-12">
        <header className="meet__head page-wrap flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="meet-title" className="font-plush text-[clamp(2.75rem,6.4vw,5.6rem)]">
              Meet the pups
            </h2>
            <p className="mt-3 text-lg text-cocoa-soft">Real puppies, real photos, looking for their families right now.</p>
          </div>
          <Link href="/puppies" className="btn max-sm:w-full">
            See all available puppies
          </Link>
        </header>

        <div className="meet__viewport mt-14 pt-6">
          <ol ref={track} data-treadmill className="meet__track">
            {doors.map((d, i) => (
              <li key={d.slug} className="door" data-slug={d.slug} data-open={open.has(d.slug)}>
                <Link href={`/puppies/${d.slug}`} aria-label={d.label}>
                  <h3 className="font-plush text-[1.75rem] leading-none">{d.name}</h3>
                  <p className="mt-2 mb-5 min-h-[2.9em] text-[0.9375rem] text-balance text-cocoa-soft">{d.line}</p>
                  <div className="door__frame">
                    <div className="door__clip">
                      <Photo photo={d.photo} sizes="216px" alt="" />
                      <span className="door__leaf" style={{ ["--door" as string]: DOOR_COLORS[i % DOOR_COLORS.length] }}>
                        <Paw className="door__paw" />
                      </span>
                    </div>
                    <span className="tag">Available</span>
                  </div>
                </Link>
              </li>
            ))}
            <li className="door">
              <Link href="/puppies">
                <h3 className="font-plush text-[1.75rem] leading-none">&nbsp;</h3>
                <p className="mt-2 mb-5 min-h-[2.9em]">&nbsp;</p>
                <div className="door__frame">
                  <div className="door__clip grid place-items-center bg-honey transition-colors hover:bg-honey-soft">
                    <span className="font-plush p-6 text-[1.75rem]">Meet them all</span>
                  </div>
                </div>
              </Link>
            </li>
          </ol>
        </div>
        <div className="floor" aria-hidden>
          <div ref={walker} className="floor__walker hidden min-[900px]:block">
            <PupStop pose="sit" facing="right" className="w-[140px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
