import { Metadata } from 'next';

export const SITE_NAME = 'Cosplay Portfolio';
export const SITE_URL = 'https://cosplay-portfolio.vercel.app';
export const SITE_DESCRIPTION = 'Professional cosplay photography showcasing stunning costumes, characters, and creative photography from conventions, studios, and outdoor shoots.';
export const SOCIAL_TWITTER = '@cosplayportfolio';
export const SOCIAL_INSTAGRAM = 'cosplay_portfolio';

export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  keywords?: string[];
  author?: string;
}

/**
 * Generate comprehensive metadata for any page
 */
export function generateMetadata(options: SEOMetadata): Metadata {
  const {
    title,
    description,
    image = `${SITE_URL}/og/default.jpg`,
    url,
    type = 'website',
    keywords = [],
    author = 'Cosplay Portfolio',
  } = options;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : [
      'cosplay',
      'cosplay photography',
      'costume',
      'photography',
      'convention',
      'portfolio',
    ],
    authors: [{ name: author }],
    creator: author,
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: SOCIAL_TWITTER,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      `https://instagram.com/${SOCIAL_INSTAGRAM}`,
      `https://twitter.com/${SOCIAL_TWITTER}`,
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MY',
    },
  };
}

/**
 * Generate JSON-LD structured data for Photo/CreativeWork
 */
export function generatePhotoSchema(data: {
  name: string;
  description?: string;
  image: string;
  uploadDate?: string;
  author?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
    description: data.description || SITE_DESCRIPTION,
    image: data.image,
    url: data.url,
    author: {
      '@type': 'Organization',
      name: data.author || SITE_NAME,
    },
    uploadDate: data.uploadDate || new Date().toISOString(),
  };
}

/**
 * Generate JSON-LD for BreadcrumbList (for navigation)
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate JSON-LD for WebPage
 */
export function generateWebPageSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og/logo.png`,
      },
    },
  };
}
