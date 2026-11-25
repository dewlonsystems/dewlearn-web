import { RESEND_API_KEY } from "astro:env/server";

export interface EmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const subject = options.subject.replace(/[\r\n]+/g, " ");

  if (!RESEND_API_KEY) {
    if (import.meta.env.DEV) {
      console.log(`[EMAIL:dev] No RESEND_API_KEY set, nothing sent.\nTo: ${options.to.join(", ")}\nSubject: ${subject}\n\n${options.text}`);
      return;
    }
    throw new Error("RESEND_API_KEY is not set");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}