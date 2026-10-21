import { PupStop } from "@/components/pup/PupStop";
export type Perk = { stamp: string; text: string; tone?: "green"; round?: boolean };

/** An open passport: title on the left page, ink stamps on the right. Stamps thump in on reveal. */
export function Passport({ title, perks, id }: { title: string; perks: Perk[]; id: string }) {
  return (
    <div className="book" data-reveal>
      <div className="book__page book__page--l p-8 md:p-12 md:min-h-[420px]">
        <p className="font-scrawl text-[1.05rem] text-toffee-deep">puppy passport</p>
        <h2 id={id} className="font-plush mt-4 max-w-[7em] text-[clamp(2.4rem,4vw,3.6rem)]">
          {title}
        </h2>
        <div className="w-[clamp(10rem,13vw,12.5rem)] mt-6 hidden sm:block"><PupStop pose="sit" facing="right" /></div>
      </div>
      <ul
        className={`book__page book__page--r grid content-center gap-x-6 gap-y-9 p-8 md:p-12 ${perks.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3"}`}
      >
        {perks.map((p, i) => (
          <li key={p.stamp} className="grid justify-items-center gap-3 text-center" data-reveal style={{ ["--i" as string]: i }}>
            <span
              className={`stamp ${p.tone === "green" ? "stamp--green" : ""} ${p.round ? "stamp--round" : ""}`}
              style={{ ["--r" as string]: `${[-6, 5, 4, -4][i % 4]}deg` }}
            >
              {p.stamp}
            </span>
            <p className="max-w-[17em] text-[0.9375rem] text-cocoa-soft">{p.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
