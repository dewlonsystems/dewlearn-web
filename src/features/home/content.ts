import { siteConfig } from "@/config/site";
import whoWeAre from "@/assets/home/who-we-are.jpg";
import nexora from "@/assets/home/nexora.jpg";
import healthConnect from "@/assets/home/health-connect.jpg";
import sipedo from "@/assets/home/sipedo.png";
import qezzy from "@/assets/home/qezzy.png";

interface Cta {
  label: string;
  href: string;
}

export interface HeroSlide {
  video: string;
  eyebrow: string;
  title: string;
  description: string;
  primary: Cta;
  secondary: Cta;
}

export const heroSlides: HeroSlide[] = [
  {
    video: "/videos/hero1.mp4",
    eyebrow: "Est. 2019 · Nairobi, Kenya",
    title: "Software built for East Africa’s ambition.",
    description:
      "Secure, high-performance digital products for businesses and institutions across Kenya and beyond.",
    primary: { label: "Start your project", href: "/contact" },
    secondary: { label: "See our work", href: "/portfolio" },
  },
  {
    video: "/videos/hero2.mp4",
    eyebrow: "Our people, our craft",
    title: "A team that ships and stays.",
    description:
      "Engineers, designers and project managers based in Kenya, who stay with you long after launch.",
    primary: { label: "Join our team", href: "/careers" },
    secondary: { label: "About us", href: "/about" },
  },
  {
    video: "/videos/hero3.mp4",
    eyebrow: "Web · Mobile · Cloud",
    title: "From idea to deployed product.",
    description:
      "We design, build and run the software your business depends on, from the first prototype to production.",
    primary: { label: "Our services", href: "/services" },
    secondary: { label: "Talk to us", href: "/contact" },
  },
];

export const techStack = [
  "React", "Next.js", "Astro", "TypeScript", "Node.js", "Python", "Django", "Laravel",
  "Flutter", "React Native", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes",
  "Tailwind CSS", "REST APIs", "GraphQL",
];

export const aboutImage = whoWeAre;

export const aboutPoints = [
  "Clean, well-documented code that your team can maintain",
  "Agile delivery with full transparency at every stage",
  "Deep M-Pesa, USSD and local payment gateway experience",
  "Post-launch support and maintenance built into every engagement",
];

export const stats = [
  { value: 85, suffix: "%", label: "Client return rate" },
  { value: 50, suffix: "+", label: "Projects delivered" },
  { value: new Date().getFullYear() - siteConfig.foundingYear, suffix: "+", label: "Years operating" },
  { value: 5, suffix: "★", label: "Google rating" },
];

/** Which services appear on the home page. Everything else lives on /services. */
export const featuredServiceSlugs = [
  "website-design-development",
  "mobile-app-development",
  "custom-software-development",
  "cloud-solutions",
  "ui-ux-design-prototyping",
  "seo-digital-marketing-support",
];

export const processSteps = [
  {
    title: "Discovery call",
    subtitle: "Understanding your world",
    text: "A free, no-obligation conversation about your business, your users and your goals. It isn’t a sales call. It’s a chance to see whether we’re the right fit.",
  },
  {
    title: "Project brief",
    subtitle: "Clarity before commitment",
    text: "A written brief covering scope, technical approach, timeline and investment. It becomes the shared source of truth for the whole project.",
  },
  {
    title: "Design and build",
    subtitle: "Agile, transparent delivery",
    text: "Two-week sprints, regular check-ins and a shared project board you can open any time. You see real progress, not just status updates.",
  },
  {
    title: "Launch and support",
    subtitle: "We stay after go-live",
    text: "We handle go-live carefully, watch performance in the first critical days, and offer monthly plans for updates, security patches and backups.",
  },
];

export const industries = [
  {
    icon: "lucide:landmark",
    label: "Government & public sector",
    text: "Citizen-facing portals, internal workflow systems and data platforms built to public sector procurement and compliance standards.",
  },
  {
    icon: "lucide:sprout",
    label: "Agritech & farming",
    text: "Farm management tools, market linkage platforms and supply chain systems connecting farmers to buyers across East Africa.",
  },
  {
    icon: "lucide:heart-pulse",
    label: "Healthcare",
    text: "Hospital management, patient records, telemedicine and health data analytics for the Kenyan healthcare environment.",
  },
  {
    icon: "lucide:graduation-cap",
    label: "Education & EdTech",
    text: "Learning platforms, student portals and examination management for schools, colleges and training institutions.",
  },
  {
    icon: "lucide:shopping-cart",
    label: "Retail & e-commerce",
    text: "Online stores, inventory systems, M-Pesa and card payments, and omnichannel retail platforms.",
  },
  {
    icon: "lucide:truck",
    label: "Logistics & transport",
    text: "Fleet management, route optimisation, delivery tracking and coordination software for transport businesses.",
  },
  {
    icon: "lucide:wallet",
    label: "Fintech & payments",
    text: "Loan management, mobile banking and agent platforms, with deep M-Pesa, Daraja, Pesapal and iPay integration.",
  },
  {
    icon: "lucide:heart-handshake",
    label: "NGOs & non-profits",
    text: "Donor management, beneficiary tracking, field data collection and impact reporting for development organisations.",
  },
];

