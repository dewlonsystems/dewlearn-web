import { siteConfig } from "@/config/site";
import { sendEmail } from "@/lib/email";
import { buildConfirmationEmail, buildTeamEmail } from "./emails";
import { serviceOptions } from "./options";
import type { ContactInput } from "./schema";

export async function sendContactEmail(data: ContactInput): Promise<void> {
  const service = serviceOptions.find((o) => o.value === data.service)?.label ?? data.service;
  const domain = new URL(siteConfig.url).hostname;
  const teamAddress = siteConfig.contact.email;

  // The enquiry must reach the team. If this fails, the visitor sees an error.
  await sendEmail({
    from: `Dewlon Website <noreply@${domain}>`,
    to: [teamAddress],
    replyTo: data.email,
    ...buildTeamEmail(data, service),
  });

  // The visitor's receipt is a courtesy. A failure here shouldn't undo a good submission.
  try {
    await sendEmail({
      from: `${siteConfig.name} <noreply@${domain}>`,
      to: [data.email],
      replyTo: teamAddress,
      ...buildConfirmationEmail(data, service),
    });
  } catch (error) {
    console.error("[CONTACT] confirmation email failed", error);
  }
}