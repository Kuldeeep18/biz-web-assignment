import { NextResponse } from "next/server";
import { isBot, readEnquiry, validateEnquiry } from "@/lib/enquiry";
import { SITE, whatsappUrl } from "@/lib/site";

// Receives enquiries from the contact letter and the puppy profile forms.
// Delivery: if ENQUIRY_WEBHOOK_URL is set (Slack/Discord/Zapier/Make…), the
// enquiry is POSTed there as JSON; otherwise it is written to the server log.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const enquiry = readEnquiry(body);

  // Bots that fill the hidden field get a normal-looking success and nothing else
  if (isBot(enquiry)) return NextResponse.json({ ok: true });

  const errors = validateEnquiry(enquiry);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const record = { ...enquiry, website: undefined, receivedAt: new Date().toISOString() };
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: formatForChat(record), enquiry: record }),
    }).catch(() => null);
    if (!res?.ok) {
      return NextResponse.json(
        { ok: false, error: `We couldn't send that just now. Please WhatsApp us on ${SITE.phoneDisplay}.` },
        { status: 502 },
      );
    }
  } else {
    console.info("[enquiry]", JSON.stringify(record));
  }

  // Hand back a WhatsApp link with the same details, for the fastest reply
  return NextResponse.json({ ok: true, whatsapp: whatsappUrl(formatForChat(record)) });
}

function formatForChat(e: ReturnType<typeof readEnquiry>) {
  return [
    `Hi TeddyPups! I'm ${e.name}.`,
    e.puppy && `I'm interested in ${e.puppy}.`,
    e.area && `I live in ${e.area}.`,
    e.message,
    `You can reach me on ${e.phone}${e.email ? ` or ${e.email}` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
