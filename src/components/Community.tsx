import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Gift,
  Trophy,
  Heart,
  MessageSquare,
  Award,
  Users,
  Plus,
  Send,
  Loader2,
} from 'lucide-react';
import { COMMUNITY_GROUPS, CATEGORY_META, type CommunityGroup } from '../data/communityGroups';
import { SEO } from '../lib/seo';
import { useAuth } from '../lib/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { paths } from '../lib/routes';
import type { PetData } from '../types';

const COMMUNITY_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Community', item: '/community' },
];

interface CommunityProps {
  petName?: string;
  initialMode?: 'community' | 'support';
}

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  badge?: string;
  city?: string;
  body: string;
  spot?: string;
  likes: number;
  replies: number;
  timeAgo: string;
}

interface LeaderboardEntry {
  id: string;
  team: string;
  caption: string;
  avatar: string;
  checkins: number;
  trend: 'up' | 'steady';
}

const MIAMI_PACK_TAGLINE = "Join dog parents exploring Miami's best dog-friendly cafés, hotels, parks, and experiences.";

const COMMUNITY_CARDS = [
  {
    id: 'miami-pack',
    title: 'Miami Pack',
    description: MIAMI_PACK_TAGLINE,
    cta: 'Join Pack',
    icon: MapPin,
    accent: 'bg-[#F5F8FA] text-[#5D848C]',
    cover: 'bg-gradient-to-br from-[#F5F8FA] via-[#FBFCFD] to-white',
    badge: 'Live in Miami',
    href: `${paths.explore}?city=miami`,
  },
  {
    id: 'lolas-picks',
    title: "Lola's Picks",
    description: 'Weekly curated places hand-selected by Lola — chic cafés, dog-friendly hotels and corner tables that keep treats behind the counter.',
    cta: 'View Picks',
    icon: Sparkles,
    accent: 'bg-[#FDF8F6] text-[#C4622D]',
    cover: 'bg-gradient-to-br from-[#FDF8F6] via-[#FCF6F2] to-white',
    badge: 'Updated weekly',
    href: paths.explore,
  },
  {
    id: 'partner-perks',
    title: 'Partner Perks',
    description: 'Unlock perks from verified dog-friendly businesses — welcome treats, priority booking, member-only experiences.',
    cta: 'Explore Perks',
    icon: Gift,
    accent: 'bg-[#F7F9F5] text-[#6E8C5D]',
    cover: 'bg-gradient-to-br from-[#F7F9F5] via-[#FBFCF8] to-white',
    badge: 'Verified partners',
    href: paths.perks,
  },
  {
    id: 'challenges',
    title: 'Community Challenges',
    description: 'Check in at dog-friendly venues, collect badges and unlock seasonal experiences with your concierge.',
    cta: 'Start Challenge',
    icon: Trophy,
    accent: 'bg-[#FAF9F5] text-[#8C845D]',
    cover: 'bg-gradient-to-br from-[#FAF9F5] via-[#FDFCF9] to-white',
    badge: 'Season 01',
    href: paths.whatsOn,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [];

export const Community: React.FC<CommunityProps> = (_props) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
  const { user, profile } = useAuth();
  const [livePosts, setLivePosts] = useState<FeedPost[]>([]);
  const [latestMembers, setLatestMembers] = useState<PetData[]>([]);

  // Latest public pets — newest joiners surface as a horizontal
  // carousel of small fichas. Mirrors Dashboard's pets query so the
  // same Firestore rules apply: anonymous visitors get an empty list
  // (firestore rules require signed-in to list pets) and the
  // carousel section quietly hides.
  useEffect(() => {
    if (!user) { setLatestMembers([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'pets'),
          where('isPublic', '==', true),
          limit(50),
        ));
        if (cancelled) return;
        const pets = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as PetData))
          .filter((p) => !p.isHidden && p.userId !== user.uid)
          .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
          .slice(0, 12);
        setLatestMembers(pets);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'pets');
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Subscribe to the 50 most recent community posts. Falls back to the
  // seed feed silently when no real posts exist yet (so the page is
  // never empty at launch).
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
    const unsub = onSnapshot(q, (snap) => {
      const posts = snap.docs.map((d): FeedPost => {
        const data = d.data() as Record<string, unknown>;
        const createdAt = (data.createdAt as { toMillis?: () => number } | null)?.toMillis?.();
        return {
          id: d.id,
          author: String(data.author ?? 'Member'),
          handle: String(data.handle ?? ''),
          avatar: String(data.avatar ?? '/HeyLola.Lola.1.png'),
          badge: data.badge as string | undefined,
          city: data.city as string | undefined,
          body: String(data.body ?? ''),
          spot: data.spot as string | undefined,
          likes: Number(data.likes ?? 0),
          replies: Number(data.replies ?? 0),
          timeAgo: createdAt ? formatTimeAgo(createdAt) : 'just now',
        };
      });
      // Skip posts with empty body — usually leftover test docs from
      // before validation tightened in the composer.
      setLivePosts(posts.filter((p) => p.body.trim().length > 0));
    }, (err) => handleFirestoreError(err, OperationType.READ, 'posts'));
    return () => unsub();
  }, []);

  const feedPosts: FeedPost[] = livePosts;
  const sortedLeaderboard = useMemo(
    () => [...LEADERBOARD].sort((a, b) => b.checkins - a.checkins),
    [],
  );

  return (
    <div className="bg-white text-charcoal font-boutique min-h-screen">
      <SEO
        title="Hey Lola Community — Find Your Pack"
        description="Discover dog-friendly places, perks and city crews with other dog parents. Join Crew in Miami or NYC Vibes and share insights with the pack."
        url="/community"
        breadcrumbs={COMMUNITY_BREADCRUMBS}
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 sm:pt-10 pb-8 sm:pb-10 space-y-3"
        >
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
            Hey Lola Community
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-charcoal">
            Your concierge<br />
            <span className="text-stone-300">community</span><span className="brand-dot" aria-hidden="true" />
          </h1>
          <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-xl">
            Discover dog-friendly places, perks, and city packs with other dog parents.
          </p>
        </motion.header>

        {/* Latest members — newest pets to opt-in to a public profile.
            Horizontal carousel so the page reads as alive, not static. */}
        {latestMembers.length > 0 && (
          <section aria-labelledby="latest-members-heading" className="pb-10 sm:pb-12">
            <header className="flex items-end justify-between gap-4 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
                  <Users size={11} /> Latest members
                </span>
                <h2 id="latest-members-heading" className="text-2xl sm:text-3xl font-serif italic tracking-tight mt-1">
                  Just joined the pack<span className="brand-dot" aria-hidden="true" />
                </h2>
              </div>
            </header>
            <div className="-mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
              <ul className="flex gap-3 sm:gap-4 pb-2 snap-x snap-mandatory">
                {latestMembers.map((p) => (
                  <li
                    key={p.id}
                    className="snap-start shrink-0 w-[180px] sm:w-[200px] rounded-2xl bg-white border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-stone-50 overflow-hidden">
                      {p.photoURL ? (
                        <img
                          src={p.photoURL}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-serif italic text-stone-300 select-none">
                          {p.name?.[0]?.toUpperCase() || '🐾'}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-serif italic tracking-tight leading-none truncate">{p.name || 'New member'}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 truncate">
                        {p.breed || p.type}
                      </p>
                      {p.city && (
                        <p className="text-[10px] text-stone-500 font-light italic truncate inline-flex items-center gap-1">
                          <MapPin size={9} /> {p.city}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Groups — only surfaced to signed-in members. While we're
            curating the first packs we keep the section out of sight
            for anonymous visitors instead of teasing them with content
            they can't join. */}
        {user && (
          <section aria-labelledby="groups-heading" className="pb-12">
            <header className="flex items-end justify-between gap-4 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
                  <Users size={11} /> Groups for you
                </span>
                <h2 id="groups-heading" className="text-2xl sm:text-3xl font-serif italic tracking-tight mt-1">
                  Find your pack<span className="brand-dot" aria-hidden="true" />
                </h2>
              </div>
              <a
                href="mailto:hey@heylola.co?subject=Suggest%20a%20community%20group"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
              >
                <Plus size={11} /> Suggest a group
              </a>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {COMMUNITY_GROUPS.map((g, i) => (
                <GroupCard key={g.id} group={g} delay={i * 0.04} />
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-100 mb-8">
          <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={<MessageSquare size={13} />}>
            Latest posts
          </TabButton>
          <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy size={13} />}>
            Top explorers
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'feed' ? (
            <motion.section
              key="feed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-3 sm:space-y-4 pb-16"
            >
              <PostComposer user={user} profile={profile} />
              {feedPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center">
                  <p className="text-sm text-stone-500 italic">
                    No posts yet. Be the first to share an insight with the pack.
                  </p>
                </div>
              ) : (
                feedPosts.map((post) => (
                  <FeedItem key={post.id} post={post} user={user} profile={profile} />
                ))
              )}
            </motion.section>
          ) : (
            <motion.section
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-4 pb-16"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">This Week's Top Explorers</span>
                  <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight mt-1">Concierge leaderboard<span className="brand-dot" aria-hidden="true" /></h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Updates Sunday</span>
              </div>

              <ol className="space-y-2 sm:space-y-3">
                {sortedLeaderboard.map((entry, i) => (
                  <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} />
                ))}
              </ol>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface CardData {
  id: string;
  title: string;
  description: string;
  cta: string;
  icon: React.ComponentType<{ size?: number }>;
  accent: string;
  cover: string;
  badge?: string;
  /** Where the card's CTA leads. Internal React-Router path. */
  href: string;
}

function CommunityCard({ card, delay }: { card: CardData; delay: number }) {
  const Icon = card.icon;
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      onClick={() => navigate(card.href)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`group relative text-left rounded-[1.75rem] border border-stone-100 ${card.cover} p-6 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`w-11 h-11 rounded-2xl ${card.accent} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        {card.badge && (
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-stone-100">
            {card.badge}
          </span>
        )}
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-none text-charcoal">
          {card.title}
        </h3>
        <p className="text-sm text-stone-500 font-light leading-relaxed pr-2">
          {card.description}
        </p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-charcoal">
        {card.cta}
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
        active ? 'text-charcoal' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      {icon}
      {children}
      {active && (
        <motion.span layoutId="tab-underline" className="absolute -bottom-px left-0 right-0 h-px bg-charcoal" />
      )}
    </button>
  );
}

interface Reply {
  id: string;
  author: string;
  avatar: string;
  body: string;
  timeAgo: string;
}

export interface FeedAuthor {
  user: { uid: string; displayName?: string | null; photoURL?: string | null } | null | undefined;
  profile: { firstName?: string; lastName?: string; homeCity?: string; photoURL?: string; displayName?: string } | null | undefined;
}

export function FeedItem({ post, user, profile }: { post: FeedPost } & FeedAuthor) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  // Seed posts (string ids, no Firestore doc) can't load real replies.
  const isRealPost = !post.id.startsWith('silvia-');

  const toggle = async () => {
    setOpen((v) => !v);
    if (!loaded && isRealPost) {
      setLoaded(true);
      try {
        const snap = await getDocs(query(
          collection(db, 'posts', post.id, 'replies'),
          orderBy('createdAt', 'asc'),
          limit(50),
        ));
        const list = snap.docs.map((d): Reply => {
          const data = d.data() as Record<string, unknown>;
          const created = (data.createdAt as { toMillis?: () => number } | null)?.toMillis?.();
          return {
            id: d.id,
            author: String(data.author ?? 'Member'),
            avatar: String(data.avatar ?? ''),
            body: String(data.body ?? ''),
            timeAgo: created ? formatTimeAgo(created) : 'just now',
          };
        });
        setReplies(list);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'posts/replies');
      }
    }
  };

  const submitReply = async () => {
    if (!user) { navigate(paths.login); return; }
    const body = draft.trim();
    if (!body || sending || !isRealPost) return;
    setSending(true);
    const displayName = profile?.displayName
      ?? [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
      ?? user.displayName
      ?? 'Member';
    try {
      const docRef = await addDoc(collection(db, 'posts', post.id, 'replies'), {
        userId: user.uid,
        parentPostId: post.id,
        author: displayName,
        avatar: profile?.photoURL ?? user.photoURL ?? '',
        body,
        createdAt: serverTimestamp(),
      });
      setReplies((prev) => [...prev, { id: docRef.id, author: displayName, avatar: profile?.photoURL ?? user.photoURL ?? '', body, timeAgo: 'now' }]);
      setDraft('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'posts/replies');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[1.5rem] border border-stone-100 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-500"
    >
      <header className="flex items-start gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-50 border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
          {post.avatar
            ? <img src={post.avatar} alt={post.author} className="w-full h-full object-contain" />
            : <span className="text-xl font-serif italic text-stone-300">{post.author[0]?.toUpperCase() || '·'}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-serif italic text-charcoal">{post.author}</p>
            {post.handle && (
              <span className="text-[10px] text-stone-400">@{post.handle}</span>
            )}
            {post.badge && (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">
                {post.badge}
              </span>
            )}
            <span className="text-[10px] text-stone-400 font-medium">· {post.timeAgo}</span>
          </div>
          {post.city && (
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mt-1 inline-flex items-center gap-1">
              <MapPin size={9} /> {post.city}
            </p>
          )}
        </div>
      </header>

      <p className="text-sm sm:text-[15px] text-charcoal/90 leading-relaxed mt-4 whitespace-pre-wrap">{post.body}</p>

      {post.spot && (
        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-charcoal bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-full">
          <MapPin size={10} /> {post.spot}
        </div>
      )}

      <footer className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-5 text-stone-400">
        <button type="button" className="inline-flex items-center gap-2 text-[11px] font-medium hover:text-charcoal transition-colors">
          <Heart size={13} /> {post.likes}
        </button>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-2 text-[11px] font-medium hover:text-charcoal transition-colors"
        >
          <MessageSquare size={13} /> {open ? 'Hide' : 'Reply'} · {Math.max(post.replies, replies.length)}
        </button>
      </footer>

      {open && (
        <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-stone-100 space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                {r.avatar
                  ? <img src={r.avatar} alt={r.author} className="w-full h-full object-cover" />
                  : <span className="text-[10px] font-serif italic text-stone-300">{r.author[0]?.toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-xs font-serif italic text-charcoal">{r.author}</p>
                  <span className="text-[10px] text-stone-400">· {r.timeAgo}</span>
                </div>
                <p className="text-sm text-charcoal/85 leading-relaxed whitespace-pre-wrap mt-0.5">{r.body}</p>
              </div>
            </div>
          ))}

          {isRealPost ? (
            user ? (
              <div className="flex items-start gap-2 pt-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a reply…"
                  rows={2}
                  maxLength={500}
                  className="flex-1 bg-stone-50 rounded-xl px-3 py-2 text-xs leading-relaxed text-charcoal placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-200 resize-none"
                />
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!draft.trim() || sending}
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-charcoal text-white hover:bg-charcoal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send reply"
                >
                  {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate(paths.login)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
              >
                Sign in to reply
              </button>
            )
          ) : (
            <p className="text-[10px] text-stone-400 italic">Sample post — replies open once members start posting.</p>
          )}
        </div>
      )}
    </motion.article>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isTop = rank === 1;
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-4 rounded-2xl border p-3 sm:p-4 ${
        isTop ? 'bg-charcoal text-white border-charcoal shadow-xl' : 'bg-white border-stone-100 hover:shadow-md'
      } transition-shadow duration-500`}
    >
      <span className={`text-2xl sm:text-3xl font-serif italic w-10 text-center ${isTop ? 'text-white/70' : 'text-stone-300'}`}>
        {String(rank).padStart(2, '0')}
      </span>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center ${
        isTop ? 'bg-white/10' : 'bg-stone-50 border border-stone-100'
      }`}>
        <img src={entry.avatar} alt={entry.team} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm sm:text-base font-serif italic leading-none ${isTop ? 'text-white' : 'text-charcoal'}`}>{entry.team}</p>
        <p className={`text-[11px] mt-1 italic font-light ${isTop ? 'text-white/60' : 'text-stone-400'}`}>{entry.caption}</p>
      </div>
      <div className="text-right">
        <p className={`text-2xl font-serif italic leading-none ${isTop ? 'text-white' : 'text-charcoal'}`}>{entry.checkins}</p>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 inline-flex items-center gap-1 ${
          isTop ? 'text-white/60' : 'text-stone-400'
        }`}>
          <Award size={9} /> check-ins
        </p>
      </div>
    </motion.li>
  );
}


function GroupCard({ group, delay }: { group: CommunityGroup; delay: number }) {
  const meta = CATEGORY_META[group.category];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleJoin = async () => {
    if (!user) { navigate(paths.login); return; }
    if (busy || joined) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, 'group_memberships'), {
        userId: user.uid,
        groupId: group.id,
        groupName: group.name,
        joinedAt: serverTimestamp(),
      });
      setJoined(true);
      // Fire-and-forget welcome email. The server endpoint re-reads the
      // membership doc via Admin SDK (source of truth) so the client
      // can't forge a recipient by passing arbitrary fields.
      void fetch('/api/notify-group-join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ membershipId: ref.id }),
      }).catch(() => { /* email is best-effort, never block join */ });
      // Drop the user into the Reddit-style group room.
      navigate(`/community/${group.id}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'group_memberships');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-2xl border border-stone-100 bg-white p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3"
    >
      <header className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${meta.accent} mb-1`}>{meta.label}</p>
          <h3 className="text-xl font-serif italic leading-tight">{group.name}</h3>
        </div>
      </header>
      <p className="text-sm text-stone-500 font-light leading-relaxed">{group.description}</p>
      <footer className="flex items-center justify-between pt-1 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={10} /> {group.city} · {group.cadence}
        </span>
        <span className="inline-flex items-center gap-1.5 text-charcoal">
          <Users size={10} /> {group.members}
        </span>
      </footer>
      <button
        type="button"
        onClick={handleJoin}
        disabled={busy || joined}
        className="mt-2 inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {joined ? <>Joined <Award size={11} /></> : busy ? <><Loader2 size={11} className="animate-spin" /> Joining…</> : <>Join group <ArrowRight size={11} /></>}
      </button>
    </motion.article>
  );
}

/**
 * Format a millisecond timestamp as a compact "Xm / Xh / Xd / Xw" tag.
 * Mirrors the seed feed style so live + seeded posts read consistently.
 */
export function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

export interface PostComposerProps {
  user: { uid: string; displayName?: string | null; photoURL?: string | null } | null | undefined;
  profile: { firstName?: string; lastName?: string; homeCity?: string; photoURL?: string; displayName?: string } | null | undefined;
  /** Extra fields stamped on every post created from this composer.
   *  Used by the group rooms (/community/:groupId) to scope posts. */
  extraFields?: Record<string, string>;
  /** Override the default textarea placeholder. */
  placeholder?: string;
}

/**
 * Free-form post composer. Writes to posts/{auto-id} so the
 * onSnapshot subscription in Community surfaces the new post live for
 * every viewer. Anonymous visitors see a sign-in prompt instead of the
 * textarea — we don't allow unauthenticated writes.
 */
export function PostComposer({ user, profile, extraFields, placeholder }: PostComposerProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  if (!user) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-4 sm:p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-stone-500 italic">Sign in to share an insight with the pack.</p>
        <button
          type="button"
          onClick={() => navigate(paths.login)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  const displayName = profile?.displayName
    ?? [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    ?? user.displayName
    ?? 'Member';

  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        author: displayName,
        handle: '',
        avatar: profile?.photoURL ?? user.photoURL ?? '',
        body,
        city: profile?.homeCity ?? '',
        likes: 0,
        replies: 0,
        createdAt: serverTimestamp(),
        ...(extraFields ?? {}),
      });
      setDraft('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'posts');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 sm:p-5 space-y-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder ?? `What's on with you and your pack, ${displayName.split(' ')[0]}?`}
        rows={3}
        maxLength={500}
        className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm leading-relaxed text-charcoal placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-200 resize-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-stone-400 font-light">{draft.length} / 500</span>
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || sending}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
          Post
        </button>
      </div>
    </div>
  );
}
