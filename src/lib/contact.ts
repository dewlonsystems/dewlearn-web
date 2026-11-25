import { siteConfig } from "@/config/site";

export function whatsappUrl(message: string = siteConfig.contact.whatsappMessage): string {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}