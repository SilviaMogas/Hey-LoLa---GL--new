import React, { useEffect, useState } from 'react';
import { Check, Loader2, MessageSquare, UserPlus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, OperationType } from '../lib/dbHelpers';
import { useAuth } from '../lib/useAuth';
import { syncMemberPublicCard } from '../lib/memberPublic';
import {
  listConnections,
  acceptConnection,
  declineConnection,
  type ConnectionDoc,
} from '../lib/connections';

interface Props {
  /** Opens a DM thread with the given user (wired at App level). */
  onOpenDm?: (otherUid: string, otherName: string) => void;
}

/**
 * Community connections panel for the dashboard:
 *  1) An opt-in toggle to be discoverable and receive connection requests.
 *  2) Incoming connection requests (accept / decline).
 *  3) Accepted connections with a "Message" shortcut into DMs.
 */
export const CommunityConnections: React.FC<Props> = ({ onOpenDm }) => {
  const { user, profile } = useAuth();
  const [optIn, setOptIn] = useState<boolean>(!!profile?.communityOptIn);
  const [savingOptIn, setSavingOptIn] = useState(false);
  const [conns, setConns] = useState<ConnectionDoc[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { setOptIn(!!profile?.communityOptIn); }, [profile?.communityOptIn]);

  useEffect(() => {
    if (!user) { setConns([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = await listConnections(user.id);
        if (!cancelled) setConns(list);
      } catch (err) {
        handleSupabaseError(err, OperationType.READ, 'connections');
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  const toggleOptIn = async () => {
    if (savingOptIn) return;
    const next = !optIn;
    setSavingOptIn(true);
    setOptIn(next);
    try {
      await supabase.from('users').update({ community_opt_in: next, updated_at: new Date().toISOString() }).eq('id', user.id);
      await syncMemberPublicCard(user.id, { ...profile, communityOptIn: next }, next);
    } catch (err) {
      setOptIn(!next);
      handleSupabaseError(err, OperationType.WRITE, 'users');
    } finally {
      setSavingOptIn(false);
    }
  };

  const act = async (id: string, accept: boolean) => {
    setBusyId(id);
    try {
      if (accept) await acceptConnection(id); else await declineConnection(id);
      setConns((prev) => prev.map((c) => (c.id === id ? { ...c, status: accept ? 'accepted' : 'declined' } : c)));
    } catch (err) {
      handleSupabaseError(err, OperationType.WRITE, 'connections');
    } finally {
      setBusyId(null);
    }
  };

  const incoming = conns.filter((c) => c.toUid === user.id && c.status === 'pending');
  const accepted = conns.filter((c) => c.status === 'accepted');

  return (
    <section className="rounded-2xl border border-stone-100 bg-white p-5 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
          <UserPlus size={12} /> Connections
        </h3>
        {/* Opt-in toggle */}
        <button
          type="button"
          onClick={toggleOptIn}
          disabled={savingOptIn}
          aria-pressed={optIn}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${optIn ? 'bg-[#6E8C5D]' : 'bg-stone-200'} disabled:opacity-60`}
          title={optIn ? 'You are discoverable in the community' : 'Turn on to be discoverable'}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${optIn ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </header>

      <p className="text-xs text-stone-500 font-light leading-relaxed">
        {optIn
          ? 'You’re visible in the community — other members can find you and send connection requests.'
          : 'Turn on to join the community directory: share your name, photo, city and interests, and let members connect with you.'}
      </p>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Requests</p>
          {incoming.map((c) => (
            <div key={c.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {c.fromPhoto
                    ? <img src={c.fromPhoto} alt={c.fromName} className="w-full h-full object-cover" />
                    : <span className="text-xs font-serif italic text-stone-300">{c.fromName[0]?.toUpperCase()}</span>}
                </div>
                <p className="flex-1 min-w-0 text-sm font-serif italic text-charcoal truncate">{c.fromName}</p>
                <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, true)} aria-label="Accept" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-charcoal text-white hover:bg-charcoal/80 transition-colors disabled:opacity-50">
                  {busyId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                </button>
                <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, false)} aria-label="Decline" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-50">
                  <X size={13} />
                </button>
              </div>
              {c.message && <p className="text-xs text-stone-600 italic leading-relaxed mt-2 pl-12">“{c.message}”</p>}
            </div>
          ))}
        </div>
      )}

      {/* Accepted connections */}
      {accepted.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Connected</p>
          {accepted.map((c) => {
            const otherUid = c.fromUid === user.id ? c.toUid : c.fromUid;
            const otherName = c.fromUid === user.id ? (c.toName || 'Member') : c.fromName;
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
                <p className="flex-1 min-w-0 text-sm font-serif italic text-charcoal truncate">{otherName}</p>
                <button
                  type="button"
                  onClick={() => onOpenDm?.(otherUid, otherName)}
                  disabled={!onOpenDm}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-charcoal text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-charcoal/80 transition-colors disabled:opacity-40"
                >
                  <MessageSquare size={11} /> Message
                </button>
              </div>
            );
          })}
        </div>
      )}

      {incoming.length === 0 && accepted.length === 0 && (
        <p className="text-xs text-stone-400 italic">No requests yet. When someone wants to connect, it shows here.</p>
      )}
    </section>
  );
};
