import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, Clock, User, Share2, Loader2 } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';

interface BlogPost {
  id?: string;
  title: string;
  location: string;
  tag: string;
  author: string;
  date: string;
  content: string;
  image: string;
}

export const Blog: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'dogs' | 'cats' | 'more'>('all');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BlogPost));
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'dogs') return post.tag?.toLowerCase() === 'dogs';
    if (filter === 'cats') return post.tag?.toLowerCase() === 'cats';
    if (filter === 'more') return !['dogs', 'cats'].includes(post.tag?.toLowerCase());
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60vh]">
      {/* Back navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={selectedPost ? () => setSelectedPost(null) : onBack}
          className="group flex items-center gap-3 text-[10px] font-black font-sans uppercase tracking-[0.35em] text-stone-300 hover:text-charcoal transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-charcoal group-hover:border-charcoal group-hover:text-white transition-all duration-500">
            <ArrowLeft size={13} />
          </span>
          {selectedPost ? 'Back to Journal' : 'Back to Home'}
        </button>

        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter">
            The <span className="text-stone-300">Journal</span><span className="text-brand-orange">.</span>
          </h1>
          <p className="text-[9px] font-black font-sans uppercase tracking-[0.4em] text-stone-300 mt-1">Stories & Guides</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-stone-300">
          <Loader2 size={40} className="animate-spin text-stone-400" />
          <p className="font-black font-sans uppercase tracking-[0.35em] text-[9px]">Loading Stories…</p>
        </div>
      ) : !selectedPost ? (
        <>
          {/* Category filter */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: t.blog.exploreAll },
              { id: 'dogs', label: t.blog.categoryDogs },
              { id: 'cats', label: t.blog.categoryCats },
              { id: 'more', label: t.blog.categoryMore }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`whitespace-nowrap px-6 sm:px-8 py-3 rounded-full text-[9px] sm:text-[10px] font-black font-sans uppercase tracking-[0.25em] transition-all duration-300 border ${
                  filter === cat.id
                    ? 'bg-charcoal text-white border-charcoal shadow-lg'
                    : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200 hover:text-charcoal'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-stone-50 rounded-[2rem] flex items-center justify-center mx-auto text-stone-200">
                <span className="text-3xl">📖</span>
              </div>
              <p className="text-stone-300 font-black font-sans uppercase tracking-[0.35em] text-[9px]">
                No stories in this category yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6">
              {filteredPosts.map((post, i) => (
                <motion.article
                  key={post.id || i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setSelectedPost(post)}
                  className="luxury-card group cursor-pointer overflow-hidden"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-charcoal/80 backdrop-blur-sm text-white text-[8px] font-black font-sans px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
                        {post.location}
                      </span>
                      <span className="bg-white/90 backdrop-blur-sm text-charcoal text-[8px] font-black font-sans px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
                        {post.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-5">
                    <h4 className="text-lg font-black italic leading-tight tracking-tight line-clamp-2 group-hover:text-charcoal transition-colors duration-300">
                      {post.title}
                    </h4>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-50/60 flex items-center justify-center text-stone-400">
                          <User size={11} />
                        </div>
                        <span className="text-[9px] font-black font-sans uppercase tracking-[0.2em] text-stone-300">
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black font-sans text-stone-200 uppercase tracking-[0.2em]">
                        <Clock size={11} /> 5 min
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-8 pb-10"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-stone-500 font-black font-sans uppercase tracking-[0.35em] text-[9px]">{selectedPost.tag}</span>
              <span className="w-1 h-1 rounded-full bg-stone-200" />
              <span className="text-stone-300 font-black font-sans uppercase tracking-[0.35em] text-[9px]">{selectedPost.date}</span>
            </div>
            <h2 className="text-4xl sm:text-4xl font-black italic tracking-tighter leading-[0.9]">
              {selectedPost.title}
            </h2>
            <div className="flex items-center gap-4 pt-6 border-t border-stone-100">
              <div className="w-10 h-10 rounded-full bg-stone-50/60 flex items-center justify-center font-black text-stone-400 border border-stone-100">
                {selectedPost.author[0]}
              </div>
              <div>
                <p className="text-[9px] font-black font-sans uppercase tracking-[0.35em] text-stone-300 leading-none mb-1">Written by</p>
                <p className="text-sm font-black italic text-charcoal">{selectedPost.author}</p>
              </div>
              <button className="ml-auto p-3 bg-stone-50 rounded-full hover:bg-charcoal hover:text-white transition-all duration-500 border border-stone-100 text-stone-400">
                <Share2 size={15} />
              </button>
            </div>
          </div>

          <img
            src={selectedPost.image}
            alt={selectedPost.title}
            className="w-full aspect-[16/9] object-cover rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.08)]"
          />

          <div className="space-y-8">
            <p className="text-stone-500 font-serif leading-relaxed italic text-xl border-l-4 border-stone-200 pl-6">
              "{selectedPost.content.substring(0, 120)}…"
            </p>
            <div className="space-y-5 text-charcoal/75 font-medium leading-[1.85] text-base">
              <p>{selectedPost.content}</p>
              <p>
                As <span className="font-black italic text-charcoal">HeyLola<span className="text-brand-orange">.</span></span> continues to expand, our goal is to deliver real-time, community-sourced tips directly into your pocket — because travelling with your companion should feel effortless, not stressful.
              </p>
              <p>Check back next week for our deep dive into the best dog-friendly hotels in the Lower East Side.</p>
            </div>
          </div>

          <div className="pt-12 border-t border-stone-100 text-center space-y-6">
            <h3 className="text-2xl font-black italic tracking-tighter">Enjoyed this story?</h3>
            <button
              onClick={() => setSelectedPost(null)}
              className="luxury-button-primary h-14 px-12 text-[10px] tracking-[0.3em]"
            >
              Back to Journal
            </button>
          </div>
        </motion.article>
      )}
    </div>
  );
};
