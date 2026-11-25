import { products, services } from "@/config/offerings";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavSingle extends NavLink {
  id: string;
}

export interface NavGroup {
  id: string;
  label: string;
  columns: 1 | 2 | 3;
  items: NavLink[];
  viewAll?: NavLink;
}

export type NavEntry = NavSingle | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => "items" in entry;

export const headerNav: NavEntry[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "services",
    label: "Services",
    columns: 3,
    items: services.map((s) => ({
      label: s.name,
      href: s.path,
      description: s.summary,
      icon: s.icon,
    })),
    viewAll: { label: "View all services", href: "/services" },
  },
  {
    id: "products",
    label: "Products",
    columns: 1,
    items: products.map((p) => ({
      label: p.name,
      href: p.path,
      description: p.summary,
      icon: p.icon,
    })),
    viewAll: { label: "View all products", href: "/products" },
  },
  {
    id: "company",
    label: "Company",
    columns: 1,
    items: [
      {
        label: "About",
        href: "/about",
        description: "Our story, team and mission.",
        icon: "lucide:users",
      },
      {
        label: "Portfolio",
        href: "/portfolio",
        description: "Case studies and projects we have delivered.",
        icon: "lucide:folder-open",
      },
      {
        label: "Careers",
        href: "/careers",
        description: "Open roles and life at Dewlon Systems.",
        icon: "lucide:briefcase",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    columns: 1,
    items: [
      {
        label: "Developer Hub",
        href: "/developer-hub",
        description: "Code snippets, components and server connectors.",
        icon: "lucide:terminal",
      },
      {
        label: "Blog",
        href: "/blog",
        description: "Insights, tutorials and articles from our team.",
        icon: "lucide:newspaper",
      },
      {
        label: "Events",
        href: "/events",
        description: "Launches, demos and community events.",
        icon: "lucide:calendar-days",
      },
    ],
  },
];

export const headerCta: NavLink = { label: "Contact us", href: "/contact" };

export const megaMenuHelp = {
  text: "Not sure what you need?",
  label: "Talk to us",
  href: "/contact",
};

export const footerNav = {
  explore: [
    { label: "Products", href: "/products" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Developer Hub", href: "/developer-hub" },
    { label: "Blog", href: "/blog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
  ],
} satisfies Record<string, NavLink[]>;

// Adjust these paths to match your existing legal pages
export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];