"use client";

import { useState } from "react";
import { validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/enquiry";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; whatsapp?: string } | { state: "error"; message: string };

/** POSTs an enquiry to /api/enquiry. Validates in the browser first with the same rules the server uses. */
export async function sendEnquiry(enquiry: Enquiry): Promise<{ ok: true; whatsapp?: string } | { ok: false; errors?: EnquiryErrors; message: string }> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enquiry),
    });
    const data = await res.json();
    if (res.ok && data.ok) return { ok: true, whatsapp: data.whatsapp };
    return { ok: false, errors: data.errors, message: data.error ?? "Please check the highlighted fields." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Please try again or message us on WhatsApp." };
  }
}

export function formToEnquiry(form: HTMLFormElement): Enquiry {
  return Object.fromEntries(new FormData(form)) as unknown as Enquiry;
}

/** The conventional form used on each puppy's profile. */
export function EnquiryForm({ puppy, defaultMessage }: { puppy: string; defaultMessage: string }) {
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const enquiry = { ...formToEnquiry(e.currentTarget), puppy };
    const found = validateEnquiry(enquiry);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus({ state: "sending" });
    const result = await sendEnquiry(enquiry);
    if (result.ok) setStatus({ state: "sent", whatsapp: result.whatsapp });
    else {
      setErrors(result.errors ?? {});
      setStatus({ state: "error", message: result.message });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="grid content-center justify-items-start gap-4" role="status">
        <p className="font-plush text-3xl">Thank you — we&apos;ll be in touch!</p>
        <p className="text-cocoa-soft">Our team will get back to you promptly. For the quickest reply, send the same note on WhatsApp.</p>
        {status.whatsapp && (
          <a href={status.whatsapp} className="btn btn-wa">
            Send it on WhatsApp too
          </a>
        )}
      </div>
    );
  }

  const field = (name: keyof Enquiry) => ({
    id: `enq-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `enq-${name}-err` : undefined,
  });
  const error = (name: keyof Enquiry) =>
    errors[name] && (
      <p id={`enq-${name}-err`} className="mt-1 text-sm text-danger">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="enq-name" className="mb-1.5 block text-sm font-medium">
          Your name <span className="text-danger">*</span>
        </label>
        <input {...field("name")} className="field" autoComplete="name" required />
        {error("name")}
      </div>
      <div>
        <label htmlFor="enq-phone" className="mb-1.5 block text-sm font-medium">
          Phone or WhatsApp <span className="text-danger">*</span>
        </label>
        <input {...field("phone")} className="field" type="tel" autoComplete="tel" required />
        {error("phone") || <p className="mt-1 text-xs text-cocoa-soft">With country code, e.g. +971 50 123 4567</p>}
      </div>
      <div>
        <label htmlFor="enq-email" className="mb-1.5 block text-sm font-medium">
          Email <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <input {...field("email")} className="field" type="email" autoComplete="email" />
        {error("email")}
      </div>
      <div>
        <label htmlFor="enq-area" className="mb-1.5 block text-sm font-medium">
          Your area <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <input {...field("area")} className="field" autoComplete="address-level2" />
        <p className="mt-1 text-xs text-cocoa-soft">e.g. Dubai Marina</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enq-message" className="mb-1.5 block text-sm font-medium">
          Message <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <textarea {...field("message")} className="field min-h-28 resize-y" defaultValue={defaultMessage} />
      </div>
      <div className="honeypot" aria-hidden>
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="btn" disabled={status.state === "sending"}>
          {status.state === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        {status.state === "error" && (
          <p className="text-sm text-danger" role="alert">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
