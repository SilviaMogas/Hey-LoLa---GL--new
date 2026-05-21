import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Clock, Heart, Loader2, MapPin, PawPrint, Send, UserPlus, Users } from 'lucide-react';
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { COMMUNITY_GROUPS } from '../data/communityGroups';
import { paths, buildPath } from '../lib/routes';
import { SEO } from '../lib/seo';
import type { Activity } from '../types';
import type { PetPublicCard } from '../lib/petPublic';
import {
  sendConnectionRequest,
  listConnections,
  acceptConnection,
  pairState,
  type ConnectionDoc,
} from '../lib/connections';

/** Human-friendly labels for the lifestyle activity codes. */
const ACTIVITY_LABEL: Record<Activity, string> = {
  parks: 'Parks', beach: 'Beach', hiking: 'Hiking', swimming: 'Swimming',
  cafes: 'Cafés', travel: 'Travel', boarding: 'Boarding', daycare: 'Daycare',
  training: 'Training', dating: 'Playdates', rural: 'Countryside', urban: 'City life',
};

interface PetGroup { id: string; name: string; emoji?: string }

/**
 * Public pet profile — /pet/:petId. Renders ONLY safe, non-confidential
 * data from the pet_public/{petId} mirror (never the private /pets doc):
 * who the pet is, where they live, what they like, the groups they're in,
 * and their furry parent's ficha. Owners/admins can preview their own
 * private pets via a /pets fallback even before the mirror is public.
 */
