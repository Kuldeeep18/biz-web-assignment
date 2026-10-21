import faqJson from "@/data/faq.json";

export type QA = { q: string; a: string };

export const faq = faqJson as QA[];
