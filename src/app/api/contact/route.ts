import { NextResponse } from "next/server";
import { buildMailtoFallback, sendContactEmail } from "@/lib/contact-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SUBJECT_LABELS: Record<string, string> = {
  general: "General Inquiry",
  affiliate: "Affiliate & Partner Inquiry",
  merchant: "Merchant Feed Integration",
  privacy: "Data Privacy & Legal Request (DSAR)",
};

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`contact:${clientIp}`, 5, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many contact requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const subjectKey = String(payload.subject || "general");
  const message = String(payload.message || "").trim();
  const honeypot = String(payload.company || "").trim();
  const privacyAccepted = payload.privacyAccepted === true;

  if (honeypot) {
    return NextResponse.json({ ok: true, delivery: "ignored" });
  }

  if (!privacyAccepted) {
    return NextResponse.json(
      { error: "You must accept the privacy notice before submitting." },
      { status: 400 }
    );
  }

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { error: "Message must be between 10 and 5000 characters." },
      { status: 400 }
    );
  }

  const subjectLabel = SUBJECT_LABELS[subjectKey] || "Contact";
  const emailSubject = `[BeforeToBuy] ${subjectLabel} — ${name}`;

  try {
    const delivery = await sendContactEmail({
      name,
      email,
      subject: emailSubject,
      message,
    });

    if (delivery.sent) {
      return NextResponse.json({ ok: true, delivery: "email" });
    }

    return NextResponse.json({
      ok: true,
      delivery: "mailto_fallback",
      mailto: buildMailtoFallback({
        name,
        email,
        subject: emailSubject,
        message,
      }),
    });
  } catch (error) {
    console.error("Contact delivery failed:", error);
    return NextResponse.json(
      {
        ok: true,
        delivery: "mailto_fallback",
        mailto: buildMailtoFallback({
          name,
          email,
          subject: emailSubject,
          message,
        }),
      },
      { status: 200 }
    );
  }
}
