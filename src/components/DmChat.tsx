import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Loader2, User as UserIcon } from 'lucide-react';
import {
  DmMessage,
  ensureThread,
  markThreadRead,
  sendMessage,
  subscribeThreadMessages,
  threadIdFor,
} from '../lib/dm';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';

interface DmChatProps {
  meProfile: UserProfile | null;
  otherUid: string;
  otherName: string;
  otherPhoto?: string;
  petName?: string;
  onClose: () => void;
}

export const DmChat: React.FC<DmChatProps> = ({ meProfile, otherUid, otherName, otherPhoto, petName, onClose }) => {
  const meUid = auth.currentUser?.uid || meProfile?.uid;
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [readyError, setReadyError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meName = meProfile?.displayName ?? meProfile?.firstName ?? 'Member';
  const mePhoto = meProfile?.photoURL ?? '';

  useEffect(() => {
    if (!meUid) return;
    let active = true;
    (async () => {
      try {
        const id = await ensureThread(
          meUid,
          meName,
          mePhoto,
          otherUid,
          otherName,
          otherPhoto ?? '',
          petName,
        );
        if (!active) return;
        setThreadId(id);
        await markThreadRead(id, meUid);
      } catch (e) {
        if (!active) return;
        const message = e instanceof Error ? e.message : 'Could not open chat.';
        setReadyError(message);
      }
    })();
    return () => { active = false; };
  }, [meUid, meName, mePhoto, otherUid, otherName, otherPhoto, petName]);

  useEffect(() => {
    if (!threadId) return;
    const unsub = subscribeThreadMessages(threadId, setMessages);
    return () => unsub();
  }, [threadId]);

  const messageCount = messages.length;
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  useEffect(() => {
    if (threadId && meUid && messageCount > 0) {
      markThreadRead(threadId, meUid).catch((err) => console.error('markThreadRead failed', err));
    }
  }, [threadId, meUid, messageCount]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId || !meUid || !draft.trim() || sending) return;
    setSending(true);
    sendMessage(threadId, meUid, otherUid, draft)
      .then(() => setDraft(''))
      .catch((err) => {
        console.error(err);
        alert('Could not send your message.');
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] overflow-hidden"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center shrink-0">
              {otherPhoto ? (
                <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} className="text-stone-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-charcoal truncate">{otherName}</p>
              {petName && <p className="text-[10px] uppercase tracking-widest text-stone-400">About {petName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100" aria-label="Close chat">
            <X size={18} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 bg-stone-50/40 space-y-3">
          {readyError && (
            <p className="text-center text-xs text-red-500">{readyError}</p>
          )}
          {!readyError && !threadId && (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-stone-300" /></div>
          )}
          {threadId && messages.length === 0 && (
            <p className="text-center text-xs text-stone-400 italic mt-6">
              Say hi {petName ? `to ${otherName} about ${petName}` : `to ${otherName}`} 👋
            </p>
          )}
          {messages.map(m => {
            const mine = m.fromUid === meUid;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${mine ? 'bg-charcoal text-white rounded-br-md' : 'bg-white text-charcoal border border-stone-100 rounded-bl-md'}`}>
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="border-t border-stone-100 px-3 py-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!threadId || sending}
            placeholder="Write a message…"
            className="flex-1 bg-stone-50 border border-stone-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-charcoal/20"
          />
          <button
            type="submit"
            disabled={!threadId || !draft.trim() || sending}
            className="bg-charcoal text-white p-3 rounded-full disabled:opacity-40"
            aria-label="Send"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
