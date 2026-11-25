// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import { siteConfig } from "./src/config/site.ts";

export default defineConfig({
  site: siteConfig.url,
  adapter: vercel(),
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    // Chats are private and unique per visitor, so they stay out of the sitemap
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/chat") }),
    icon(),
  ],
  prefetch: true,
  env: {
    schema: {
      GROQ_API_KEY: envField.string({ context: "server", access: "secret" }),

      // Captcha: switch provider here, nothing else changes
      CAPTCHA_PROVIDER: envField.enum({
        context: "client",
        access: "public",
        values: ["turnstile", "recaptcha", "none"],
      }),
      TURNSTILE_SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),
      RECAPTCHA_SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      RECAPTCHA_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),

      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});