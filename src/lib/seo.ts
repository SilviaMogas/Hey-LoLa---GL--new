/**
 * Tiny SEO + GEO helper for our SPA. React Helmet would be cleaner, but
 * we don't want to ship another dependency for what is essentially:
 *   - keep <title> in sync with the current route
 *   - keep description / canonical / Open Graph meta in sync
 *   - render route-specific JSON-LD blocks so search engines AND
 *     generative AI assistants can describe the page accurately
 *
 * One hook for the head meta, one helper component for JSON-LD.
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
  /** Path or full URL; defaults to current path */
  url?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  /** Single object or array of objects — each renders as a <script type="application/ld+json"> via <PageJsonLd>. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: BreadcrumbItem[];
  /** Whether the route should be indexed. Defaults to true. */
  index?: boolean;
}

const META_DATA_ATTR = 'data-hl-seo';

function resolveUrl(url: string | undefined): string {
  if (!url) return typeof window === 'undefined' ? SITE.origin : window.location.href;
  if (url.startsWith('http')) return url;
  return `${SITE.origin}${url.startsWith('/') ? url : `/${url}`}`;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    el.setAttribute(META_DATA_ATTR, '1');
    document.head.appendChild(el);
  } else {
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  }
}

function upsertLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(META_DATA_ATTR, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Renders structured-data scripts for the current page. The scripts mount
 * into the document body — search engines and AI crawlers pick them up
 * from anywhere in the DOM. Using JSX (not imperative DOM mutation) keeps
 * the data flow explicit and audited by React.
 */
export const PageJsonLd: React.FC<{ data: Record<string, unknown> | Record<string, unknown>[] }> = ({ data }) => {
  const blocks = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);
  return React.createElement(
    React.Fragment,
    null,
    blocks.map((block, i) =>
      React.createElement(
        'script',
        { key: i, type: 'application/ld+json' },
        // React renders the child as a text node — no HTML parsing,
        // no dangerouslySetInnerHTML. JSON.stringify already escapes
        // every character that could break out of a `<script>` body.
        JSON.stringify(block).replace(/</g, '\\u003c'),
      ),
    ),
  );
};

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const fullTitle = meta.title.includes('Hey Lola') ? meta.title : `${meta.title} | Hey Lola`;
    document.title = fullTitle;

    const description = meta.description ?? SITE.defaultDescription;
    const url = resolveUrl(meta.url);
    const image = meta.ogImage ?? SITE.ogImage;
    const ogType = meta.ogType ?? 'website';

    upsertMeta('meta[name="description"]', { name: 'description', content: description });

    if (meta.index === false) {
      upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex, nofollow' });
    } else {
      upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow' });
    }

    upsertLink('canonical', url);

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  }, [meta.title, meta.description, meta.url, meta.ogType, meta.ogImage, meta.index]);
}

/** Convenience: build a list of JSON-LD blocks from a PageMeta. */
export function buildPageJsonLd(meta: PageMeta): Record<string, unknown>[] {
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

/**
 * The single per-page SEO component. Combines:
 *   - imperative <head> sync (title, description, og:*, twitter:*)
 *   - declarative JSON-LD scripts rendered via JSX (no
 *     dangerouslySetInnerHTML, no DOM mutation)
 * Drop one at the top of every page component.
 */
export const SEO: React.FC<PageMeta> = (meta) => {
  usePageMeta(meta);
  const blocks = useMemo(() => buildPageJsonLd(meta), [
    JSON.stringify(meta.jsonLd ?? null),
    JSON.stringify(meta.breadcrumbs ?? null),
  ]);
  if (blocks.length === 0) return null;
  return React.createElement(PageJsonLd, { data: blocks });
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
  areaServed: ['Miami', 'New York City', 'Barcelona'],
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

