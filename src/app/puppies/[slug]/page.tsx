import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Check, Paw } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { Gallery } from "@/components/puppy/Gallery";
import { Photo } from "@/components/ui/Photo";
import { COMES_WITH, WAY_HOME } from "@/lib/content";
import { callName, coverOf, getPuppy, isNamed, neighbours, puppies, type Puppy } from "@/lib/puppies";
import { whatsappUrl } from "@/lib/site";

export function generateStaticParams() {
  return puppies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const p = getPuppy((await params).slug);
  if (!p) return {};
  return {
    title: isNamed(p) ? `${p.name}, ${p.breed} puppy` : `${p.breed} puppy`,
    description: p.description,
    openGraph: { images: [coverOf(p).src] },
  };
}

export default function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  // params are read inside the boundary so the page shell can prerender on its own
  return (
    <Suspense fallback={<div className="page-wrap min-h-[80vh] pt-16" aria-busy />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPuppy((await params).slug);
  if (!p) notFound();

  const home = p.status === "gone-home";
  const who = callName(p);
  const ask = home
    ? `Hi TeddyPups! I'm looking for a puppy like ${who} (${p.breed}).`
    : `Hi! I'd love to know more about ${isNamed(p) ? `${p.name} (${p.breed})` : who}.`;
  const { prev, next } = neighbours(p);
  let chapter = 0;
  const n = () => ++chapter;

  return (
    <article className="relative pb-24">
      <span className="bookmark top-0 h-24 max-md:hidden" aria-hidden />
      <div className="page-wrap pt-8">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href={home ? "/gone-home" : "/puppies"} className="text-toffee-deep underline-offset-4 hover:underline">
            {home ? "Gone home" : "Available puppies"}
          </Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{p.name}</span>
        </nav>
        <Chapter n={n()}>{home ? "the day they went home" : "hello, it's me"}</Chapter>

        <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <Gallery items={p.gallery} name={p.name} />
          </div>

          <div className="grid content-start gap-8 lg:col-span-5 lg:pt-10">
            <section className="paper relative p-6 sm:p-8" aria-labelledby="pup-name">
              <span className="absolute -top-3 -left-3 grid size-7 place-items-center rounded-full border-2 border-cocoa bg-milk text-xs" aria-hidden>
                —
              </span>
              <Pup pose="face" className="absolute -top-12 right-4 w-16" />
              {home ? (
                <span className="font-scrawl inline-block -rotate-3 rounded-lg border-2 border-toffee-deep px-3 py-0.5 text-sm text-toffee-deep uppercase">
                  gone home ♥
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-soft px-3 py-1 text-xs font-semibold">
                  <Paw className="size-3 text-toffee" /> Available
                </span>
              )}
              <h1 id="pup-name" className="font-plush mt-3 text-[clamp(2.6rem,4.4vw,3.6rem)]">
                {p.name}
              </h1>
              {isNamed(p) && <p className="mt-1 text-cocoa-soft">{p.breed}</p>}
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["Breed", p.breed],
                  ["Boy or girl", p.sex],
                  ["Age", p.age],
                  ["Where", p.where],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-scrawl text-xs text-cocoa-soft">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-7 grid gap-3">
                <a href={whatsappUrl(ask)} className="btn btn-wa">
                  {home ? "Ask about a puppy like this" : `Ask about ${isNamed(p) ? p.name : "this puppy"} on WhatsApp`}
                </a>
                <a href="#enquire" className="btn btn-milk">
                  Send an enquiry
                </a>
              </div>
            </section>

            <section className="hex-paper rounded-3xl border-[3px] border-cocoa p-6 shadow-[6px_6px_0_rgb(42_23_14/0.15)] sm:p-8">
              <Chapter n={n()}>what comes with {who}</Chapter>
              <h2 className="font-plush-text mt-2 text-2xl">Every Teddy Pup comes</h2>
              <ul className="mt-4 grid gap-2.5">
                {COMES_WITH.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[0.9375rem]">
                    <Check className="mt-0.5 size-5 shrink-0 text-toffee-deep" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {!home && <WayHome p={p} n={n()} />}

        <section id="enquire" className="paper relative mt-20 grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.6fr]" aria-labelledby="enquire-title">
          <span className="postage absolute -top-5 right-8 grid size-14 rotate-6 place-items-center text-toffee" aria-hidden>
            <Paw className="size-6" />
          </span>
          <div>
            <Chapter n={n()}>dear TeddyPups…</Chapter>
            <h2 id="enquire-title" className="font-plush mt-3 max-w-[7em] text-[clamp(2.2rem,3.6vw,3rem)]">
              {home ? "Looking for a puppy like this?" : `Ask about ${isNamed(p) ? p.name : "this puppy"}`}
            </h2>
            <p className="mt-4 max-w-sm text-cocoa-soft">
              Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest reply.
            </p>
          </div>
          <EnquiryForm
            puppy={`${p.name} (${p.breed}, ${p.sex.toLowerCase()})`}
            defaultMessage={home ? `Hi! I'd love to know more about ${p.name}.` : `Hi! I'd love to know more about ${isNamed(p) ? `${p.name} (${p.breed})` : p.name}.`}
          />
        </section>

        <nav aria-label="More puppies" className="mt-12 grid gap-5 sm:grid-cols-2">
          <PupLink p={prev} dir="Previous pup" />
          <PupLink p={next} dir="Next pup" />
        </nav>
      </div>
    </article>
  );
}

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="chapter mt-4">
      <span className="chapter__n" aria-hidden>
        {n}
      </span>
      <span className="font-scrawl">{children}</span>
    </p>
  );
}

function WayHome({ p, n }: { p: Puppy; n: number }) {
  const way = WAY_HOME[p.where];
  return (
    <section className="mt-20" aria-labelledby="way-title">
      <Chapter n={n}>the way home</Chapter>
      <h2 id="way-title" className="font-plush mt-2 text-[clamp(2.2rem,3.6vw,3rem)]">
        {way.title}
      </h2>
      <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {way.steps.map((s, i) => (
          <li key={s.title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-cocoa bg-milk font-display text-lg font-extrabold">
                {i + 1}
              </span>
              {i < way.steps.length - 1 && <span className="paw-trail hidden h-2 flex-1 lg:block" aria-hidden />}
            </div>
            <h3 className="font-plush-text mt-4 text-lg">{s.title}</h3>
            <p className="mt-1 text-[0.9375rem] text-cocoa-soft">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PupLink({ p, dir }: { p: Puppy; dir: string }) {
  const right = dir.startsWith("Next");
  return (
    <Link
      href={`/puppies/${p.slug}`}
      className={`group flex items-center gap-4 rounded-3xl border-[3px] border-cocoa bg-milk p-3 pr-6 transition-transform hover:-translate-y-1 ${right ? "flex-row-reverse pr-3 pl-6 text-right" : ""}`}
    >
      <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-t-full border-2 border-cocoa">
        <Photo photo={coverOf(p)} sizes="56px" alt="" />
      </span>
      <span>
        <span className="block text-xs text-cocoa-soft">{dir}</span>
        <span className="font-plush text-xl group-hover:text-toffee-deep">{p.name}</span>
      </span>
    </Link>
  );
}