export const PetProfile: React.FC = () => {
  const { petId = '' } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [card, setCard] = useState<PetPublicCard | null>(null);
  const [groups, setGroups] = useState<PetGroup[]>([]);
  const [loading, setLoading] = useState(true);
  // Connection (LinkedIn-style) state with the furry parent.
  const [conns, setConns] = useState<ConnectionDoc[]>([]);
  const [connOpen, setConnOpen] = useState(false);
  const [connMsg, setConnMsg] = useState('');
  const [connBusy, setConnBusy] = useState(false);

  // Load the public card; fall back to the private pet doc for the owner.
  useEffect(() => {
    if (!petId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pet_public', petId));
        if (!cancelled && snap.exists()) {
          setCard({ petId: snap.id, ...(snap.data() as Omit<PetPublicCard, 'petId'>) });
          setLoading(false);
          return;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'pet_public');
      }
      // Fallback: owner/admin can read their own /pets doc directly.
      try {
        const petSnap = await getDoc(doc(db, 'pets', petId));
        if (!cancelled && petSnap.exists()) {
          const p = petSnap.data() as Record<string, unknown>;
          setCard({
            petId,
            ownerId: String(p.userId ?? ''),
            name: String(p.name ?? ''),
            type: (p.type as PetPublicCard['type']) ?? 'Dog',
            sex: p.sex as PetPublicCard['sex'],
            breed: p.breed as string | undefined,
            photoURL: p.photoURL as string | undefined,
            city: p.city as string | undefined,
            activities: p.activities as Activity[] | undefined,
            hobbies: p.hobbies as string | undefined,
            isPublic: p.isPublic !== false,
            isHidden: p.isHidden === true,
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'pets');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [petId]);

  // Groups the furry parent belongs to (best-effort, signed-in only —
  // group_memberships listing requires auth).
  useEffect(() => {
    const ownerId = card?.ownerId;
    if (!ownerId || !user) { setGroups([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'group_memberships'),
          where('userId', '==', ownerId),
          limit(50),
        ));
        if (cancelled) return;
        const seen = new Set<string>();
        const list = snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          const gid = String(data.groupId ?? '');
          const meta = COMMUNITY_GROUPS.find((g) => g.id === gid);
          return { id: gid, name: meta?.name ?? String(data.groupName ?? gid), emoji: meta?.emoji };
        }).filter((g) => g.id && !seen.has(g.id) && seen.add(g.id));
        setGroups(list);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'group_memberships');
      }
    })();
    return () => { cancelled = true; };
  }, [card?.ownerId, user]);

  // Load my connection state with this furry parent.
  useEffect(() => {
    const ownerId = card?.ownerId;
    if (!user || !ownerId || ownerId === user.uid) { setConns([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = await listConnections(user.uid);
        if (!cancelled) setConns(list);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'connections');
      }
    })();
    return () => { cancelled = true; };
  }, [card?.ownerId, user]);

  const viewerName = profile?.displayName
    || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    || user?.displayName || 'Member';

  const sendRequest = async () => {
    if (!user || !card?.ownerId || connBusy) return;
    const msg = connMsg.trim();
    if (!msg) return;
    setConnBusy(true);
    const ownerId = card.ownerId;
    try {
      const id = await sendConnectionRequest({
        fromUid: user.uid,
        fromName: viewerName,
        fromPhoto: profile?.photoURL ?? user.photoURL ?? '',
        toUid: ownerId,
        toName: card.ownerName,
        message: msg,
      });
      setConns((prev) => [...prev, {
        id, fromUid: user.uid, toUid: ownerId, fromName: viewerName,
        message: msg, status: 'pending', participants: [user.uid, ownerId],
      }]);
      setConnOpen(false);
      setConnMsg('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'connections');
    } finally {
      setConnBusy(false);
    }
  };

  const acceptIncoming = async (id: string) => {
    setConnBusy(true);
    try {
      await acceptConnection(id);
      setConns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'accepted' } : c)));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'connections');
    } finally {
      setConnBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-20 text-center font-boutique">
        <PawPrint size={28} className="mx-auto text-stone-300 animate-pulse" />
      </div>
    );
  }

  // Not found OR hidden/private → soft empty state.
  if (!card || card.isHidden || (card.isPublic === false && card.ownerId !== user?.uid)) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 text-center font-boutique">
        <h1 className="text-3xl font-serif italic tracking-tight">This profile is private<span className="brand-dot" aria-hidden="true" /></h1>
        <p className="mt-3 text-sm text-stone-500 font-light italic">This pet doesn't have a public profile yet.</p>
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

  const subtitle = [card.breed, card.sex].filter(Boolean).join(' · ');
  // Pronoun for the "Meet ___" eyebrow, from the pet's sex.
  const pronoun = card.sex === 'Male' ? 'him' : card.sex === 'Female' ? 'her' : 'them';
  // Connection state with the furry parent (only when signed in & not self).
  const canConnect = !!user && !!card.ownerId && card.ownerId !== user.uid;
  const connState = canConnect
    ? pairState(conns, user!.uid, card.ownerId)
    : { state: 'none' as const, doc: undefined };

  return (
    <div className="bg-white text-charcoal font-boutique min-h-screen">
      <SEO
        title={`${card.name} — Hey Lola`}
        description={`Meet ${card.name}${card.city ? ` from ${card.city}` : ''} on Hey Lola.`}
        url={`/pet/${card.petId}`}
      />
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={11} /> Back
        </button>

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pt-6 pb-8 flex flex-col items-center text-center gap-4"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            {card.photoURL
              ? <img src={card.photoURL} alt={card.name} className="w-full h-full object-cover" />
              : <span className="text-5xl font-serif italic text-stone-300">{card.name[0]?.toUpperCase() || '🐾'}</span>}
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
              Meet {pronoun}
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif italic tracking-tight leading-[0.95]">
              {card.name}<span className="brand-dot" aria-hidden="true" />
            </h1>
            {subtitle && <p className="text-sm text-stone-500 font-light italic">{subtitle}</p>}
            {card.city && (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 inline-flex items-center gap-1.5 pt-1">
                <MapPin size={10} /> {card.city}
              </p>
            )}
          </div>
        </motion.header>

        {/* Likes / activities */}
        {((card.activities && card.activities.length > 0) || card.hobbies) && (
          <section className="pb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2 mb-3">
              <Heart size={11} /> Loves
            </span>
            {card.activities && card.activities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {card.activities.map((a) => (
                  <span key={a} className="text-[11px] font-bold tracking-wide text-charcoal bg-stone-50 border border-stone-100 rounded-full px-3 py-1.5">
                    {ACTIVITY_LABEL[a] ?? a}
                  </span>
                ))}
              </div>
            )}
            {card.hobbies && (
              <p className="text-sm text-stone-600 font-light italic leading-relaxed">{card.hobbies}</p>
            )}
          </section>
        )}

        {/* Groups */}
        {groups.length > 0 && (
          <section className="pb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2 mb-3">
              <Users size={11} /> Member of
            </span>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => navigate(buildPath.communityGroup(g.id))}
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wide text-charcoal bg-white border border-stone-200 hover:border-stone-300 rounded-full px-3 py-1.5 transition-colors"
                >
                  <span aria-hidden="true">{g.emoji ?? '🐾'}</span> {g.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Furry parent ficha — always shown when we know the owner. */}
        {card.ownerId && (
          <section className="pb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2 mb-3">
              <PawPrint size={11} /> Furry parent
            </span>
            <div className="rounded-[1.5rem] border border-stone-100 bg-stone-50/50 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                {card.ownerPhoto
                  ? <img src={card.ownerPhoto} alt={card.ownerName ?? 'Parent'} className="w-full h-full object-cover" />
                  : <span className="text-lg font-serif italic text-stone-300">{(card.ownerName ?? '·')[0]?.toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-base font-serif italic text-charcoal">{card.ownerName ?? 'A Hey Lola member'}</p>
                  {card.ownerHandle && <span className="text-[11px] text-stone-400">@{card.ownerHandle}</span>}
                </div>
                {card.ownerCity && (
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mt-1 inline-flex items-center gap-1">
                    <MapPin size={9} /> {card.ownerCity}
                  </p>
                )}
                {card.ownerBio && (
                  <p className="text-sm text-stone-600 font-light italic leading-relaxed mt-2">{card.ownerBio}</p>
                )}
              </div>
            </div>

            {/* Connect — LinkedIn-style request with a note. */}
            {canConnect && (
              <div className="mt-3">
                {connState.state === 'connected' ? (
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#6E8C5D]">
                    <Check size={12} /> Connected — you can message each other
                  </span>
                ) : connState.state === 'pending-out' ? (
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                    <Clock size={12} /> Request sent
                  </span>
                ) : connState.state === 'pending-in' ? (
                  <button
                    type="button"
                    disabled={connBusy}
                    onClick={() => connState.doc && acceptIncoming(connState.doc.id)}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-colors disabled:opacity-50"
                  >
                    {connBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Accept request
                  </button>
                ) : connOpen ? (
                  <div className="space-y-2">
                    <textarea
                      value={connMsg}
                      onChange={(e) => setConnMsg(e.target.value)}
                      rows={2}
                      maxLength={300}
                      placeholder={`Add a note for ${card.ownerName ?? 'them'}… (e.g. our dogs should meet!)`}
                      className="w-full bg-stone-50 rounded-xl px-3 py-2 text-sm text-charcoal placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-200 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={sendRequest}
                        disabled={!connMsg.trim() || connBusy}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-colors disabled:opacity-40"
                      >
                        {connBusy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send request
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConnOpen(false); setConnMsg(''); }}
                        className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => (user ? setConnOpen(true) : navigate(paths.login))}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-colors"
                  >
                    <UserPlus size={12} /> Connect
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Owner-only hint when their pet isn't public yet. */}
        {card.ownerId === user?.uid && card.isPublic === false && (
          <p className="-mt-10 mb-16 text-center text-[11px] text-stone-400 italic">
            Only you can see this preview — turn on a public profile in your dashboard to share it.
          </p>
        )}

        <div className="pb-8 text-center">
          <button
            type="button"
            onClick={() => navigate(paths.community)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
          >
            Explore the community <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
