import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Heart,
  Send,
  Loader2,
  Shield,
  Activity,
  Waves,
  Globe,
  PawPrint,
  User,
  ArrowLeft,
  Sparkles,
  Wine,
  Utensils,
  Trees,
  Lightbulb,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Post } from '../types';
import { useTranslation } from '../lib/LanguageContext';
import { track } from '../lib/analytics';

interface CommunityProps {
  petName: string;
  initialMode?: 'community' | 'support';
}

// Reddit-style collapsible sidebar.
// Each `category` is a top-level group that the user can expand / collapse;
// each city has its own group with 5 sub-channels (bars, restaurants,
// parks, tips, singles) so every conversation stays on-topic.
const cityChannels = (cityKey: string, cityLabel: string) => [
  { id: `${cityKey}-bars`,        name: `${cityKey}-bars`,        icon: <Wine size={15} />,     topic: `Pet-friendly bars and rooftops in ${cityLabel}` },
  { id: `${cityKey}-restaurants`, name: `${cityKey}-restaurants`, icon: <Utensils size={15} />, topic: `Where to dine with your companion in ${cityLabel}` },
  { id: `${cityKey}-parks`,       name: `${cityKey}-parks`,       icon: <Trees size={15} />,    topic: `Best parks, beaches and walks in ${cityLabel}` },
  { id: `${cityKey}-tips`,        name: `${cityKey}-tips`,        icon: <Lightbulb size={15} />, topic: `Local hacks and recommendations for ${cityLabel}` },
  { id: `${cityKey}-singles`,     name: `${cityKey}-singles`,     icon: <Users size={15} />,    topic: `Single pet parents meeting up in ${cityLabel}` },
];

const COMMUNITIES = [
  {
    category: 'Global',
    channels: [
      { id: 'global-lounge', name: 'lounge',       icon: <Sparkles size={15} />, topic: 'Open conversations across the HeyLola community' },
      { id: 'global-health', name: 'health-sync',  icon: <Activity size={15} />, topic: 'Health and biometric data' },
      { id: 'global-rules',  name: 'travel-rules', icon: <Shield size={15} />,   topic: 'International travel requirements' },
    ],
  },
  {
    category: 'Species',
    channels: [
      { id: 'species-dogs', name: 'dog-parents', icon: <PawPrint size={15} />, topic: 'Connecting dog parents worldwide' },
      { id: 'species-cats', name: 'cat-lounge',  icon: <Waves size={15} />,    topic: 'Insights for cat companions' },
    ],
  },
  { category: 'Barcelona',     channels: cityChannels('bcn',    'Barcelona') },
  { category: 'Miami',         channels: cityChannels('mia',    'Miami') },
  { category: 'New York City', channels: cityChannels('nyc',    'New York City') },
];

