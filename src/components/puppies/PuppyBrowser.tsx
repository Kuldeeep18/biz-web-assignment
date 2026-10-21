"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BREEDS, ORIGINS, available, matchesFilters, slugify, type Filters } from "@/lib/puppies";
import { whatsappUrl } from "@/lib/site";
import { PuppyGrid } from "./PuppyGrid";

const SEXES = [
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
];

/** Filter chips backed by the URL (?origin=&breed=&sex=), so a filtered list can be shared. */
export function PuppyBrowser() {
  const params = useSearchParams();
  const filters: Filters = {
    origin: params.get("origin") ?? undefined,
    breed: params.get("breed") ?? undefined,
    sex: params.get("sex") ?? undefined,
  };
  const shown = available.filter((p) => matchesFilters(p, filters));

  // Only offer "In Dubai" when there is someone in the showroom right now
  const origins = ORIGINS.filter((o) => o.value !== "local" || available.some((p) => p.where === "In Dubai"));

  const href = (key: keyof Filters, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || filters[key] === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    return qs ? `/puppies?${qs}` : "/puppies";
  };

  return (
    <>
      <FilterPanel>
        <Row label="where">
          {origins.map((o) => (
            <Chip key={o.label} href={href("origin", o.value)} active={filters.origin === o.value}>
              {o.label}
            </Chip>
          ))}
        </Row>
        <Row label="breed">
          {BREEDS.map((b) => (
            <Chip key={b} href={href("breed", slugify(b))} active={filters.breed === slugify(b)}>
              {b}
            </Chip>
          ))}
        </Row>
        <Row label="boy or girl">
          {SEXES.map((s) => (
            <Chip key={s.value} href={href("sex", s.value)} active={filters.sex === s.value}>
              {s.label}
            </Chip>
          ))}
        </Row>
      </FilterPanel>

      <p className="font-scrawl mt-9 mb-6" aria-live="polite">
        {shown.length} {shown.length === 1 ? "puppy" : "puppies"} looking for a home
      </p>

      {shown.length ? (
        <PuppyGrid puppies={shown} />
      ) : (
        <div className="paper mx-auto grid max-w-xl justify-items-center gap-4 p-10 text-center">
          <p className="font-plush text-3xl">No pups match that… yet</p>
          <p className="text-cocoa-soft">New puppies arrive often. Tell us what you&apos;re looking for and we&apos;ll find your match.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/puppies" className="btn btn-ghost">
              Clear filters
            </Link>
            <a href={whatsappUrl("Hi TeddyPups! I'm looking for a puppy — can you help me find one?")} className="btn btn-wa">
              Ask on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/** The same panel without interactivity, shown while the URL is being read. */
export function FilterPanelPlaceholder() {
  return (
    <FilterPanel>
      <Row label="where">
        <Chip href="/puppies" active>
          Everywhere
        </Chip>
      </Row>
      <Row label="breed">
        {BREEDS.map((b) => (
          <Chip key={b} href={`/puppies?breed=${slugify(b)}`}>
            {b}
          </Chip>
        ))}
      </Row>
      <Row label="boy or girl">
        {SEXES.map((s) => (
          <Chip key={s.value} href={`/puppies?sex=${s.value}`}>
            {s.label}
          </Chip>
        ))}
      </Row>
    </FilterPanel>
  );
}

function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <nav aria-label="Filter puppies" className="filter-panel relative mt-10 grid gap-3 p-5 sm:p-6">
      <span className="filter-panel__tape" aria-hidden />
      {children}
    </nav>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[8rem_1fr]">
      <span className="font-scrawl text-sm text-cocoa-soft">{label}</span>
      <ul className="flex flex-wrap gap-2">{children}</ul>
    </div>
  );
}

function Chip({ href, active = false, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} scroll={false} className="chip" aria-current={active ? "true" : undefined}>
        {children}
      </Link>
    </li>
  );
}
