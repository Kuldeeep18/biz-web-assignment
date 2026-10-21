import type { Puppy } from "@/lib/puppies";
import { SketchCard } from "./SketchCard";

export function PuppyGrid({ puppies }: { puppies: Puppy[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
      {puppies.map((p, i) => (
        // every other card sits a little lower, like a hand-laid page
        <li key={p.slug} className={i % 2 ? "sm:translate-y-6" : ""}>
          <SketchCard p={p} index={i} />
        </li>
      ))}
    </ul>
  );
}
