import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { COMMUNITY_GROUPS } from '../data/communityGroups';
import { paths } from '../lib/routes';
import { SEO } from '../lib/seo';
import {
  FeedItem,
  PostComposer,
  EmptyFeedState,
  mapPostSnapshot,
  type FeedPost,
  type PostComposerProps,
} from './Community';

/**
 * Dedicated Reddit-style room for a single community group. URL is
 * /community/{groupId} (mia-pack, nyc-pack). All posts on this page
 * are scoped to that group via posts.groupId so each pack has its
 * own conversation thread.
 *
 * The PostComposer is the one exported from Community.tsx — extended
 * here to stamp groupId on every submission via the `extraFields`
 * passthrough (added in the same change set).
 */
export const CommunityGroup: React.FC = () => {
  const { groupId = '' } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [livePosts, setLivePosts] = useState<FeedPost[]>([]);

  const group = COMMUNITY_GROUPS.find((g) => g.id === groupId);

  // Subscribe to posts scoped to this group.
  useEffect(() => {
    if (!groupId) return;
    const q = query(
      collection(db, 'posts'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc'),
      limit(100),
    );
    const unsub = onSnapshot(q,
      (snap) => setLivePosts(mapPostSnapshot(snap)),
      (err) => handleFirestoreError(err, OperationType.READ, 'posts'),
    );
    return () => unsub();
  }, [groupId]);

  // Unknown group id → bounce back to /community.
  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center font-boutique">
        <h1 className="text-3xl font-serif italic tracking-tight">Group not found<span className="brand-dot" aria-hidden="true" /></h1>
        <button
          type="button"
          onClick={() => navigate(paths.community)}
          className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={11} /> Back to community
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-charcoal font-boutique min-h-screen">
      <SEO
        title={`${group.name} — Hey Lola Community`}
        description={group.description}
        url={`/community/${group.id}`}
        breadcrumbs={[
          { name: 'Hey Lola', item: '/' },
          { name: 'Community', item: '/community' },
          { name: group.name, item: `/community/${group.id}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 sm:pt-10 pb-6 sm:pb-8 space-y-4"
        >
          <button
            type="button"
            onClick={() => navigate(paths.community)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={11} /> Back to community
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <Users size={11} /> Pack
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif italic tracking-tight leading-[0.95]">
              {group.name}<span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-sm sm:text-base text-stone-500 font-light italic leading-snug max-w-2xl">
              {group.description}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 inline-flex items-center gap-2 pt-1">
              <MapPin size={10} /> {group.city} · {group.cadence}
            </p>
          </div>
        </motion.header>

        {/* Composer + thread */}
        <section className="space-y-3 sm:space-y-4 pb-16">
          <PostComposer
            user={user}
            profile={profile}
            extraFields={{ groupId: group.id, groupName: group.name }}
            placeholder={`Share something with the ${group.name}…`}
          />
          {livePosts.length === 0 ? (
            <EmptyFeedState message="No posts in this pack yet. Be the first." />
          ) : (
            livePosts.map((post) => (
              <FeedItem key={post.id} post={post} user={user} profile={profile as PostComposerProps['profile']} />
            ))
          )}
        </section>
      </div>
    </div>
  );
};
