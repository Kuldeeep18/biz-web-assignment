// Copy shared between pages: the two routes home (In Dubai / Imported).

export type Step = { title: string; text: string };

export const IN_DUBAI = {
  title: "Meet your puppy in person",
  intro: [
    "Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face. We source healthy, well-socialized puppies from trusted local breeders, ensuring they're raised with care, proper nutrition, and veterinary checks.",
  ],
  steps: [
    {
      title: "Explore our puppies",
      text: "Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.",
    },
    {
      title: "Choose your puppy",
      text: "Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.",
    },
    { title: "Meet before you choose", text: "Spend time bonding before making your decision." },
    {
      title: "Pick-up or delivery",
      text: "Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.",
    },
  ] satisfies Step[],
};

export const IMPORTED = {
  title: "Order upon request",
  intro: [
    "Looking for a truly exceptional companion? Our Order Upon Request service gives you access to some of the world's most sought-after teacup breeds — ethically sourced from the most reputable, certified breeders across Europe, Korea, and beyond.",
    "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world's finest puppies to Dubai, just for you.",
  ],
  steps: [
    {
      title: "Reserve your puppy",
      text: "Browse our selection of available breeds and place a reservation for the teacup puppy that captures your heart. Our reservation-only model ensures that each puppy is specifically sourced to meet your preferences.",
    },
    {
      title: "Personalized consultation",
      text: "Once your reservation is confirmed, we will work closely with you to finalize details and provide updates on your puppy's journey.",
    },
    {
      title: "Import and arrival",
      text: "We manage all aspects of the import process, including health checks, travel arrangements, and necessary documentation. Your puppy will be carefully transported and will arrive ready to join your family.",
    },
    {
      title: "Welcome home",
      text: "Upon arrival, we provide support to help your new puppy acclimate to their new environment. Our team is available for any additional assistance and to ensure a smooth transition into your home.",
    },
  ] satisfies Step[],
};

/** The short "the way home" timeline on a puppy's profile. */
export const WAY_HOME: Record<"Imported for you" | "In Dubai", { title: string; steps: Step[] }> = {
  "Imported for you": {
    title: "Coming home from abroad",
    steps: [
      { title: "Reserve your puppy", text: "Tell us which puppy has captured your heart." },
      { title: "Personalized consultation", text: "We finalize details with you and share updates on your puppy's journey." },
      { title: "Import and arrival", text: "We manage health checks, travel arrangements, and documentation." },
      { title: "Welcome home", text: "We help your new puppy settle in and ensure a smooth transition into your home." },
    ],
  },
  "In Dubai": { title: IN_DUBAI.title, steps: IN_DUBAI.steps },
};

export const COMES_WITH = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];
