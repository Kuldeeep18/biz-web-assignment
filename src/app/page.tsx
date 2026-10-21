import { Dusk } from "@/components/home/Dusk";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { MeetThePups, type Door } from "@/components/home/MeetThePups";
import { NightFaq, WelcomeHome } from "@/components/home/NightAndHome";
import { TwoWays } from "@/components/home/TwoWays";
import home from "@/data/home.json";
import { captioned } from "@/lib/families";
import { faq } from "@/lib/faq";
import { available, coverOf, getPuppy, isNamed, type Photo } from "@/lib/puppies";

export default function HomePage() {
  const doors: Door[] = available.map((p) => ({
    slug: p.slug,
    name: p.name,
    line: [isNamed(p) && p.breed, p.sex.toLowerCase(), p.age, p.gallery.some((g) => g.type === "video") && "with video"]
      .filter(Boolean)
      .join(", "),
    photo: coverOf(p),
    label: `${p.name}, ${p.breed}, ${p.sex.toLowerCase()}, ${p.age}, available`,
  }));
  const showroom = home.showroom as Photo[];
  const max = getPuppy("maltipoo-max-male") ?? available[0];

  return (
    <>
      <Hero />
      <MeetThePups doors={doors} />
      <TwoWays showroom={showroom} />
      <Journey photos={showroom} />
      <Dusk families={captioned} />
      <NightFaq questions={faq.slice(0, 3)} />
      <WelcomeHome max={coverOf(max)} />
    </>
  );
}
