import { formEndpoint } from "@/lib/forms/server";
import { contactSchema } from "@/features/contact/schema";
import { sendContactEmail } from "@/features/contact/send";

export const prerender = false;

export const POST = formEndpoint(contactSchema, (data) => sendContactEmail(data));