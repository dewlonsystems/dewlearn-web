import { siteConfig as s } from "@/config/site";
import { services, products } from "@/config/offerings";
import { mapsLink } from "@/config/offices";
import { absoluteUrl } from "@/lib/url";

export const organizationId = absoluteUrl("/#organization");
export const websiteId = absoluteUrl("/#website");

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: s.name,
    legalName: s.legalName,
    alternateName: s.shortName,
    url: s.url,
    logo: {
      "@type": "ImageObject",
      "@id": absoluteUrl("/#logo"),
      url: absoluteUrl(s.logo.src),
      width: s.logo.width,
      height: s.logo.height,
      caption: s.name,
    },
    image: absoluteUrl(s.ogImage.src),
    description: s.organizationDescription,
    slogan: s.tagline,
    foundingDate: String(s.foundingYear),
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: s.team.min, maxValue: s.team.max },
    telephone: s.contact.phone,
    email: s.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address.street,
      addressLocality: s.address.city,
      addressRegion: s.address.region,
      postalCode: s.address.postalCode,
      addressCountry: s.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: s.geo.latitude, longitude: s.geo.longitude },
    contactPoint: ["customer service", "sales"].map((contactType) => ({
      "@type": "ContactPoint",
      telephone: s.contact.phone,
      contactType,
      email: s.contact.email,
      areaServed: s.areaServed.countryCodes,
      availableLanguage: s.contact.languages,
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: s.contact.hours.days,
        opens: s.contact.hours.opens,
        closes: s.contact.hours.closes,
      },
    })),
    areaServed: [
      ...s.areaServed.countries.map((name) => ({ "@type": "Country", name })),
      ...s.areaServed.regions.map((name) => ({ "@type": "AdministrativeArea", name })),
    ],
    knowsAbout: s.knowsAbout,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Software Development Services & Products",
      itemListElement: [
        ...services.map((o) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: o.name, description: o.description, url: absoluteUrl(o.path) },
        })),
        ...products.map((o) => ({
          "@type": "Offer",
          itemOffered: { "@type": "SoftwareApplication", name: o.name, description: o.description, url: absoluteUrl(o.path) },
        })),
      ],
    },
    sameAs: Object.values(s.social),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: s.url,
    name: s.name,
    alternateName: s.shortName,
    description: s.description,
    inLanguage: s.locale,
    publisher: { "@id": organizationId },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function contactPageSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": absoluteUrl("/contact#webpage"),
    url: absoluteUrl("/contact"),
    name: `Contact ${s.name}`,
    description,
    inLanguage: s.locale,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
  };
}

export function webPageSchema(options: { path: string; name: string; description: string; modified?: Date }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl(`${options.path}#webpage`),
    url: absoluteUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: s.locale,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
    ...(options.modified ? { dateModified: options.modified.toISOString() } : {}),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": absoluteUrl("/#business"),
    name: s.name,
    legalName: s.legalName,
    url: s.url,
    image: absoluteUrl(s.ogImage.src),
    logo: absoluteUrl(s.logo.src),
    description: s.organizationDescription,
    telephone: s.contact.phone,
    email: s.contact.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address.street,
      addressLocality: s.address.city,
      addressRegion: s.address.region,
      postalCode: s.address.postalCode,
      addressCountry: s.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: s.geo.latitude, longitude: s.geo.longitude },
    hasMap: mapsLink,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.contact.hours.days,
      opens: s.contact.hours.opens,
      closes: s.contact.hours.closes,
    },
    areaServed: [
      ...s.areaServed.countries.map((name) => ({ "@type": "Country", name })),
      ...s.areaServed.regions.map((name) => ({ "@type": "AdministrativeArea", name })),
    ],
    parentOrganization: { "@id": organizationId },
    sameAs: Object.values(s.social),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}