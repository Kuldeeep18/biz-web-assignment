// One definition of a valid enquiry, used by the forms (instant feedback)
// and by /api/enquiry (the authority).

export type Enquiry = {
  name: string;
  phone: string;
  email?: string;
  area?: string;
  puppy?: string;
  message?: string;
  /** honeypot: hidden from people, filled in by bots */
  website?: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

const LIMITS: Record<keyof Enquiry, number> = {
  name: 80,
  phone: 30,
  email: 120,
  area: 80,
  puppy: 120,
  message: 2000,
  website: 200,
};

export function readEnquiry(input: Record<string, unknown>): Enquiry {
  const out: Record<string, string> = {};
  for (const key of Object.keys(LIMITS) as (keyof Enquiry)[]) {
    const v = input[key];
    if (typeof v === "string") out[key] = v.trim().slice(0, LIMITS[key]);
  }
  return out as Enquiry;
}

export function validateEnquiry(e: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!e.name || e.name.length < 2) errors.name = "Please tell us your name.";
  const digits = (e.phone ?? "").replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15 || !/^\+?[\d\s()-]+$/.test(e.phone ?? ""))
    errors.phone = "Add a phone or WhatsApp number with country code.";
  if (e.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) errors.email = "That email doesn't look right.";
  return errors;
}

export function isBot(e: Enquiry) {
  return Boolean(e.website);
}
