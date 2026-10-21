export const SITE = {
  name: "TeddyPups U.A.E.",
  shortName: "TeddyPups",
  tagline: "every puppy is family",
  description:
    "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.",
  about:
    "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping.",
  phone: "+971541676733",
  phoneDisplay: "+971 54 167 6733",
  email: "teddypupsadmin@gmail.com",
  address: "Downtown Dubai, United Arab Emirates",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Downtown+Dubai",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/teddypups.worldwide/" },
    { label: "TikTok", href: "https://www.tiktok.com/@teddypupsuae" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61567496944539" },
  ],
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/puppies", label: "Puppies" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;

export const FOOTER_LINKS = [
  { href: "/puppies", label: "Available puppies" },
  { href: "/gone-home", label: "Gone home" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/how-it-works#delivery", label: "Delivery & collection" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;

export const DEFAULT_GREETING = "Hi TeddyPups! I'd love to know more about your puppies.";

/** wa.me deep link with a pre-filled message. */
export function whatsappUrl(message: string = DEFAULT_GREETING) {
  return `https://wa.me/${SITE.phone.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export const telUrl = `tel:${SITE.phone}`;
