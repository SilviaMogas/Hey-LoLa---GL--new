import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { SEO, faqPageSchema, personSchema } from '../lib/seo';
import { AUTHORS, getPostBySlug, getAllPosts, type Block, type BlogPost } from '../data/blog';
import { paths, buildPath } from '../lib/routes';

const SITE = 'https://heylola.co';

function AuthorByline({ authorId, date, readingMinutes }: { authorId: BlogPost['authorId']; date: string; readingMinutes: number }) {
  const author = AUTHORS[authorId];
  const initials = author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const formatted = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
        {author.avatar
          ? <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" loading="lazy" />
          : <span className="text-sm font-serif italic text-stone-400">{initials}</span>}
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-charcoal">{author.name}</p>
        <p className="text-[11px] text-stone-400 font-light">
          {author.role} · {formatted} · <span className="inline-flex items-center gap-1"><Clock size={10} /> {readingMinutes} min</span>
        </p>
      </div>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight text-charcoal mt-10 mb-3">{block.text}</h2>;
    case 'p':
      return <p className="text-[15px] sm:text-base text-stone-600 font-light leading-relaxed mb-4">{block.text}</p>;
    case 'quote':
      return (
        <blockquote className="my-8 border-l-2 border-brand-orange/60 pl-5 py-1">
          <p className="text-lg sm:text-xl font-serif italic text-charcoal/80 leading-snug">{block.text}</p>
        </blockquote>
      );
    case 'list':
      return (
        <ul className="my-4 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] text-stone-600 font-light leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-[2px] bg-brand-orange shrink-0" aria-hidden="true" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case 'rank':
      return (
        <div className="my-4 rounded-2xl border border-stone-100 bg-stone-50/60 p-5 sm:p-6">
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className="text-2xl font-black italic tracking-tighter text-stone-300 leading-none">{String(block.n).padStart(2, '0')}</span>
            <div>
              <h3 className="text-lg font-serif italic tracking-tight text-charcoal leading-tight">{block.name}</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">{block.tag}</span>
            </div>
          </div>
          <p className="text-[15px] text-stone-600 font-light leading-relaxed">{block.text}</p>
          {block.tip && (
            <p className="text-[13px] text-stone-500 italic font-light leading-relaxed mt-2 border-t border-stone-100 pt-2">
              <span className="font-bold not-italic text-charcoal/70">Tip: </span>{block.tip}
            </p>
          )}
        </div>
      );
    default:
      return null;
  }
}

export const BlogArticle: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = getPostBySlug(slug);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [slug]);

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-20 text-center font-boutique">
        <h1 className="text-3xl font-serif italic tracking-tight">Article not found<span className="brand-dot" aria-hidden="true" /></h1>
        <button
          type="button"
          onClick={() => navigate(paths.blog)}
          className="mt-6 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors"
        >
          <ArrowLeft size={12} /> Back to the Journal
        </button>
      </main>
    );
  }

  const author = AUTHORS[post.authorId];
  const url = `${SITE}${buildPath.blogArticle(post.slug)}`;
  const description = post.metaDescription || post.excerpt;
  const ranks = post.blocks.filter((b): b is Extract<Block, { type: 'rank' }> => b.type === 'rank');

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ranks.length > 0 ? 'Article' : 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    keywords: post.tags.join(', '),
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: author.name, description: author.bio },
    publisher: {
      '@type': 'Organization',
      name: 'Hey Lola',
      logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` },
    },
  };

  const jsonLd: Record<string, unknown>[] = [articleSchema, personSchema({
    name: author.name, role: author.role, image: author.avatar || `${SITE}/og-image.png`,
    url: buildPath.blogArticle(post.slug), description: author.bio,
  })];
  if (post.faqs && post.faqs.length > 0) jsonLd.push(faqPageSchema(post.faqs));
  if (ranks.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: post.title,
      itemListElement: ranks.map((b) => ({ '@type': 'ListItem', position: b.n, name: b.name })),
    });
  }

  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="bg-white font-boutique text-charcoal">
      <SEO
        title={`${post.title} | Hey Lola`}
        description={description}
        url={buildPath.blogArticle(post.slug)}
        ogType="article"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: 'Hey Lola', item: '/' },
          { name: 'Journal', item: paths.blog },
          { name: post.title, item: buildPath.blogArticle(post.slug) },
        ]}
      />

      <article className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-16">
        <button
          type="button"
          onClick={() => navigate(paths.blog)}
          className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-8"
        >
          <ArrowLeft size={13} /> The Journal
        </button>

        {/* Hero */}
        <div className={`rounded-[1.75rem] bg-gradient-to-br ${post.accent} border border-stone-100 px-6 sm:px-10 py-10 sm:py-12 mb-8`}>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{post.category}</span>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif italic tracking-tight leading-[1.02] mt-3 mb-5"
          >
            {post.title}
          </motion.h1>
          <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug mb-6">{post.excerpt}</p>
          <AuthorByline authorId={post.authorId} date={post.date} readingMinutes={post.readingMinutes} />
        </div>

        {/* Body */}
        <div className="px-1 sm:px-2">
          {post.blocks.map((b, i) => <BlockView key={i} block={b} />)}
        </div>

        {/* FAQ */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-12 pt-8 border-t border-stone-100">
            <h2 className="text-2xl font-serif italic tracking-tight mb-5">Frequently asked<span className="brand-dot" aria-hidden="true" /></h2>
            <div className="space-y-5">
              {post.faqs.map((f, i) => (
                <div key={i}>
                  <p className="text-[15px] font-bold text-charcoal mb-1">{f.q}</p>
                  <p className="text-[15px] text-stone-600 font-light leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Author card */}
        <section className="mt-12 pt-8 border-t border-stone-100 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
            {author.avatar
              ? <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" loading="lazy" />
              : <span className="text-base font-serif italic text-stone-400">{author.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Written by</p>
            <p className="text-lg font-serif italic text-charcoal leading-tight">{author.name}</p>
            <p className="text-sm text-stone-500 font-light leading-relaxed mt-1">{author.bio}</p>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-stone-100">
            <h2 className="text-2xl font-serif italic tracking-tight mb-5">Keep reading<span className="brand-dot" aria-hidden="true" /></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => navigate(buildPath.blogArticle(p.slug))}
                  className="text-left rounded-2xl border border-stone-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">{p.category}</span>
                  <h3 className="text-base font-serif italic tracking-tight leading-snug mt-1.5 mb-2 group-hover:text-brand-orange transition-colors">{p.title}</h3>
                  <span className="text-[11px] font-bold text-charcoal inline-flex items-center gap-1">Read <ArrowRight size={11} /></span>
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
};
