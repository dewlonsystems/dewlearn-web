export interface Offering {
  slug: string;
  name: string;
  /** One line for menus and cards. Keep it under about 60 characters. */
  summary: string;
  /** Full text for schema.org, page intros and SEO. */
  description: string;
  path: string;
  icon: string;
}

export const services: Offering[] = [
  {
    slug: "custom-software-development",
    name: "Custom Software Development",
    summary: "Bespoke systems built around how you work.",
    description:
      "Bespoke software built around your unique business processes, from internal tools to full platforms.",
    path: "/services/custom-software-development",
    icon: "lucide:code-xml",
  },
  {
    slug: "website-design-development",
    name: "Website Design & Development",
    summary: "Fast, SEO-ready websites that turn visitors into clients.",
    description:
      "Custom, fast, SEO-friendly websites for Kenyan businesses, built with modern frameworks.",
    path: "/services/website-design-development",
    icon: "lucide:layout-template",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    summary: "iOS and Android apps built for East African users.",
    description:
      "Cross-platform iOS and Android mobile applications tailored for East African markets.",
    path: "/services/mobile-app-development",
    icon: "lucide:smartphone",
  },
  {
    slug: "enterprise-software-solutions",
    name: "Enterprise Software Solutions",
    summary: "Secure platforms for large teams and organisations.",
    description:
      "Secure, scalable platforms for large organisations, from growing businesses to county governments, built around Kenyan compliance needs.",
    path: "/services/enterprise-software-solutions",
    icon: "lucide:network",
  },
  {
    slug: "cloud-solutions",
    name: "Cloud Solutions",
    summary: "Scalable, secure infrastructure on AWS, Azure and GCP.",
    description:
      "Scalable, secure cloud infrastructure on AWS, Azure and Google Cloud, designed for reliability and cost control.",
    path: "/services/cloud-solutions",
    icon: "lucide:cloud",
  },
  {
    slug: "api-development-integration",
    name: "API Development & Integration",
    summary: "Connect your systems, payments and M-Pesa.",
    description:
      "Well-documented APIs and integrations that connect your systems, third-party services and M-Pesa payments.",
    path: "/services/api-development-integration",
    icon: "lucide:webhook",
  },
  {
    slug: "software-maintenance-support",
    name: "Software Maintenance & Support",
    summary: "Monitoring, updates and fixes after launch.",
    description:
      "Ongoing monitoring, security patches, updates and performance tuning to keep your software running smoothly after launch.",
    path: "/services/software-maintenance-support",
    icon: "lucide:wrench",
  },
  {
    slug: "ui-ux-design-prototyping",
    name: "UI/UX Design & Prototyping",
    summary: "Interfaces people understand, tested before they're built.",
    description:
      "User-centred design, interactive prototypes and design systems for digital products.",
    path: "/services/ui-ux-design-prototyping",
    icon: "lucide:pen-tool",
  },
  {
    slug: "quality-assurance-testing",
    name: "Quality Assurance & Testing",
    summary: "Manual and automated testing before every release.",
    description:
      "Manual and automated testing that catches problems before your users do.",
    path: "/services/quality-assurance-testing",
    icon: "lucide:bug",
  },
  {
    slug: "devops-automation",
    name: "DevOps & Automation",
    summary: "CI/CD pipelines and repeatable, automated deployments.",
    description:
      "CI/CD pipelines, containerisation and automated deployments for faster, safer releases.",
    path: "/services/devops-automation",
    icon: "lucide:infinity",
  },
  {
    slug: "seo-digital-marketing-support",
    name: "SEO & Digital Marketing Support",
    summary: "Get found on Google and reach the right customers.",
    description:
      "Technical SEO, content strategy and digital marketing campaigns for Kenyan businesses.",
    path: "/services/seo-digital-marketing-support",
    icon: "lucide:trending-up",
  },
  {
    slug: "it-consulting-digital-transformation",
    name: "IT Consulting & Digital Transformation",
    summary: "Strategy and guidance for your digital roadmap.",
    description:
      "Strategic IT consulting and digital transformation services for businesses in Kenya and East Africa.",
    path: "/services/it-consulting-digital-transformation",
    icon: "lucide:compass",
  },
  {
    slug: "technical-training-knowledge-transfer",
    name: "Technical Training & Knowledge Transfer",
    summary: "Training and documentation so your team can run it.",
    description:
      "Hands-on training, documentation and admin guides so your team can run and grow the system with confidence.",
    path: "/services/technical-training-knowledge-transfer",
    icon: "lucide:presentation",
  },
];

export const products: Offering[] = [
  {
    slug: "dewlearn-school-manager",
    name: "DewLearn School Manager",
    summary: "Offline-first school management with M-Pesa billing.",
    description:
      "Offline-first school management system for Kenyan schools, covering academics, report cards, fee billing, M-Pesa payments, and trial balance.",
    path: "/products/dewlearn-school-manager",
    icon: "lucide:school",
  },
];