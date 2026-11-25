export type CookieCategoryId = "necessary" | "functional" | "analytics" | "marketing";

export interface CookieCategory {
  id: CookieCategoryId;
  title: string;
  description: string;
  required?: boolean;
}

// Keep this list honest: only describe what the site actually does.
// It must match your Privacy Policy.
export const cookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description:
      "Required for the site to work, including security and remembering your cookie choices. These cannot be switched off.",
    required: true,
  },
  {
    id: "functional",
    title: "Functional",
    description:
      "Remember your preferences and power optional features such as the Dewlon assistant and contact tools.",
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Help us understand how visitors use the site, such as which pages are popular and how fast they load, so we can improve it.",
  },
  {
    id: "marketing",
    title: "Marketing",
    description:
      "Used to measure campaigns and show relevant content about our services on other platforms.",
  },
];