export interface PortfolioItem {
  image: ImageMetadata;
  name: string;
  tag: string;
  result: string;
  href?: string;
}

export const portfolio: PortfolioItem[] = [
  {
    image: nexora,
    name: "Nexora Cleaning and Pest Control",
    tag: "Services",
    result: "Cleaned 100+ facilities",
    href: "https://nexoras.co.ke",
  },
  { image: healthConnect, name: "Nairobi Health Connect", tag: "HealthTech", result: "12 clinics, 1 platform" },
  {
    image: sipedo,
    name: "Sipedo Services",
    tag: "Services",
    result: "3× conversion improvement",
    href: "https://sipedo.co.ke",
  },
  {
    image: qezzy,
    name: "Qezzy Surveys",
    tag: "SaaS",
    result: "Launched in 8 weeks",
    href: "https://qezzykenya.company",
  },
];

export const testimonials = [
  {
    initials: "JM",
    name: "Jane Mwangi",
    role: "CEO, TechStart Nairobi",
    text: "Dewlon delivered our e-commerce platform ahead of schedule and well under budget. Their UI/UX work is world-class. I have worked with agencies in London and Nairobi, and this team holds its own against anyone.",
  },
  {
    initials: "DO",
    name: "David Omondi",
    role: "Founder, AgriSoko",
    text: "From the first discovery call to go-live, the team was professional, responsive and honest. When we hit a technical challenge, they flagged it early and came with solutions. Our app now serves over 10,000 farmers across three counties.",
  },
  {
    initials: "GA",
    name: "Grace Akinyi",
    role: "IT Director, Kakamega County",
    text: "The system they built streamlined our operations division and cut average case processing time by 70%. They also trained our team and documented everything, so we are not dependent on them to keep it running.",
  },
];

export const reviewLinks = {
  all: "https://www.google.com/search?q=Dewlon+Systems+reviews",
  leave: "https://g.page/r/CY2ImLBjrBHuEAE/review",
};

export const faqs = [
  {
    q: "Do you offer services outside Nairobi?",
    a: "Yes. Our head office is in Imara Daima, Nairobi, we have a branch in Kisii, and we work with clients across Kenya and East Africa remotely. Distance has never been a barrier to a successful project.",
  },
  {
    q: "How much does a project cost?",
    a: "It depends on scope, so we price every project individually. After a free consultation we send a written proposal with a fixed scope, timeline and fee, so you know what you are paying for before any work starts.",
  },
  {
    q: "How long does a typical project take?",
    a: "A standard business website takes 2–4 weeks. Custom web and mobile applications usually take 6–16 weeks depending on complexity, integrations and how quickly feedback comes in. We confirm a timeline in the project brief.",
  },
  {
    q: "Do you provide ongoing maintenance?",
    a: "Yes. We offer monthly support packages covering updates, security patches, backups, uptime monitoring and performance tuning. Most clients stay with us after go-live.",
  },
  {
    q: "Can you integrate with M-Pesa and local payment systems?",
    a: "Yes, this is one of our core strengths. We have experience with the Daraja API, Pesapal, iPay and other Kenyan gateways, and we understand how to build payment flows that East African users trust.",
  },
  {
    q: "How do you handle project communication?",
    a: "Every project has a dedicated project manager as your single point of contact. We use a shared project board and hold regular video check-ins, so you never have to chase us for an update.",
  },
  {
    q: "Can you redesign my existing website without hurting my Google rankings?",
    a: "Yes. We start with an audit of your current site covering performance, SEO and structure, then rebuild it with modern standards. Every existing URL is mapped to its new home with a redirect so your search visibility is protected.",
  },
  {
    q: "What size businesses do you work with?",
    a: "All sizes, from startups building a first product to established companies modernising old systems and county governments digitising public services. Our process scales to fit the project.",
  },
];