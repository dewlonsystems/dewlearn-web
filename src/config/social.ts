import { siteConfig } from "@/config/site";

const { social } = siteConfig;

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: string;
  inHeader: boolean;
}

export const socialLinks: SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: social.linkedin, icon: "fa6-brands:linkedin-in", inHeader: true },
  { id: "twitter", label: "X (Twitter)", href: social.twitter, icon: "fa6-brands:x-twitter", inHeader: true },
  { id: "facebook", label: "Facebook", href: social.facebook, icon: "fa6-brands:facebook-f", inHeader: true },
  { id: "github", label: "GitHub", href: social.github, icon: "fa6-brands:github", inHeader: false },
  { id: "google", label: "Google Business Profile", href: social.google, icon: "fa6-brands:google", inHeader: false },
];