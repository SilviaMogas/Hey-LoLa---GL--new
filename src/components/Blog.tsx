import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { SEO } from '../lib/seo';
import { AUTHORS, getAllPosts, type AuthorId } from '../data/blog';
import { paths, buildPath } from '../lib/routes';

const SITE = 'https://heylola.co';

type Filter = 'all' | AuthorId;

export const Blog: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const posts = useMemo(() => getAllPosts(), []);
  const visible = useMemo(
    () => (filter === 'all' ? posts : posts.filter((p) => p.authorId === filter)),
    [posts, filter],
  );

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The Hey Lola Journal',
    description: 'Travel, dogs, lifestyle and the brands shaping modern pet care — from the Hey Lola team.',
    url: `${SITE}${paths.blog}`,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      author: { '@type': 'Person', name: AUTHORS[p.authorId].name },
      url: `${SITE}${buildPath.blogArticle(p.slug)}`,
    })),
  };

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'silvia', label: AUTHORS.silvia.name },
    { id: 'eva', label: AUTHORS.eva.name },
  ];

  return (
    <main className="bg-white font-boutique text-charcoal max-w-7xl mx-auto px-4 sm:px-6 min-h-[70vh] pb-16">
      <SEO
        title="The Hey Lola Journal — Dog Travel, Lifestyle & Brands"
        description="Guides and rankings on travelling with dogs, the modern pet-parent lifestyle, and the best premium dog brands — written by the Hey Lola team."
        url={paths.blog}
        jsonLd={blogSchema}
        breadcrumbs={[{ name: 'Hey Lola', item: '/' }, { name: 'Journal', item: paths.blog }]}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 pt-2">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.35em] text-stone-300 hover:text-charcoal transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-charcoal group-hover:border-charcoal group-hover:text-white transition-all duration-500">
            <ArrowLeft size={13} />
          </span>
          Home
        </button>
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter">
            The <span className="text-stone-300">Journal</span><span className="brand-dot" aria-hidden="true" />
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 mt-1">Stories, Guides & Rankings</p>
        </div>
      </div>

      {/* Author filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const active = filter === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              aria-pressed={active}
              className={`whitespace-nowrap rounded-full px-4 h-9 inline-flex items-center text-[11px] font-bold tracking-wide transition-all border ${
                active ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-stone-600 border-stone-200 hover:border-charcoal/40'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
        {visible.map((p, i) => {
          const author = AUTHORS[p.authorId];
          const formatted = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return (
            <motion.button
              key={p.slug}
              type="button"
              onClick={() => navigate(buildPath.blogArticle(p.slug))}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="text-left rounded-[1.5rem] border border-stone-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group bg-white h-full"
            >
              <div className={`bg-gradient-to-br ${p.accent} px-6 pt-6 pb-5 border-b border-stone-100`}>
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">{p.category}</span>
                <h2 className="text-xl font-serif italic tracking-tight leading-snug mt-2 group-hover:text-brand-orange transition-colors">{p.title}</h2>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-stone-500 font-light leading-relaxed flex-1">{p.excerpt}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-50">
                  <span className="text-[11px] text-stone-400 font-light">
                    {author.name} · {formatted}
                  </span>
                  <span className="text-[11px] text-stone-400 font-light inline-flex items-center gap-1">
                    <Clock size={10} /> {p.readingMinutes} min
                  </span>
                </div>
                <span className="text-[11px] font-bold text-charcoal inline-flex items-center gap-1 mt-3 group-hover:gap-2 transition-all">
                  Read article <ArrowRight size={12} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
};
