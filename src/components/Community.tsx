import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { CONCIERGES, conciergePose } from '../data/concierges';

interface CommunityProps {
  petName?: string;
  initialMode?: 'community' | 'support';
}

interface FeedPost {
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
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lola-silvia',
    team: 'Lola & Silvia',
    caption: 'Concierge crew · Miami',
    avatar: conciergePose('lola', 1),
    checkins: 32,
    trend: 'up',
  },
  {
    id: 'bruno-crew',
    team: "Bruno's Crew",
    caption: 'Wynwood & Downtown · Miami',
    avatar: conciergePose('bruno', 1),
    checkins: 27,
    trend: 'up',
  },
  {
    id: 'milo-club',
    team: 'Milo Trail Club',
    caption: 'Family weekends · Miami',
    avatar: conciergePose('milo', 1),
    checkins: 24,
    trend: 'steady',
  },
  {
    id: 'nuc-city-pack',
    team: 'Nuc City Pack',
    caption: 'Beach + road trips · Miami',
    avatar: conciergePose('nuc', 1),
    checkins: 21,
    trend: 'up',
  },
];

const SEED_FEED: FeedPost[] = [
  {
    id: 'silvia-1',
    author: 'Silvia & Lola',
    handle: 'silviamogas',
    avatar: conciergePose('lola', 2),
    badge: 'Founder',
    city: 'Miami',
    body: "Brunch at Pura Vida Brickell with Lola today — they brought a bowl of water before we even sat down. Filing this one under 'corner-table material'.",
    spot: 'Pura Vida Brickell',
    likes: 18,
    replies: 4,
    timeAgo: '2h',
  },
  {
    id: 'silvia-2',
    author: 'Silvia & Bruno',
    handle: 'silviamogas',
    avatar: conciergePose('bruno', 3),
    badge: 'Concierge crew',
    city: 'Miami',
    body: 'Bruno tip: weekday afternoons at Wynwood Walls are blissfully quiet — perfect for slow walks before the rooftop crowd kicks in.',
    spot: 'Wynwood Walls',
    likes: 12,
    replies: 2,
    timeAgo: '6h',
  },
  {
    id: 'silvia-3',
    author: 'Silvia & Milo',
    handle: 'silviamogas',
    avatar: conciergePose('milo', 4),
    badge: 'Community',
    city: 'Miami',
    body: 'Milo says the new dog meet-up on Sunday at Margaret Pace Park has the friendliest pack so far. Anyone joining next week?',
    spot: 'Margaret Pace Park',
    likes: 9,
    replies: 5,
    timeAgo: '1d',
  },
  {
    id: 'silvia-4',
    author: 'Silvia & Nuc',
    handle: 'silviamogas',
    avatar: conciergePose('nuc', 5),
    badge: 'Adventures',
    city: 'Miami → Key Biscayne',
    body: 'Day trip with Nuc to Hobie Beach. Tide was calm, the dog-friendly stretch is bigger than I remembered. Bring a towel — and a flat white from Vice City Coffee on the way back.',
    spot: 'Hobie Beach',
    likes: 21,
    replies: 7,
    timeAgo: '2d',
  },
];

export const Community: React.FC<CommunityProps> = (_props) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
  const sortedLeaderboard = useMemo(
    () => [...LEADERBOARD].sort((a, b) => b.checkins - a.checkins),
    [],
  );

  return (
    <div className="bg-white text-charcoal font-boutique min-h-screen">
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
            <span className="text-stone-300">community</span><span className="text-brand-orange">.</span>
          </h1>
          <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-xl">
            Discover dog-friendly places, perks, and city packs with other dog parents.
          </p>
        </motion.header>

        {/* Main cards grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pb-10 sm:pb-12">
          {COMMUNITY_CARDS.map((card, i) => (
            <CommunityCard key={card.id} card={card} delay={i * 0.08} />
          ))}
        </section>

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
              {SEED_FEED.map((post) => (
                <FeedItem key={post.id} post={post} />
              ))}
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
                  <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight mt-1">Concierge leaderboard<span className="text-brand-orange">.</span></h2>
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
}

function CommunityCard({ card, delay }: { card: CardData; delay: number }) {
  const Icon = card.icon;
  return (
    <motion.button
      type="button"
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

function FeedItem({ post }: { post: FeedPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[1.5rem] border border-stone-100 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-500"
    >
      <header className="flex items-start gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-50 border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
          <img src={post.avatar} alt={post.author} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-serif italic text-charcoal">{post.author}</p>
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

      <p className="text-sm sm:text-[15px] text-charcoal/90 leading-relaxed mt-4">{post.body}</p>

      {post.spot && (
        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-charcoal bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-full">
          <MapPin size={10} /> {post.spot}
        </div>
      )}

      <footer className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-5 text-stone-400">
        <button type="button" className="inline-flex items-center gap-2 text-[11px] font-medium hover:text-charcoal transition-colors">
          <Heart size={13} /> {post.likes}
        </button>
        <button type="button" className="inline-flex items-center gap-2 text-[11px] font-medium hover:text-charcoal transition-colors">
          <MessageSquare size={13} /> {post.replies}
        </button>
      </footer>
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
