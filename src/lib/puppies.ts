import puppiesJson from "@/data/puppies.json";

export type Photo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** CSS object-position keeping the puppy in frame when cropped */
  focal?: string;
  /** average colour, shown while the photo loads */
  color?: string;
};

export type GalleryItem =
  | (Photo & { type: "image" })
  | { type: "video"; src: string; poster: Photo };

export type Puppy = {
  slug: string;
  name: string;
  breed: string;
  sex: "Boy" | "Girl" | "Boy & girl";
  age: string;
  where: "Imported for you" | "In Dubai";
  description: string;
  status: "available" | "gone-home";
  /** background wash behind the listing photo */
  wash?: string;
  ticket?: { line: string; from: string };
  gallery: GalleryItem[];
};

export const puppies = puppiesJson as Puppy[];
export const available = puppies.filter((p) => p.status === "available");
export const goneHome = puppies.filter((p) => p.status === "gone-home");

export function getPuppy(slug: string) {
  return puppies.find((p) => p.slug === slug);
}

/** Cover image for a puppy: the first photo, or the first video's poster. */
export function coverOf(p: Puppy): Photo {
  const first = p.gallery[0];
  return first.type === "video" ? first.poster : first;
}

export function hasVideo(p: Puppy) {
  return p.gallery.some((g) => g.type === "video");
}

/** Some listings are named ("Max"), others are just the breed. */
export function isNamed(p: Puppy) {
  return p.name !== p.breed;
}

/** "Max" or "this Poodle", for sentences like "what comes with …". */
export function callName(p: Puppy) {
  return isNamed(p) ? p.name : `this ${p.breed}`;
}

/** "boy · 3 months" style line under a card title. */
export function cardLine(p: Puppy) {
  const sex = p.sex.toLowerCase();
  return isNamed(p) ? `${p.breed} · ${sex} · ${p.age}` : `${sex} · ${p.age}`;
}

/** Previous/next within the same list (available or gone home), wrapping round. */
export function neighbours(p: Puppy) {
  const list = p.status === "available" ? available : goneHome;
  const i = list.findIndex((x) => x.slug === p.slug);
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

// ---- Listing filters --------------------------------------------------------

export const BREEDS = ["Maltipoo", "Pomeranian", "Poodle", "Cavapoo", "Shih Tzu"] as const;

export type Filters = { origin?: string; breed?: string; sex?: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const ORIGINS = [
  { value: undefined, label: "Everywhere" },
  { value: "imported", label: "Imported" },
  { value: "local", label: "In Dubai" },
  { value: "korean-teacup", label: "Korean Teacup" },
] as const;

export function matchesFilters(p: Puppy, f: Filters) {
  if (f.origin === "imported" && p.where !== "Imported for you") return false;
  if (f.origin === "local" && p.where !== "In Dubai") return false;
  if (f.origin === "korean-teacup" && !p.breed.startsWith("Korean Teacup")) return false;
  // "Maltipoo & Cavapoo" counts for both breeds; "Toy Poodle" counts as Poodle
  if (f.breed && !slugify(p.breed).split("-").join(" ").includes(f.breed.replace(/-/g, " "))) return false;
  if (f.sex === "boys" && !p.sex.includes("Boy")) return false;
  if (f.sex === "girls" && !p.sex.toLowerCase().includes("girl")) return false;
  return true;
}

export { slugify };