function relativeTime(ts?: { toDate?: () => Date } | null): string {
  if (!ts?.toDate) return 'now';
  const date = ts.toDate();
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const Community: React.FC<CommunityProps> = ({ petName, initialMode = 'community' }) => {
  const { t } = useTranslation();
  void t;
  const [activeView, setActiveView] = useState<'feed' | 'topics' | 'messages'>(
    initialMode === 'support' ? 'messages' : 'feed'
  );
  const [activeChannelId, setActiveChannelId] = useState(initialMode === 'support' ? '' : COMMUNITIES[0].channels[0].id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  const [activeDM, setActiveDM] = useState<{ id: string; name: string } | null>(
    initialMode === 'support' ? { id: 'support_team', name: 'HeyLola Assistant' } : null
  );
  const [dmMessages, setDmMessages] = useState<any[]>([]);
  const dmScrollRef = useRef<HTMLDivElement>(null);

  const activeChannel = useMemo(() => {
    for (const group of COMMUNITIES) {
      const found = group.channels.find((c) => c.id === activeChannelId);
      if (found) return found;
    }
    return COMMUNITIES[0].channels[0];
  }, [activeChannelId]);

  useEffect(() => {
    if ((activeView === 'feed' || activeView === 'topics') && activeChannelId) {
      setLoading(true);
      const q = query(
        collection(db, 'posts'),
        where('channel', '==', activeChannelId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Post[]);
          setLoading(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'posts');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [activeChannelId, activeView]);

  useEffect(() => {
    if (activeView === 'messages' && activeDM && auth.currentUser) {
      setLoading(true);
      const dmId = [auth.currentUser.uid, activeDM.id].sort().join('_');
      const q = query(collection(db, `dms/${dmId}/messages`), orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        setDmMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);

        // First-time greeting from support team (not from user)
        if (snapshot.empty && activeDM.id === 'support_team' && auth.currentUser) {
          const dmId = [auth.currentUser.uid, activeDM.id].sort().join('_');
          try {
            await addDoc(collection(db, `dms/${dmId}/messages`), {
              senderId: 'support_team',
              displayName: 'HeyLola Assistant',
              content: `Hi! 👋 I'm the HeyLola AI assistant — ask me anything about pet documents, travel rules, vaccinations or vet emergencies. For anything I can't solve, tap "Talk to a human" up top to email our team.`,
              createdAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `dms/${dmId}/messages`);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [activeView, activeDM]);

  // Auto-scroll DM container to bottom on new message
  useEffect(() => {
    if (activeView === 'messages' && dmScrollRef.current) {
      dmScrollRef.current.scrollTop = dmScrollRef.current.scrollHeight;
    }
  }, [dmMessages, activeView]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !auth.currentUser) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Friend',
        petName: petName || 'Partner',
        channel: activeChannelId,
        content: newPost,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      track('community_post_created', { channel: activeChannelId });
      setNewPost('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsPosting(false);
    }
  };

  // Calls the /api/chat serverless function for an AI reply, then posts
  // it to the DM thread as if it were sent by the support team.
  const requestBotReply = async (userMessage: string, dmId: string) => {
    setBotTyping(true);
    try {
      const recent = dmMessages.slice(-10).map((m: any) => ({
        role: m.senderId === auth.currentUser?.uid ? 'user' : 'assistant',
        content: m.content,
      }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: recent }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = (data.reply as string | undefined) ||
        "I'm having trouble right now — please email hey@heylola.co and our team will follow up.";
      await addDoc(collection(db, `dms/${dmId}/messages`), {
        senderId: 'support_team',
        displayName: 'HeyLola Assistant',
        content: reply,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('bot reply failed', err);
    } finally {
      setBotTyping(false);
    }
  };

  const handleSendMessage = async (content: string, auto = false) => {
    if (!content.trim() || !auth.currentUser || !activeDM) return;
    const dmId = [auth.currentUser.uid, activeDM.id].sort().join('_');
    try {
      await addDoc(collection(db, `dms/${dmId}/messages`), {
        senderId: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
        content,
        createdAt: serverTimestamp(),
      });
      if (!auto) {
        setNewPost('');
        track('support_message_sent');
      }
      // If the user is talking to support_team, fire the AI assistant
      if (!auto && activeDM.id === 'support_team') {
        requestBotReply(content, dmId);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `dms/${dmId}/messages`);
    }
  };

  const totalChannels = COMMUNITIES.reduce((sum, g) => sum + g.channels.length, 0);

  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] h-[calc(100vh-160px)] min-h-[560px]">
      {/* Header */}
      <header className="px-5 sm:px-8 py-4 sm:py-5 bg-white border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-black italic tracking-tighter text-charcoal leading-none">
              The <span className="text-stone-300">Hub</span><span className="text-brand-orange">.</span>
            </h1>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mt-1">{totalChannels} channels</span>
          </div>

          <div className="h-6 w-px bg-stone-100 hidden md:block" />

          <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {(['feed', 'topics', 'messages'] as const).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view);
                  if (view === 'feed') setActiveChannelId(COMMUNITIES[0].channels[0].id);
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeView === view
                    ? 'bg-charcoal text-white'
                    : 'text-stone-400 hover:text-charcoal hover:bg-stone-50'
                }`}
              >
                {view === 'feed' ? 'Feed' : view === 'topics' ? 'Topics' : 'Messages'}
              </button>
            ))}
          </nav>
        </div>

        <a
          href="mailto:hey@heylola.co?subject=HeyLola%20—%20Support%20request"
          onClick={() => track('support_chat_opened', { from: 'header_email' })}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition-all group shrink-0 self-stretch md:self-auto justify-center"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal whitespace-nowrap">Talk to a human</span>
        </a>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sub-navigation */}
        <AnimatePresence mode="wait">
          {activeView !== 'feed' && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-stone-50/60 border-r border-stone-100 overflow-y-auto scrollbar-hide shrink-0 ${
                (activeView === 'topics' && activeChannelId) || (activeView === 'messages' && activeDM)
                  ? 'hidden md:block'
                  : 'block w-full md:w-[280px]'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-7">
                {activeView === 'topics' ? (
                  COMMUNITIES.map((comm) => (
                    <div key={comm.category} className="space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 px-2">{comm.category}</h3>
                      <div className="space-y-0.5">
                        {comm.channels.map((channel) => (
                          <button
                            key={channel.id}
                            onClick={() => setActiveChannelId(channel.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              activeChannelId === channel.id
                                ? 'bg-charcoal text-white'
                                : 'text-stone-500 hover:bg-stone-100 hover:text-charcoal'
                            }`}
                          >
                            <span className="shrink-0 opacity-70">{channel.icon}</span>
                            <span className="truncate">#{channel.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 px-2">Recent Chats</h3>
                    <button
                      onClick={() => setActiveDM({ id: 'support_team', name: 'HeyLola Assistant' })}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeDM?.id === 'support_team'
                          ? 'bg-charcoal text-white'
                          : 'bg-white border border-stone-100 text-charcoal hover:border-stone-200'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        activeDM?.id === 'support_team' ? 'bg-white/15' : 'bg-stone-100'
                      }`}>
                        <User size={15} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="truncate text-sm font-black">HeyLola Assistant</p>
                        <p className="text-[9px] opacity-60 uppercase tracking-[0.2em] font-black mt-0.5">AI · Always on</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main
          className={`flex-1 flex flex-col bg-white overflow-hidden relative ${
            activeView !== 'feed' && !activeChannelId && !activeDM ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeView === 'topics' && activeChannelId && (
            <button
              onClick={() => setActiveChannelId('')}
              className="md:hidden flex items-center gap-2 px-5 py-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-50 hover:text-charcoal"
            >
              <ArrowLeft size={14} /> Back to Topics
            </button>
          )}
          {activeView === 'messages' && activeDM && (
            <button
              onClick={() => setActiveDM(null)}
              className="md:hidden flex items-center gap-2 px-5 py-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-50 hover:text-charcoal"
            >
              <ArrowLeft size={14} /> Back to Chats
            </button>
          )}

          {activeView === 'feed' || (activeView === 'topics' && activeChannelId) ? (
            <>
              {/* Channel Header */}
              {activeView === 'topics' && activeChannelId && (
                <div className="px-5 sm:px-8 py-5 border-b border-stone-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-50 text-charcoal rounded-xl flex items-center justify-center border border-stone-100">
                      {activeChannel?.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-black tracking-tighter leading-none text-charcoal">
                        #{activeChannel?.name}
                      </h2>
                      <p className="text-stone-400 text-xs mt-1 truncate">
                        {activeChannel?.topic}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thread List */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 space-y-3 scrollbar-hide">
                {loading && (activeView === 'feed' || activeChannelId) ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4 text-stone-300">
                    <Loader2 className="animate-spin" size={28} />
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white p-5 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all group"
                    >
                      <header className="flex justify-between items-start mb-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center font-black text-xs text-charcoal shrink-0 border border-stone-100">
                            {post.displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-sm text-charcoal truncate leading-tight">{post.displayName}</h4>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] truncate mt-0.5">
                              {post.petName ? `${post.petName}'s parent` : 'HeyLola member'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black tracking-[0.15em] uppercase text-stone-300 shrink-0 mt-1">
                          {relativeTime((post as any).createdAt)}
                        </span>
                      </header>
                      <p className="text-charcoal text-[15px] leading-relaxed whitespace-pre-line break-words">
                        {post.content}
                      </p>
                      <footer className="flex gap-5 mt-4 pt-4 border-t border-stone-50">
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 hover:text-charcoal transition-colors">
                          <Heart size={13} /> {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 hover:text-charcoal transition-colors">
                          <MessageSquare size={13} /> Reply
                        </button>
                      </footer>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto text-stone-300 border border-stone-100">
                      <MessageSquare size={22} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-black text-charcoal">Nothing here yet</p>
                      <p className="text-sm text-stone-400 max-w-xs mx-auto">
                        Be the first to start the conversation in <span className="text-charcoal font-black">#{activeChannel?.name}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeView === 'messages' && activeDM ? (
            <>
              {/* DM Header */}
              <div className="px-5 sm:px-8 py-4 border-b border-stone-100 shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center text-white shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black tracking-tight text-charcoal leading-none truncate">
                    {activeDM.name}
                  </h2>
                  <p className="text-stone-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> AI · Replies in seconds
                  </p>
                </div>
              </div>

              {/* Messages Flow */}
              <div
                ref={dmScrollRef}
                className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-3 scrollbar-hide flex flex-col"
              >
                {dmMessages.map((msg) => {
                  const isMe = msg.senderId === auth.currentUser?.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-line break-words ${
                            isMe
                              ? 'bg-charcoal text-white rounded-br-sm'
                              : 'bg-stone-50 text-charcoal rounded-bl-sm border border-stone-100'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] font-black tracking-[0.15em] uppercase text-stone-300 px-1">
                          {relativeTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {botTyping && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-stone-50 border border-stone-100 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-stone-300 p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 text-stone-300">
                <Globe size={28} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-base font-black text-charcoal">Pick a channel or chat</p>
                <p className="text-sm text-stone-400">Select a topic on the left to start connecting with the HeyLola community.</p>
              </div>
            </div>
          )}

          {/* Input Area — sits in the normal flex flow right below the messages
              so it never floats off-screen on tall containers */}
          {(activeView === 'feed' || activeChannelId || activeDM) && (
            <div className="shrink-0 px-3 sm:px-6 pb-3 sm:pb-4 pt-2 bg-white border-t border-stone-50 z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPost.trim()) return;
                  if (activeView === 'messages') {
                    handleSendMessage(newPost);
                  } else {
                    handlePost(e);
                  }
                }}
                className="bg-white p-1.5 rounded-full border border-stone-200 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={activeView === 'messages' ? 'Ask the AI assistant anything…' : 'Ask the community anything…'}
                  className="flex-1 h-11 pl-5 bg-transparent border-transparent rounded-full focus:outline-none transition-all text-charcoal placeholder:text-stone-300 text-sm"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newPost.trim() || isPosting || botTyping}
                  aria-label="Send"
                  className="w-11 h-11 bg-charcoal text-white rounded-full flex items-center justify-center hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-25 disabled:hover:bg-charcoal disabled:hover:scale-100 shrink-0"
                >
                  {isPosting || botTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
