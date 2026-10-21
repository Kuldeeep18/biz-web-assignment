import { PupStop } from "@/components/pup/PupStop";
import Link from "next/link";
import type { Photo } from "@/lib/puppies";
import { Slideshow } from "@/components/ui/Slideshow";

export function TwoWays({ showroom }: { showroom: Photo[] }) {
  return (
    <section data-pup-scene className="ways relative py-28 text-center" aria-labelledby="ways-title">
      <div className="page-wrap">
        <h2 id="ways-title" data-reveal className="font-plush mx-auto max-w-[8.5em] text-[clamp(2.75rem,6.4vw,5.6rem)]">
          Two ways to meet your puppy
        </h2>

        <div className="relative mx-auto mt-10 grid max-w-[1080px] gap-y-16 min-[900px]:grid-cols-2 min-[900px]:gap-x-28">
          <span className="post hidden min-[900px]:block" aria-hidden />
          <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 z-20 hidden min-[900px]:block pointer-events-none"><PupStop pose="sit" facing="right" className="w-[clamp(11rem,13vw,13.5rem)]" /></div>

          <article data-reveal className="flex flex-col items-center gap-6 min-[900px]:items-end min-[900px]:text-right">
            <div className="sign sign--left min-[900px]:-mr-[44px] min-[900px]:rotate-[1.5deg]">
              <h3 className="font-plush text-[clamp(1.3rem,2vw,1.75rem)]">Puppies in Dubai</h3>
            </div>
            <div className="relative h-[260px] w-full max-w-[420px]">
              <svg className="skyline-line absolute inset-x-0 bottom-0 h-[180px] w-full" viewBox="0 0 420 180" preserveAspectRatio="xMidYMax meet" aria-hidden>
                <path d="M30 178v-36h18v36M248 178V70l-6-8v-6h4V40l4-30 4 30v16h4v6l-6 8v108M272 178v-80l22 10v70M306 178v-104h20v104M340 178v-60h22v60M370 178v-36h22v36" />
                <line x1="0" y1="178" x2="420" y2="178" />
              </svg>
              <figure className="absolute bottom-3.5 left-[8%] w-[190px] -rotate-2">
                <div className="awning" />
                <div className="relative mx-1 h-44 overflow-hidden rounded-b-lg border-[3px] border-t-0 border-cocoa bg-honey-soft">
                  <Slideshow photos={showroom} sizes="190px" />
                </div>
                <figcaption className="font-scrawl absolute inset-x-0 -bottom-6 text-sm">In our showroom</figcaption>
              </figure>
            </div>
            <p className="max-w-[28em] text-cocoa-soft">
              See them, love them, take them home. Come meet our locally available puppies before you decide.
            </p>
            <Link href="/puppies?origin=local" className="btn">
              Meet local puppies
            </Link>
          </article>

          <article data-reveal className="flex flex-col items-center gap-6 min-[900px]:items-start min-[900px]:text-left">
            <div className="sign sign--right min-[900px]:-ml-[44px] min-[900px]:-rotate-[1.5deg]">
              <h3 className="font-plush text-[clamp(1.3rem,2vw,1.75rem)]">Imported for you</h3>
            </div>
            <div className="relative h-[260px] w-full max-w-[420px]">
              <FlightPath className="flight absolute inset-x-0 top-10 h-[200px] w-full overflow-visible" />
            </div>
            <p className="max-w-[28em] text-cocoa-soft">
              Exclusive Korean teacup puppies, delivered. Order from the world&apos;s most reputable breeders and let us
              handle the import.
            </p>
            <Link href="/puppies?origin=imported" className="btn">
              See imported puppies
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

/** Dotted route from Korea to Dubai with a little plane flying along it. */
export function FlightPath({ className, id = "route" }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 200" aria-hidden>
      <path id={id} className="route" d="M40 150C110 20 290 0 380 100" />
      <circle cx="40" cy="150" r="6" fill="var(--color-toffee-deep)" />
      <circle cx="380" cy="100" r="6" fill="var(--color-toffee-deep)" />
      <text x="26" y="178" className="font-scrawl" fontSize="14" fill="var(--color-cocoa)">
        Korea
      </text>
      <text x="362" y="128" className="font-scrawl" fontSize="14" fill="var(--color-cocoa)">
        Dubai
      </text>
      <g fill="var(--color-cocoa)">
        <path d="M-10-3 8-1 12 0 8 1-10 3-6 0z M-2-1-6-9h3l6 8z M-2 1-6 9h3l6-8z" />
        <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
          <mpath href={`#${id}`} />
        </animateMotion>
      </g>
    </svg>
  );
}
