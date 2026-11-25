export const siteConfig = {
  name: "Dewlon Systems",
  shortName: "Dewlon",
  legalName: "Dewlon Systems Limited",
  url: "https://dewlons.com",
  locale: "en-KE",
  ogLocale: "en_KE",
  foundingYear: 2019,
  tagline: "We build the software that moves your business forward.",

  title: {
    default: "Dewlon Systems - Custom Software Development in Nairobi, Kenya",
    template: "%s - Dewlon Systems",
  },
  description:
    "Nairobi-based software development company building custom web apps, mobile apps, enterprise software and IT consulting for businesses in Kenya, Uganda & Tanzania. Offices in Nairobi, Kisii & Kakamega.",
  organizationDescription:
    "Dewlon Systems is a Nairobi-based software development company specialising in custom web applications, mobile apps, enterprise software, cloud solutions, and UI/UX design for businesses across Kenya and East Africa. Dewlon Systems also builds and owns its own software products, including DewLearn School Manager.",

  themeColor: { light: "#fafaf8", dark: "#0a0a0a" },

  ogImage: {
    src: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "Dewlon Systems – Custom Software Development in Nairobi, Kenya",
  },
  logo: { src: "/logo.png", width: 512, height: 512 },

  contact: {
    email: "contact@dewlons.com",
    phone: "+254181798298",
    phoneDisplay: "+254 181 798 298",
    whatsapp: "254181798298",
    whatsappMessage:
      "Hello Dewlon Systems, I found you on your website and I'd like to discuss a project.",
    hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    languages: ["English", "Swahili"],
  },

  address: {
    street: "Imara Daima",
    city: "Nairobi",
    region: "Nairobi County",
    postalCode: "00100",
    country: "KE",
  },
  geo: { latitude: -1.3236, longitude: 36.8827 },
  offices: ["Nairobi", "Kisii", "Kakamega"],

  areaServed: {
    countryCodes: ["KE", "UG", "TZ", "RW"],
    countries: ["Kenya", "Uganda", "Tanzania"],
    regions: ["East Africa"],
  },
  team: { min: 5, max: 20 },

  social: {
    linkedin: "https://www.linkedin.com/company/dewlon-systems",
    twitter: "https://twitter.com/dewlonsystems",
    facebook: "https://www.facebook.com/dewlonsystems",
    github: "https://github.com/dewlonsystems",
    google: "https://g.page/r/CY2ImLBjrBHuEBM",
  },
  twitterHandle: "@dewlonsystems",

  knowsAbout: [
    "Web Application Development", "Mobile App Development",
    "React", "Astro", "Next.js", "Node.js", "TypeScript",
    "Cloud Computing", "UI/UX Design", "Enterprise Software",
    "E-commerce Solutions", "API Development", "Database Architecture",
    "DevOps", "SEO", "Digital Marketing", "School Management Software",
  ],
} as const;

export type SiteConfig = typeof siteConfig;