import { z } from "zod";
import { serviceOptions } from "./options";

const allowedServices = serviceOptions.map((o) => o.value);

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100, "That name is too long."),
  email: z
    .string()
    .trim()
    .max(254, "That email address is too long.")
    .pipe(z.email("Enter a valid email address.")),
  phone: z.string().trim().regex(/^(\+[1-9]\d{6,14})?$/, "Enter a valid phone number."),
  service: z.string().refine((v) => allowedServices.includes(v), "Please choose an option."),
  message: z
    .string()
    .trim()
    .min(20, "Please tell us a little more (at least 20 characters).")
    .max(2000, "Please keep your message under 2000 characters."),
  consent: z.string().optional().refine((v) => v === "on", "Please accept to continue."),
});

export type ContactInput = z.infer<typeof contactSchema>;