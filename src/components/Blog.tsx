import React, { useEffect, useState } from 'react';
import { ArrowLeft, Send, Loader2, Check, PenLine } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

/**
 * The Journal page: third-party RSS feed (Elfsight) on top, contributor
 * pitch form below. The form writes to business_leads/{auto-id} with
 * kind='journal_contributor' so admins can review pitches without a
 * new collection / rule.
 */
export const Blog: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Lazy-load the Elfsight platform script once.
  useEffect(() => {
    const scriptId = 'elfsight-platform-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    handle: '',
    topics: '',
    sampleUrl: '',
    pitch: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const valid = form.name.trim() && form.email.trim() && form.pitch.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'business_leads'), {
        kind: 'journal_contributor',
        source: 'website_blog_page',
        status: 'new',
        name: form.name.trim(),
        email: form.email.trim(),
        handle: form.handle.trim(),
        topics: form.topics.trim(),
        sampleUrl: form.sampleUrl.trim(),
        pitch: form.pitch.trim(),
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'business_leads');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60vh] pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-black font-sans uppercase tracking-[0.35em] text-stone-300 hover:text-charcoal transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-charcoal group-hover:border-charcoal group-hover:text-white transition-all duration-500">
            <ArrowLeft size={13} />
          </span>
          Back to Home
        </button>

        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter">
            The <span className="text-stone-300">Journal</span><span className="brand-dot" aria-hidden="true" />
          </h1>
          <p className="text-[9px] font-black font-sans uppercase tracking-[0.4em] text-stone-300 mt-1">Stories & Guides</p>
        </div>
      </div>

      {/* RSS feed */}
      <div className="w-full min-h-[40vh]">
        <div className="elfsight-app-6d741dfd-833f-40ce-a827-cc7b81020c0c" data-elfsight-app-lazy></div>
      </div>

      {/* Contributor pitch form */}
      <section className="max-w-3xl mx-auto pt-16 sm:pt-20" aria-labelledby="contribute-heading">
        <header className="text-center space-y-3 mb-10 sm:mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
            <PenLine size={11} /> Contribute
          </span>
          <h2 id="contribute-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-[0.95]">
            Want to write for Hey Lola<span className="brand-dot" aria-hidden="true" />
          </h2>
          <p className="text-sm sm:text-base text-stone-500 font-light italic max-w-xl mx-auto leading-relaxed">
            Stories, city guides, dog-friendly itineraries, well-told moments with your dog.
            Pitch us in a few sentences and the editorial team will reach out.
          </p>
        </header>

        {submitted ? (
          <div className="rounded-3xl border border-stone-100 bg-white p-8 sm:p-10 text-center space-y-3 shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check size={20} />
            </div>
            <h3 className="text-2xl font-serif italic tracking-tight">Thank you<span className="brand-dot" aria-hidden="true" /></h3>
            <p className="text-sm text-stone-500 italic max-w-md mx-auto leading-relaxed">
              We&apos;ve received your pitch. The editorial team will reach out within a few days
              if your story fits the next issue.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-3xl border border-stone-100 bg-white p-6 sm:p-8 space-y-5 shadow-[0_8px_40px_rgba(0,0,0,0.02)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Silvia Mogas"
                  required
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            <Field label="Instagram or website (optional)">
              <input
                type="text"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="@silviamogas or silviamogas.com"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="What would you write about?">
              <input
                type="text"
                value={form.topics}
                onChange={(e) => setForm({ ...form, topics: e.target.value })}
                placeholder="e.g. Dog-friendly Lisbon, vet travel tips, slow weekends with a senior dog…"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Sample of your writing (optional)">
              <input
                type="url"
                value={form.sampleUrl}
                onChange={(e) => setForm({ ...form, sampleUrl: e.target.value })}
                placeholder="https://… (article, blog, Substack)"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Your pitch" required>
              <textarea
                value={form.pitch}
                onChange={(e) => setForm({ ...form, pitch: e.target.value })}
                placeholder="Tell us the story you want to write — in your own voice. 3–5 sentences is plenty."
                rows={5}
                maxLength={1200}
                required
                className={`${INPUT_CLASS} resize-none`}
              />
              <span className="text-[10px] text-stone-400 font-light block text-right">{form.pitch.length} / 1200</span>
            </Field>

            <button
              type="submit"
              disabled={!valid || submitting}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-charcoal text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Send pitch
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

const INPUT_CLASS =
  'w-full bg-stone-50 border border-transparent rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-stone-300 outline-none focus:border-charcoal focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
        {label}{required && <span className="text-brand-orange ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
