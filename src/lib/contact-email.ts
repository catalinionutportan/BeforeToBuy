const CONTACT_FROM = process.env.CONTACT_FROM_EMAIL || "BeforeToBuy <onboarding@resend.dev>";
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || "admin@portanx.com";

export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false as const, reason: "missing_api_key" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: input.email,
      subject: input.subject,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email delivery failed: ${errorText}`);
  }

  return { sent: true as const };
}

export function buildMailtoFallback(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const subject = encodeURIComponent(input.subject);
  const body = encodeURIComponent(
    `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`
  );
  return `mailto:${CONTACT_TO}?subject=${subject}&body=${body}`;
}
