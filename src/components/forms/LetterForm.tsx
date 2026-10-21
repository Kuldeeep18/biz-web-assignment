"use client";

import { useState } from "react";
import { Paw } from "@/components/illustrations/Icons";
import { validateEnquiry, type EnquiryErrors } from "@/lib/enquiry";
import { formToEnquiry, sendEnquiry } from "./EnquiryForm";

type Option = { value: string; label: string };

/** The contact form, written as a letter with blanks to fill in. */
export function LetterForm({ puppies }: { puppies: Option[] }) {
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [phase, setPhase] = useState<"writing" | "sending" | "posting" | "posted">("writing");
  const [failure, setFailure] = useState("");
  const [whatsapp, setWhatsapp] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFailure("");
    const enquiry = formToEnquiry(e.currentTarget);
    const found = validateEnquiry(enquiry);
    setErrors(found);
    if (Object.keys(found).length) {
      // jump to the first blank that needs attention
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setPhase("sending");
    const result = await sendEnquiry(enquiry);
    if (!result.ok) {
      setErrors(result.errors ?? {});
      setFailure(result.message);
      setPhase("writing");
      return;
    }
    setWhatsapp(result.whatsapp);
    setPhase("posting");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => setPhase("posted"), reduced ? 0 : 900);
  }

  if (phase === "posted") {
    return (
      <div className="letter paper grid min-h-[26rem] content-center justify-items-center gap-4 p-8 text-center" role="status">
        <Paw className="size-10 text-toffee" />
        <p className="font-plush text-3xl">Your letter is on its way!</p>
        <p className="max-w-sm text-cocoa-soft">Our team will get back to you promptly. For the quickest reply, send it on WhatsApp too.</p>
        {whatsapp && (
          <a href={whatsapp} className="btn btn-wa">
            Send it on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const blank = (name: string, extra: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
    const { label, ...rest } = extra;
    const err = errors[name as keyof EnquiryErrors];
    return (
      <>
        <label htmlFor={`letter-${name}`} className="sr-only">
          {label}
        </label>
        <input
          id={`letter-${name}`}
          name={name}
          className="blank"
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `letter-${name}-err` : undefined}
          {...rest}
        />
      </>
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`letter paper relative p-6 sm:p-9 ${phase === "posting" ? "envelope-fly" : ""}`}
      aria-label="Write to TeddyPups"
    >
      <span className="postage absolute -top-5 right-8 grid size-14 rotate-6 place-items-center text-toffee" aria-hidden>
        <Paw className="size-6" />
      </span>
      <p className="font-scrawl text-2xl text-toffee-deep">Dear TeddyPups,</p>

      <div className="mt-5 space-y-4 leading-[2.6rem]">
        <p>
          my name is {blank("name", { label: "Your name", autoComplete: "name", required: true, style: { width: "11rem" } })}, and you can
          reach me on {blank("phone", { label: "Phone or WhatsApp", type: "tel", autoComplete: "tel", placeholder: "+971 50 123 4567", required: true, style: { width: "11rem" } })}{" "}
          or by email at {blank("email", { label: "Email (optional)", type: "email", autoComplete: "email", placeholder: "optional", style: { width: "13rem" } })}.
        </p>
        <p>
          I live in {blank("area", { label: "Your area (optional)", autoComplete: "address-level2", placeholder: "e.g. Dubai Marina", style: { width: "10rem" } })}, and
          I&apos;m curious about{" "}
          <label htmlFor="letter-puppy" className="sr-only">
            Puppy you&apos;re interested in (optional)
          </label>
          <select id="letter-puppy" name="puppy" className="blank max-w-full cursor-pointer" defaultValue="">
            <option value="">any puppy (not sure yet)</option>
            {puppies.map((o) => (
              <option key={o.value} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
          .
        </p>
        <div>
          <label htmlFor="letter-message" className="sr-only">
            Your message (optional)
          </label>
          <textarea
            id="letter-message"
            name="message"
            rows={3}
            placeholder="Anything else you'd like to tell us…"
            className="font-scrawl w-full resize-y bg-transparent leading-[2.6rem] text-toffee-deep outline-none placeholder:text-cocoa-soft/50"
          />
        </div>
      </div>

      <div className="honeypot" aria-hidden>
        <label htmlFor="letter-website">Website</label>
        <input id="letter-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {Object.entries(errors).map(([k, v]) => (
        <p key={k} id={`letter-${k}-err`} className="mt-2 text-sm text-danger">
          {v}
        </p>
      ))}
      {failure && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {failure}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-scrawl text-cocoa-soft">with love, a future puppy parent</p>
        <button type="submit" className="btn" disabled={phase !== "writing"}>
          {phase === "sending" ? "Posting…" : "Post my letter"}
        </button>
      </div>
    </form>
  );
}
