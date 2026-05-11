import React, { useEffect, useState } from 'react';
import { MessageSquare, User as UserIcon } from 'lucide-react';
import { DmThread, subscribeMyThreads } from '../lib/dm';

interface DmInboxProps {
  meUid?: string;
  onOpenThread: (otherUid: string, otherName: string, otherPhoto?: string, contextPet?: string) => void;
}

export const DmInbox: React.FC<DmInboxProps> = ({ meUid, onOpenThread }) => {
  const [threads, setThreads] = useState<DmThread[]>([]);

  useEffect(() => {
    if (!meUid) return;
    const unsub = subscribeMyThreads(meUid, setThreads);
    return () => unsub();
  }, [meUid]);

  if (!meUid || threads.length === 0) return null;

  const unreadTotal = threads.reduce((sum, t) => sum + (t.unreadFor?.[meUid] ?? 0), 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-6">
        <div className="flex items-center gap-6">
          <div className="w-1.5 h-6 bg-stone-300 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Messages</h3>
        </div>
        {unreadTotal > 0 && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-charcoal text-white rounded-full px-3 py-1">
            {unreadTotal} new
          </span>
        )}
      </div>
      <ul className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {threads.map(t => {
          const otherUid = (t.participants ?? []).find(p => p !== meUid) ?? '';
          const otherName = t.participantNames?.[otherUid] ?? 'Member';
          const otherPhoto = t.participantPhotos?.[otherUid] ?? '';
          const unread = t.unreadFor?.[meUid] ?? 0;
          return (
            <li key={t.id}>
              <button
                onClick={() => onOpenThread(otherUid, otherName, otherPhoto, t.contextPet)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center shrink-0">
                  {otherPhoto ? (
                    <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-stone-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-charcoal truncate">{otherName}</p>
                    {t.contextPet && (
                      <span className="text-[9px] uppercase tracking-widest text-stone-400">· {t.contextPet}</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    {t.lastSenderUid === meUid ? 'You: ' : ''}
                    {t.lastMessage ?? 'New conversation'}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-charcoal text-white rounded-full px-2 py-0.5">{unread}</span>
                )}
                <MessageSquare size={16} className="text-stone-300" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
