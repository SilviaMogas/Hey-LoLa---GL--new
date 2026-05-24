import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Send, Mail, TestTube2 } from 'lucide-react';

type Audience = 'all' | 'users' | 'waitlist';

const AUDIENCE_OPTIONS: { value: Audience; label: string; description: string }[] = [
  { value: 'all', label: 'All Subscribers', description: 'Registered users + waitlist entries (de-duplicated)' },
  { value: 'users', label: 'Registered Users', description: 'Only users with an account' },
  { value: 'waitlist', label: 'Waitlist', description: 'Only waitlist entries' },
];

interface BroadcastResult {
  total: number;
  delivered: number;
  failed: number;
}

export const AdminBroadcast: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  const send = async (isTest: boolean) => {
    if (!canSend) return;
    if (isTest && !testEmail.trim()) {
      setError('Enter a test email address.');
      return;
    }
    if (!isTest && !window.confirm(`Send "${subject}" to ${audience === 'all' ? 'ALL subscribers' : audience}? This cannot be undone.`)) {
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated.');

      const payload: Record<string, string> = { subject: subject.trim(), body: body.trim(), audience };
      if (ctaLabel.trim()) payload.ctaLabel = ctaLabel.trim();
      if (ctaUrl.trim()) payload.ctaUrl = ctaUrl.trim();
      if (isTest) payload.testEmail = testEmail.trim();

      const res = await fetch('/api/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Request failed (${res.status})`);
      setResult({ total: json.total, delivered: json.delivered, failed: json.failed });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif italic text-2xl">Send to subscribers<span className="brand-dot" aria-hidden="true" /></h2>
        <p className="text-sm text-stone-500 font-light">
          Compose and send a broadcast email to your subscribers. Always send a test first.
        </p>
      </header>

      <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-5">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Big news from Hey Lola"
            className="luxury-input h-10 w-full text-sm"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here. Use blank lines for paragraph breaks."
            className="luxury-input p-3 w-full text-sm leading-relaxed resize-y min-h-[180px]"
          />
        </div>

        {/* CTA (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">CTA button label <span className="text-stone-300">(optional)</span></label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g. Visit Hey Lola"
              className="luxury-input h-10 w-full text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">CTA button URL <span className="text-stone-300">(optional)</span></label>
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://heylola.co"
              className="luxury-input h-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Audience */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Audience</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudience(opt.value)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${
                  audience === opt.value
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 font-light">
            {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.description}
          </p>
        </div>

        {/* Test email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Test email address</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="luxury-input h-10 flex-1 text-sm"
            />
            <button
              type="button"
              onClick={() => send(true)}
              disabled={sending || !canSend || !testEmail.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-xs font-black uppercase tracking-[0.2em] hover:border-charcoal hover:text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <TestTube2 size={14} />}
              Send test
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => send(false)}
            disabled={sending || !canSend}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-charcoal text-white text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send broadcast
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 text-sm ${result.failed > 0 ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            <div className="flex items-center gap-2 font-bold">
              <Mail size={16} />
              Broadcast sent
            </div>
            <p className="mt-1 font-light">
              {result.delivered} of {result.total} emails delivered.
              {result.failed > 0 && ` ${result.failed} failed.`}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 text-sm bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};
