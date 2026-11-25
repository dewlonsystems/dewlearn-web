import { products, services } from "@/config/offerings";

export const serviceOptions = [
  ...services.map((s) => ({ value: s.slug, label: s.name })),
  ...products.map((p) => ({ value: p.slug, label: p.name })),
  { value: "other", label: "Something else / not sure yet" },
];