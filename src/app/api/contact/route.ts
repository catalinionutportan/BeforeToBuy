import { NextResponse } from "next/server";
import { buildMailtoFallback, sendContactEmail } from "@/lib/contact-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasValidRequestOrigin } from "@/lib/request-origin";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import {
  BodyTooLargeError,
  contentLengthExceedsLimit,
  MAX_CONTACT_BODY_BYTES,
  readRequestBodyWithLimit,
} from "@/lib/request-body-limits";

const homeUi = HOME_UI[DEFAULT_LOCALE];

const SUBJECT_LABELS: Record<string, string> = {
  general: homeUi.contactFormSubjectGeneral,
  affiliate: homeUi.contactFormSubjectAffiliate,
  merchant: homeUi.contactFormSubjectMerchant,
  privacy: homeUi.contactFormSubjectPrivacy,
};

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: homeUi.invalidRequestOrigin }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`contact:${clientIp}`, 5, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.contactFormTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  if (contentLengthExceedsLimit(request, MAX_CONTACT_BODY_BYTES)) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await readRequestBodyWithLimit(request, MAX_CONTACT_BODY_BYTES);
    body = raw ? JSON.parse(raw) : {};
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    return NextResponse.json({ error: homeUi.invalidJsonBody }, { status: 400 });
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
      { error: homeUi.contactFormPrivacyNotAccepted },
      { status: 400 }
    );
  }

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: homeUi.contactFormInvalidName }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: homeUi.contactFormInvalidEmail }, { status: 400 });
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { error: homeUi.contactFormInvalidMessage },
      { status: 400 }
    );
  }

  const subjectLabel = SUBJECT_LABELS[subjectKey] || homeUi.contactFormSubjectDefault;
  const emailSubject = `${homeUi.contactFormEmailSubjectPrefix} ${subjectLabel} — ${name}`;

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
