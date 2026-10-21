import { PupStop } from "@/components/pup/PupStop";
import Link from "next/link";
import { Stars } from "@/components/illustrations/Stars";
import type { QA } from "@/lib/faq";
import { whatsappUrl } from "@/lib/site";
import type { Photo } from "@/lib/puppies";
import { Porch } from "./Porch";

export function NightFaq({ questions }: { questions: QA[] }) {
  return (
    <section className="night relative overflow-hidden pt-24 pb-28 text-milk" aria-labelledby="questions-title">
      <Stars
        stars={[
          [8, 14, 10, 0.2],
          [41, 9, 8, 1.1],
          [72, 6, 12, 0.6],
          [94, 30, 10, 1.7],
          [4, 66, 7, 2.1],
          [34, 78, 6, 0.9],
          [83, 60, 9, 1.4],
          [63, 88, 10, 2.4],
        ]}
      />
      <div className="page-wrap relative grid gap-12 md:grid-cols-[1fr_1.25fr] md:gap-16">
        <div className="grid content-start justify-items-start gap-9">
          <h2 id="questions-title" className="font-plush max-w-[6em] text-[clamp(2.75rem,6.4vw,5.6rem)]">
            Questions, answered
          </h2>
          <Link href="/faq" className="btn btn-ghost">
            Read all questions
          </Link>
          <span className="font-scrawl ml-12 hidden rotate-12 animate-bounce text-6xl text-honey md:block" aria-hidden>
            ?
          </span>
          <div className="w-28 hidden md:block"><PupStop pose="sit" act="tilt" facing="right" /></div>
        </div>
        <div>
          {questions.map((q) => (
            <details key={q.q} open className="group border-b border-milk/12">
              <summary className="font-plush-text grid cursor-pointer list-none grid-cols-[1.5rem_1fr] items-baseline gap-2 pt-5 pb-3 text-[clamp(1.2rem,1.8vw,1.5rem)] leading-tight hover:text-honey-soft [&::-webkit-details-marker]:hidden">
                <span className="rotate-45 text-base text-honey transition-transform group-open:rotate-0" aria-hidden>
                  ✦
                </span>
                {q.q}
              </summary>
              <p className="max-w-[36em] pb-6 pl-8 text-milk/80">{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WelcomeHome({ max }: { max: Photo }) {
  return (
    <section className="night-deep pt-12 pb-16 text-center text-milk" aria-labelledby="cta-title">
      <div className="page-wrap">
        <h2 id="cta-title" data-reveal className="font-plush mx-auto max-w-[9em] text-[clamp(2.75rem,6.4vw,5.6rem)]">
          Ready to meet your new best friend?
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-[32em] text-milk/80">
          Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you
          find the right match and ensure a smooth, safe delivery across the UAE.
        </p>
        <Porch photo={max} />
        <div className="flex flex-wrap justify-center gap-4 max-sm:[&>*]:flex-[1_1_100%]">
          <a href={whatsappUrl()} className="btn btn-wa">
            Enquire on WhatsApp
          </a>
          <Link href="/contact" className="btn btn-ghost">
            Visit &amp; contact
          </Link>
        </div>
      </div>
    </section>
  );
}
