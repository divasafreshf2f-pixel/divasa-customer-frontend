import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  FAQ_SCHEMA,
  ROUTE_SEO,
  SITE_URL,
  SOCIAL_LINKS,
} from "./seoConfig";

function resolveRouteMeta(pathname) {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];
  if (matchPath("/orders/:id", pathname)) {
    return {
      title: "Order Details | Divasa Fresh",
      description:
        "View detailed Divasa Fresh order information for your Bengaluru farm-to-home fresh produce and healthy meal deliveries.",
      keywords: "Divasa Fresh order details, Bengaluru delivery order tracking",
    };
  }
  return {
    title: `Farm-to-Home Fresh Produce in Bengaluru | ${BRAND_NAME}`,
    description: DEFAULT_DESCRIPTION,
    keywords:
      "Divasa Fresh, Bengaluru farm fresh fruits, Bangalore fresh vegetables delivery, healthy meals",
  };
}

function breadcrumbSchema(pathname, title) {
  const parts = pathname.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ];
  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: part.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      item: `${SITE_URL}${currentPath}`,
    });
  });
  if (parts.length === 0) {
    items[0].name = "Home";
  } else {
    items[items.length - 1].name = title.split("|")[0].trim();
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo2.png`,
    sameAs: SOCIAL_LINKS,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-99001-52573",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["en", "hi", "kn"],
      },
    ],
    founder: [
      { "@type": "Person", name: "Dhanraj H B", jobTitle: "Founder & CEO" },
      { "@type": "Person", name: "Kavya T", jobTitle: "Proprietor & Director" },
      { "@type": "Person", name: "Vijay Krishna", jobTitle: "Co-Founder & COO" },
    ],
  };
}

function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}#localbusiness`,
    name: BRAND_NAME,
    image: `${SITE_URL}/logo2.png`,
    url: SITE_URL,
    telephone: "+91-99001-52573",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "City", name: "Bengaluru" },
      { "@type": "AdministrativeArea", name: "Karnataka" },
    ],
    description:
      "Divasa Fresh is a Bengaluru-based farm-to-home fresh produce supplier offering vegetables, fruits, healthy meals, subscriptions, and bulk supply.",
    makesOffer: [
      "Fresh vegetables",
      "Fresh fruits",
      "Fruit bowls",
      "Fruit cups",
      "Healthy meals",
      "Subscription meal plans",
      "Bulk vegetable supply",
      "HORECA supply",
      "Apartment stall setups",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: BRAND_NAME,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}

export default function SeoHead() {
  const { pathname } = useLocation();
  const meta = resolveRouteMeta(pathname);
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const breadcrumbs = breadcrumbSchema(pathname, meta.title);
  const isFaqPage = pathname === "/faqs";

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en-IN" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="author" content={BRAND_NAME} />
      <meta name="geo.region" content="IN-KA" />
      <meta name="geo.placename" content="Bengaluru" />
      <meta name="theme-color" content="#0B1220" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(organizationSchema())}</script>
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema())}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema())}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      {isFaqPage ? <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script> : null}
    </Helmet>
  );
}
