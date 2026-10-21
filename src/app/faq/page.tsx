import type { Metadata } from "next";
import { FaqBoard } from "@/components/faq/FaqBoard";
import { faq } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Questions & answers",
  description: "Vaccinations, health checks, importing, delivery and aftercare — answers to the questions families ask TeddyPups U.A.E. most.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqPage() {
  return (
    <section className="faq-bg pb-32 text-milk">
      <div className="page-wrap pt-10 md:pt-14">
        <h1 className="font-plush max-w-[6em] text-[clamp(3rem,7.6vw,6.8rem)]">Questions &amp; answers</h1>
        <p className="mt-5 mb-12 max-w-[30em] text-milk/85">
          Can&apos;t find what you&apos;re looking for? Message us on WhatsApp — our team is available 24/7.
        </p>
        <FaqBoard faq={faq} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </section>
  );
}
