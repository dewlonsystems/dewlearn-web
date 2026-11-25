import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const legal = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    updated: z.coerce.date(),
    keyFacts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    cta: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = { legal };