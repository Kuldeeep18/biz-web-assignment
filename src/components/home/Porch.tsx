"use client";

import { PupStop } from "@/components/pup/PupStop";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import type { Photo as PhotoData } from "@/lib/puppies";

/** A front door that swings open once it's in view, with a puppy waiting inside. */
export function Porch({ photo }: { photo: PhotoData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        timer = window.setTimeout(() => setOpen(true), 500);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current!);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className="porch relative mx-auto mt-12 mb-9 w-full max-w-[620px]" data-open={open}>
      <div className="porch-wall relative mx-0 h-80 overflow-hidden rounded-t-2xl sm:mx-10 sm:h-[380px]">
        <span
          className="absolute top-10 left-1/2 size-[360px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(color-mix(in oklab, var(--color-honey-soft) 30%, transparent), transparent 65%)" }}
          aria-hidden
        />
        <div className="porch-door absolute bottom-0 left-1/2 h-[260px] w-40 -translate-x-1/2 overflow-hidden rounded-t-full border-4 border-b-0 border-cocoa bg-night sm:h-[312px] sm:w-[196px]">
          <Photo photo={photo} sizes="200px" alt="Max, waiting inside" className="!object-top" />
          <span className="porch-door__leaf" aria-hidden />
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 w-[clamp(8.5rem,13vw,11.5rem)] hidden sm:block"><PupStop pose="bow" facing="right" /></div>
        <span className="porch-lamp absolute top-28 left-[calc(50%+104px)] h-10 w-[26px] rounded-lg sm:top-36 sm:left-[calc(50%+140px)]" aria-hidden />
        <Plant className="absolute bottom-0 left-[4%] w-[76px] sm:left-[calc(50%-210px)]" />
        <Plant className="absolute right-[4%] bottom-0 w-[76px] -scale-x-100 sm:right-[calc(50%-210px)]" />
      </div>
      <div className="relative h-[22px] rounded-md border-t-2 border-milk/10 bg-cocoa-soft">
        <span className="doormat font-scrawl absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-md border-2 border-cocoa px-5 py-0.5 text-sm font-semibold whitespace-nowrap text-cocoa">
          welcome home
        </span>
      </div>
    </div>
  );
}

function Plant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 76 110" className={className} aria-hidden>
      <circle cx="26" cy="38" r="22" fill="color-mix(in oklab, var(--color-leaf) 70%, var(--color-cocoa))" />
      <circle cx="48" cy="34" r="24" fill="color-mix(in oklab, var(--color-leaf) 65%, var(--color-honey-soft))" />
      <circle cx="34" cy="20" r="18" fill="color-mix(in oklab, var(--color-leaf) 65%, var(--color-honey-soft))" />
      <path d="M10 58h56l-8 52H18z" fill="var(--color-toffee)" />
    </svg>
  );
}
