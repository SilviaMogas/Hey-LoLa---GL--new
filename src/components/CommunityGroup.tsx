import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock, MapPin, Users } from 'lucide-react';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { isAdminEmail } from '../lib/admin';
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

/** A signed-in human who has joined this group. Rendered from the
 *  denormalised display fields stamped on the membership doc at join
 *  time (see GroupCard.handleJoin) so we never read private /users docs. */
interface GroupMember {
  id: string;
  userId: string;
  name: string;
  photo: string;
  city?: string;
}

/**
 * Dedicated Reddit-style room for a single community group. URL is
 * /community/{groupId} (mia-pack, nyc-pack, bcn-pack, founders-circle).
 *
 * Inside the room conversations are organised into TOPICS (group.subtopics)
 * — the first is always "Presentations" so members introduce themselves.
 * Selecting a topic filters the thread and tags any new post with that
 * topic via the PostComposer `extraFields` passthrough.
 *
 * Founder-only rooms (access === 'founder') are gated to Founding Members
 * and admins; everyone else is shown a soft lock with a route to the club.
 */
export const CommunityGroup: React.FC = () => {
  const { groupId = '' } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [livePosts, setLivePosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const group = COMMUNITY_GROUPS.find((g) => g.id === groupId);

  // Topics for this room. "Presentations" lives at the front (data already
  // orders it first); we always guarantee at least one topic exists.
  const topics = useMemo(
    () => (group?.subtopics && group.subtopics.length > 0 ? group.subtopics : ['Presentations']),
    [group],
  );
  const [activeTopic, setActiveTopic] = useState<string>(topics[0]);

  // Keep the active topic valid if the group changes.
  useEffect(() => { setActiveTopic(topics[0]); }, [topics]);

  // Closed group → only Founding Members and admins may enter.
  const locked = group?.access === 'founder'
    && !profile?.foundingMember
    && !isAdminEmail(user?.email);

  // Subscribe to posts scoped to this group.
  useEffect(() => {
    if (!groupId || locked) return;
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
  }, [groupId, locked]);

  // Load the group's human members (best-effort — falls back to empty on
  // rule errors). Membership docs carry safe display fields stamped at join.
  useEffect(() => {
    if (!groupId || locked || !user) { setMembers([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'group_memberships'),
          where('groupId', '==', groupId),
          limit(200),
        ));
        if (cancelled) return;
        const seen = new Set<string>();
        const list = snap.docs
          .map((d): GroupMember => {
            const data = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              userId: String(data.userId ?? ''),
              name: String(data.userName ?? 'Member'),
              photo: String(data.userPhoto ?? ''),
              city: (data.userCity as string | undefined) || undefined,
            };
          })
          // De-dupe by user in case of legacy double-joins.
          .filter((m) => {
            if (!m.userId || seen.has(m.userId)) return false;
            seen.add(m.userId);
            return true;
          });
        setMembers(list);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'group_memberships');
      }
    })();
    return () => { cancelled = true; };
  }, [groupId, locked, user]);

  // Reflect existing membership so the header shows Join vs Joined.
  useEffect(() => {
    if (!user || !groupId || locked) { setJoined(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'group_memberships'),
          where('userId', '==', user.uid),
          where('groupId', '==', groupId),
          limit(1),
        ));
        if (!cancelled) setJoined(!snap.empty);
      } catch { /* best effort */ }
    })();
    return () => { cancelled = true; };
  }, [user, groupId, locked]);

  const handleJoin = async () => {
    if (!group) return;
    if (!user) { navigate(paths.login); return; }
    if (joining || joined) return;
    setJoining(true);
    const memberName = profile?.displayName
      || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
      || user.displayName || 'Member';
    try {
      const ref = await addDoc(collection(db, 'group_memberships'), {
        userId: user.uid,
        groupId: group.id,
        groupName: group.name,
        userName: memberName,
        userPhoto: profile?.photoURL ?? user.photoURL ?? '',
        userCity: profile?.localHub ?? profile?.homeCity ?? '',
        joinedAt: serverTimestamp(),
      });
      setJoined(true);
      void fetch('/api/notify-group-join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ membershipId: ref.id }),
      }).catch(() => { /* email best-effort */ });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'group_memberships');
    } finally {
      setJoining(false);
    }
  };

  // Posts shown for the active topic. Untagged/legacy posts bucket into the
  // first topic ("Presentations") so nothing disappears. Founder welcome
  // posts are real Firestore docs (seeded via scripts/seed_community_posts.mjs)
  // so they appear here like any other post and can be replied to.
  const visiblePosts = useMemo(
    () => livePosts.filter((p) => (p.topic ?? topics[0]) === activeTopic),
    [livePosts, activeTopic, topics],
  );

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
              {group.access === 'founder' ? <><Lock size={11} /> Founders' Circle</> : <><Users size={11} /> Pack</>}
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
            {!locked && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joining || joined}
                  className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
                    joined
                      ? 'bg-[#6E8C5D]/10 text-[#6E8C5D] cursor-default'
                      : 'bg-charcoal text-white hover:bg-charcoal/80'
                  } disabled:opacity-70`}
                >
                  {joining ? 'Joining…' : joined ? '✓ Joined' : <>Join {group.name}</>}
                </button>
              </div>
            )}
          </div>
        </motion.header>

        {locked ? (
          /* Soft lock for non-founders. */
          <section className="pb-20">
            <div className="rounded-[1.5rem] border border-stone-100 bg-stone-50/60 p-8 sm:p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-charcoal text-white flex items-center justify-center">
                <Lock size={18} />
              </div>
              <h2 className="text-2xl font-serif italic tracking-tight">A private space for Founding Members<span className="brand-dot" aria-hidden="true" /></h2>
              <p className="text-sm text-stone-500 font-light italic max-w-md mx-auto leading-relaxed">
                The Founders' Circle is reserved for Hey Lola Founding Members. Become one to shape the roadmap and unlock exclusive perks.
              </p>
              <button
                type="button"
                onClick={() => navigate(paths.club)}
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors"
              >
                Become a Founding Member <ArrowRight size={11} />
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Members — the humans in this group. */}
            {members.length > 0 && (
              <section aria-labelledby="members-heading" className="pb-6 sm:pb-8">
                <header className="flex items-center gap-2 mb-3">
                  <span id="members-heading" className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
                    <Users size={11} /> {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </header>
                <div className="-mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
                  <ul className="flex gap-3 pb-1">
                    {members.map((m) => (
                      <li key={m.id} className="shrink-0 flex flex-col items-center gap-1.5 w-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center">
                          {m.photo
                            ? <img src={m.photo} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                            : <span className="text-base font-serif italic text-stone-300">{m.name[0]?.toUpperCase() || '·'}</span>}
                        </div>
                        <span className="text-[10px] text-stone-500 font-light leading-tight truncate w-full">{m.name.split(' ')[0]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Topics — pretty, accessible filter bar. "Presentations" leads. */}
            <nav aria-label="Topics" className="pb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-2.5">Topics</p>
              <div className="-mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
                <ul className="flex gap-2">
                  {topics.map((t) => {
                    const active = t === activeTopic;
                    const count = livePosts.filter((p) => (p.topic ?? topics[0]) === t).length;
                    return (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() => setActiveTopic(t)}
                          aria-pressed={active}
                          className={`whitespace-nowrap rounded-full pl-4 pr-3 h-9 inline-flex items-center gap-2 text-[11px] font-bold tracking-wide transition-all border ${
                            active
                              ? 'bg-charcoal text-white border-charcoal shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-charcoal/40 hover:text-charcoal'
                          }`}
                        >
                          {t}
                          {count > 0 && (
                            <span className={`text-[10px] font-black rounded-full px-1.5 min-w-[18px] text-center ${active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>

            {/* Composer + thread for the active topic. */}
            <section className="space-y-3 sm:space-y-4 pb-16">
              <PostComposer
                user={user}
                profile={profile as PostComposerProps['profile']}
                extraFields={{ groupId: group.id, groupName: group.name, topic: activeTopic }}
                placeholder={
                  activeTopic === 'Presentations'
                    ? `Introduce yourself to the ${group.name}…`
                    : `Share something in ${activeTopic}…`
                }
              />
              {visiblePosts.length === 0 ? (
                <EmptyFeedState
                  message={
                    activeTopic === 'Presentations'
                      ? 'No introductions yet. Be the first to say hello.'
                      : `No posts in ${activeTopic} yet. Start the conversation.`
                  }
                />
              ) : (
                visiblePosts.map((post) => (
                  <FeedItem key={post.id} post={post} user={user} profile={profile as PostComposerProps['profile']} />
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};
