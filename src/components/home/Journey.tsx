"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Play, Send } from "@/components/illustrations/Icons";
import { Photo } from "@/components/ui/Photo";
import { BREEDS, slugify, type Photo as PhotoData } from "@/lib/puppies";
import { DEFAULT_GREETING, SITE, whatsappUrl } from "@/lib/site";

const STEPS = [
  {
    title: "Choose your breed",
    text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
  },
  {
    title: "Get photos & details",
    text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
  },
  {
    title: "Secure & safe delivery",
    text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
  },
];

export function Journey({ photos }: { photos: PhotoData[] }) {
  const [step, setStep] = useState(1);
  const [entering, setEntering] = useState<number | null>(null);
  const current = useRef(1);
  const chat = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  // The step crossing the middle of the screen drives the phone
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const n = Number((e.target as HTMLElement).dataset.step);
          // only animate messages that are appearing, not ones scrolled back past
          if (n > current.current) setEntering(n);
          current.current = n;
          setStep(n);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, []);

  // New messages slide in, then the chat scrolls to the newest
  useEffect(() => {
    const el = chat.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (entering === null) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntering(null)));
    return () => cancelAnimationFrame(id);
  }, [step, entering]);

  const at = (n: number) => ({
    "data-at": n,
    "data-hidden": n > step,
    "data-entering": entering !== null && n === entering,
  });

  return (
    <section className="journey py-24 md:py-28" id="journey" aria-labelledby="journey-title">
      <div className="page-wrap grid items-start gap-16 min-[900px]:grid-cols-2">
        <div>
          <h2 id="journey-title" className="font-plush text-[clamp(2.75rem,6.4vw,5.6rem)]">
            Your puppy journey
          </h2>
          <p className="mt-5 max-w-[34em] text-[1.0625rem] text-cocoa/80">
            A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.
          </p>
          <ol className="mt-14">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                data-step={i + 1}
                data-active={i + 1 <= step}
                className="grid grid-cols-[3rem_1fr] gap-4 pb-9 min-[900px]:min-h-[44vh] min-[900px]:last:min-h-0"
              >
                <span className="step-dot">{i + 1}</span>
                <div>
                  <h3 className="font-plush text-[1.75rem]">{s.title}</h3>
                  <p className="mt-2 max-w-[26em] text-cocoa/80">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className="btn btn-ghost mt-6">
            How it works
          </Link>
        </div>

        <div className="flex justify-center min-[900px]:sticky min-[900px]:top-[calc(var(--header-h)+2.5rem)]">
          <figure className="phone" aria-label="An example WhatsApp chat with TeddyPups">
            <div className="phone__screen">
              <div className="flex items-center gap-3 border-b border-cocoa/10 bg-milk px-4 py-3">
                <Image src="/brand/logo.png" alt="" width={36} height={36} className="rounded-full" />
                <div className="leading-tight">
                  <b className="block text-[0.9375rem]">{SITE.name}</b>
                  <small className="text-xs text-leaf">{step === 3 ? "typing…" : "online"}</small>
                </div>
              </div>
              <div ref={chat} className="chat" aria-hidden>
                <p className="msg msg--out" {...at(1)}>
                  {DEFAULT_GREETING}
                </p>
                <p className="msg msg--in" {...at(1)}>
                  {STEPS[0].text}
                </p>
                <ul className="flex flex-wrap gap-2" {...at(1)}>
                  {BREEDS.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/puppies?breed=${slugify(b)}`}
                        tabIndex={-1}
                        className="inline-block rounded-full border-2 border-cocoa bg-milk px-3 py-1 text-xs font-semibold transition-colors hover:bg-honey-soft"
                      >
                        {b}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="grid w-[70%] grid-cols-2 gap-1 self-start rounded-xl border-2 border-cocoa bg-milk p-1" {...at(2)}>
                  {photos.map((p) => (
                    <div key={p.src} className="relative aspect-square overflow-hidden rounded-md">
                      <Photo photo={p} sizes="120px" alt="" />
                    </div>
                  ))}
                </div>
                <div className="relative aspect-[4/5] w-[62%] self-start overflow-hidden rounded-xl border-2 border-cocoa" {...at(2)}>
                  <Photo photo={photos[photos.length - 1]} sizes="200px" alt="" />
                  <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full border-2 border-cocoa bg-milk">
                    <Play className="ml-0.5 size-4" />
                  </span>
                </div>
                <p className="msg msg--in" {...at(2)}>
                  {STEPS[1].text}
                </p>
                <p className="msg msg--in" {...at(3)}>
                  {STEPS[2].text}
                </p>
                <div className="typing flex gap-1 self-start rounded-full border-2 border-cocoa bg-milk px-3 py-2" {...at(3)}>
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-cocoa/10 bg-milk p-3">
                <span className="flex-1 rounded-full border border-cocoa/15 px-3 py-2 text-sm text-cocoa-soft">
                  Say hello on WhatsApp
                </span>
                <a
                  href={whatsappUrl()}
                  aria-label="Say hello on WhatsApp"
                  className="grid size-10 place-items-center rounded-full bg-leaf text-milk transition-transform hover:scale-110"
                >
                  <Send className="size-[18px]" />
                </a>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
