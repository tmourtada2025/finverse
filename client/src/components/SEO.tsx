/**
 * SEO component — uses React 19's native metadata hoisting.
 *
 * React 19 automatically hoists <title>, <meta>, <link>, and <script> tags
 * rendered anywhere in the component tree up to <head>, deduplicating as needed.
 * No external dependency required.
 *
 * Usage:
 *   <SEO
 *     title="Page Title"
 *     description="Page-specific meta description, ~160 chars"
 *     canonical="/about"
 *     ogType="article"
 *     ogImage="/some-image.png"
 *     jsonLd={{ ... }}
 *   />
 *
 * Title automatically appends " — FinVerse" suffix unless `noSuffix` is true.
 * Canonical resolves against https://finverse.world.
 * Default OG image is /og-image.png at the site root.
 */

const SITE_URL = "https://finverse.world";
const DEFAULT_OG_IMAGE = "/og-image.png";
const SITE_NAME = "FinVerse";
const DEFAULT_DESCRIPTION =
  "Hybrid institutional market structure for disciplined independent traders. Smart Money Concepts, classical technical rhythm, and risk architecture.";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  noSuffix?: boolean;
  noIndex?: boolean;
  jsonLd?: object | object[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noSuffix = false,
  noIndex = false,
  jsonLd,
  publishedTime,
  modifiedTime,
  author,
}: SEOProps) {
  const fullTitle = noSuffix ? title : `${title} — ${SITE_NAME}`;
  const fullCanonical = canonical
    ? `${SITE_URL}${canonical.startsWith("/") ? canonical : "/" + canonical}`
    : SITE_URL;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* JSON-LD structured data */}
      {jsonLdArray.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// Reusable schema builders
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FinVerse",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: DEFAULT_DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "Toufic Mourtada",
    jobTitle: "Founder & CEO",
  },
  sameAs: [],
};

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Toufic Mourtada",
  jobTitle: "Founder & CEO of FinVerse",
  alternateName: "The Trader Alchemist",
  url: `${SITE_URL}/about`,
  worksFor: {
    "@type": "Organization",
    name: "FinVerse",
    url: SITE_URL,
  },
};

export function articleSchema(opts: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  image?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/blog/${opts.slug}`,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt || opts.publishedAt,
    image: opts.image
      ? opts.image.startsWith("http")
        ? opts.image
        : `${SITE_URL}${opts.image}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    author: {
      "@type": "Person",
      name: "Toufic Mourtada",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    articleSection: opts.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${opts.slug}`,
    },
  };
}

export function courseSchema(opts: {
  name: string;
  description: string;
  slug: string;
  price: number;
  available: boolean;
  numberOfLessons?: number;
  totalDurationMinutes?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/courses/${opts.slug}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    instructor: {
      "@type": "Person",
      name: "Toufic Mourtada",
    },
    ...(opts.available && {
      offers: {
        "@type": "Offer",
        price: opts.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/courses/${opts.slug}`,
      },
    }),
    ...(opts.numberOfLessons && {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: opts.totalDurationMinutes
          ? `PT${opts.totalDurationMinutes}M`
          : undefined,
      },
    }),
  };
}
