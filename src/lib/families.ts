import familiesJson from "@/data/families.json";
import type { Photo } from "./puppies";

export type Family = Photo & { caption?: string };

export const families = familiesJson as Family[];

/** The handful with captions — the home page features these. */
export const captioned = families.filter((f) => f.caption);

export const TESTIMONIAL = {
  quote:
    "TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave us complete peace of mind.",
  by: "Sarah M., Dubai, UAE",
};
