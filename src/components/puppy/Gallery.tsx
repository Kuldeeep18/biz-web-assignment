"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "@/components/illustrations/Icons";
import { Photo } from "@/components/ui/Photo";
import type { GalleryItem } from "@/lib/puppies";

/** Photo/video story for one puppy: big page, arrows, counter, thumbnails, full-screen view. */
export function Gallery({ items, name }: { items: GalleryItem[]; name: string }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = items.length;
  const go = (d: number) => setI((n) => (n + d + count) % count);

  useEffect(() => {
    const d = dialog.current!;
    if (full && !d.open) d.showModal();
    if (!full && d.open) d.close();
  }, [full]);

  const item = items[i];
  const label = `${name}, ${item.type === "video" ? "video" : "photo"} ${i + 1} of ${count}`;

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="story-page relative aspect-[4/5] overflow-hidden bg-cocoa md:aspect-[5/6]">
        <Slide item={item} label={label} priority={i === 0} onOpen={() => setFull(true)} />
        {count > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold">
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk" aria-live="polite">
              {i + 1} / {count}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold">
              ›
            </button>
          </div>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto px-1 pt-2 pb-2" aria-label={`All photos of ${name}`}>
          {items.map((g, n) => (
            <li key={g.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`${name}, ${g.type === "video" ? "video" : "photo"} ${n + 1} of ${count}`}
                aria-current={n === i}
                className="thumb relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] border-cocoa/70 transition-all duration-300 md:h-28 md:w-24"
              >
                <Photo photo={g.type === "video" ? g.poster : g} sizes="96px" alt="" />
                {g.type === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-cocoa/25 text-milk">
                    <Play className="size-6" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        onClose={() => setFull(false)}
        onClick={(e) => e.target === e.currentTarget && setFull(false)}
        className="m-auto h-[92vh] w-[min(92vw,70rem)] max-w-none overflow-hidden rounded-2xl border-[3px] border-cocoa bg-cocoa p-0 backdrop:bg-night/85"
        aria-label={`${name} — full screen`}
      >
        {full && (
          <div className="relative size-full">
            {item.type === "video" ? (
              <video src={item.src} poster={item.poster.src} controls autoPlay playsInline className="size-full object-contain" />
            ) : (
              <Photo photo={item} sizes="92vw" className="!object-contain !bg-transparent" />
            )}
            <button type="button" onClick={() => setFull(false)} className="btn btn-milk btn-sm absolute top-3 right-3">
              Close
            </button>
            {count > 1 && (
              <div className="absolute inset-x-4 bottom-4 flex justify-between">
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk text-xl font-bold">
                  ‹
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk text-xl font-bold">
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}

function Slide({ item, label, priority, onOpen }: { item: GalleryItem; label: string; priority: boolean; onOpen: () => void }) {
  if (item.type === "video") {
    // key resets playback when switching between videos
    return <video key={item.src} src={item.src} poster={item.poster.src} controls playsInline preload="metadata" aria-label={label} className="absolute inset-0 size-full object-cover" />;
  }
  return (
    <button type="button" onClick={onOpen} aria-label={`Open ${label} full screen`} className="absolute inset-0 block size-full cursor-zoom-in">
      <Photo photo={item} sizes="(min-width: 1024px) 55vw, 92vw" priority={priority} />
    </button>
  );
}
