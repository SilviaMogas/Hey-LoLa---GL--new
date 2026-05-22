/**
 * SEO + GEO helpers for our SPA.
 *
 * We deliberately keep the runtime surface tiny:
 *   - document.title is updated per route (the only dynamic <head> write)
 *   - JSON-LD blocks render inside the component tree via JSX,
 *     never via document.createElement / innerHTML
 *
 * Static defaults for description, Open Graph, Twitter and canonical
 * live in index.html and the route-aware bits that bots actually read
 * are the JSON-LD blocks we ship per page.
 */

import React, { useEffect, useMemo } from 'react';

const SITE = {
  name: 'Hey Lola',
  origin: 'https://heylola.co',
  defaultDescription:
    "Hey Lola is a boutique lifestyle concierge for dog parents. Organise your dog's essentials, discover trusted dog-friendly places, and access curated local perks.",
  ogImage: 'https://heylola.co/og-image.png',
};

export interface BreadcrumbItem {
  name: string;
  /** Path or full URL */
  item: string;
}

export interface PageMeta {
  title: string;
  description?: string;
  /** Path or full URL; defaults to the current location */
  url?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: BreadcrumbItem[];
  /** Whether the route should be indexed. Defaults to true. */
  index?: boolean;
}

function resolveUrl(url: string | undefined): string {
  if (!url) return typeof window === 'undefined' ? SITE.origin : window.location.href;
  if (url.startsWith('http')) return url;
  return `${SITE.origin}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Build the JSON-LD blocks declared on a page. */
function buildPageJsonLd(meta: PageMeta): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: meta.breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: resolveUrl(b.item),
      })),
    });
  }
  if (meta.jsonLd) {
    blocks.push(...(Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd]));
  }
  return blocks;
}

/** Per-page SEO. Updates document.title and renders JSON-LD blocks. */
export const SEO: React.FC<PageMeta> = (meta) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = meta.title.includes('Hey Lola') ? meta.title : `${meta.title} | Hey Lola`;
  }, [meta.title]);

  const blocks = useMemo(
    () => buildPageJsonLd(meta),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(meta.jsonLd ?? null), JSON.stringify(meta.breadcrumbs ?? null)],
  );

  if (blocks.length === 0) return null;
  return React.createElement(
    React.Fragment,
    null,
    blocks.map((block, i) =>
      React.createElement(
        'script',
        { key: i, type: 'application/ld+json' },
        JSON.stringify(block).replace(/</g, '\\u003c'),
      ),
    ),
  );
};

/* ── Reusable schema builders ─────────────────────────────────────── */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.origin}/#organization`,
  name: 'Hey Lola',
  url: SITE.origin,
  logo: `${SITE.origin}/favicon.svg`,
  description: SITE.defaultDescription,
  founder: { '@type': 'Person', name: 'Silvia Mogas' },
  email: 'hey@heylola.co',
  parentOrganization: { '@type': 'Organization', name: 'BMBWeb3 Global FZCO' },
  areaServed: [
    { '@type': 'City', name: 'Miami' },
    { '@type': 'City', name: 'New York City' },
    { '@type': 'City', name: 'Toronto' },
    { '@type': 'City', name: 'Washington, D.C.' },
    { '@type': 'City', name: 'Barcelona' },
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.origin}/#website`,
  url: SITE.origin,
  name: 'Hey Lola',
  description: SITE.defaultDescription,
  inLanguage: ['en', 'es'],
  publisher: { '@id': `${SITE.origin}/#organization` },
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Lifestyle concierge for dog parents',
  provider: { '@id': `${SITE.origin}/#organization` },
  areaServed: ['Miami', 'New York City', 'Toronto', 'Washington, D.C.', 'Barcelona'],
  description: SITE.defaultDescription,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '24.99',
    offerCount: 4,
  },
};

export function faqPageSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function personSchema({ name, role, image, url, description }: { name: string; role: string; image: string; url: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: role,
    image: resolveUrl(image),
    url: resolveUrl(url),
    description,
    worksFor: { '@id': `${SITE.origin}/#organization` },
  };
}
