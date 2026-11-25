import { siteConfig } from "@/config/site";
import { escapeHtml, nl2br } from "@/lib/html";
import type { ContactInput } from "./schema";

const GREEN = "#003c25";
const ORANGE = "#cc5500";
const CREAM = "#fdf5e6";
const BODY_FONT = "font-family: Arial, Helvetica, sans-serif; color: #111827;";

export function buildTeamEmail(data: ContactInput, service: string) {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", `<a href="mailto:${email}" style="color:${ORANGE};">${email}</a>`],
    ["Phone", phone ? `<a href="tel:${phone}" style="color:${ORANGE};">${phone}</a>` : `<span style="color:#9ca3af;">Not provided</span>`],
    ["Interested in", escapeHtml(service)],
  ];

  const html = `<!DOCTYPE html>
<html><body style="${BODY_FONT} max-width:600px; margin:0 auto; padding:24px;">
  <div style="background:${GREEN}; padding:24px 32px; border-radius:12px 12px 0 0;">
    <h1 style="color:#ffffff; margin:0; font-size:20px;">New project enquiry</h1>
    <p style="color:rgba(255,255,255,0.65); margin:4px 0 0; font-size:13px;">Via ${escapeHtml(new URL(siteConfig.url).hostname)} contact form</p>
  </div>
  <div style="background:${CREAM}; padding:32px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 12px 12px;">
    <table style="width:100%; border-collapse:collapse;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-weight:600; color:${GREEN}; width:120px;">${label}</td><td style="padding:10px 0; border-bottom:1px solid #e5e7eb;">${value}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-weight:600; color:${GREEN}; margin:24px 0 8px;">Message</p>
    <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:16px; line-height:1.7; color:#374151;">${nl2br(data.message)}</div>
  </div>
</body></html>`;

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "Not provided"}`,
    `Interested in: ${service}`,
    "",
    data.message,
  ].join("\n");

  return { subject: `New enquiry from ${data.name}`, html, text };
}

export function buildConfirmationEmail(data: ContactInput, service: string) {
  const name = escapeHtml(data.name);
  const where = `${escapeHtml(data.email)}${data.phone ? ` or ${escapeHtml(data.phone)}` : ""}`;
  const p = `style="margin:0 0 16px; color:#4b5563; line-height:1.8;"`;

  const html = `<!DOCTYPE html>
<html><body style="${BODY_FONT} max-width:600px; margin:0 auto; padding:24px; background:#ffffff;">
  <p style="margin:0 0 20px; font-size:16px;">Dear ${name},</p>
  <p ${p}>Thank you for reaching out to ${escapeHtml(siteConfig.name)}. Your enquiry about <strong style="color:${GREEN};">${escapeHtml(service)}</strong> has been received and is with our team.</p>
  <p ${p}>A member of the team will review your message and get back to you shortly on ${where}.</p>
  <p ${p}>If you would like to add anything in the meantime, just reply to this email and it will reach us directly.</p>
  <p ${p}>We appreciate you considering us and look forward to speaking with you.</p>
  <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e5e7eb;">
    <p style="margin:0; color:#4b5563;">Regards,</p>
    <p style="margin:4px 0 0; font-weight:600; color:${GREEN};">The ${escapeHtml(siteConfig.name)} Team</p>
  </div>
</body></html>`;

  const text = [
    `Dear ${data.name},`,
    "",
    `Thank you for reaching out to ${siteConfig.name}. Your enquiry about ${service} has been received and is with our team.`,
    "",
    `A member of the team will review your message and get back to you shortly on ${data.email}${data.phone ? ` or ${data.phone}` : ""}.`,
    "",
    "If you would like to add anything in the meantime, just reply to this email and it will reach us directly.",
    "",
    "Regards,",
    `The ${siteConfig.name} Team`,
  ].join("\n");

  return { subject: `We've received your enquiry - ${siteConfig.name}`, html, text };
}