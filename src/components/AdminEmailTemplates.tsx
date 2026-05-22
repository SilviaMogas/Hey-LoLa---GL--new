import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Monitor, Smartphone, ExternalLink } from 'lucide-react';

interface TemplateMeta {
  id: string;
  label: string;
  group: 'Customer' | 'Admin';
  sample: Record<string, unknown>;
}

/**
 * Admin → Email Templates. Live preview of every transactional email, with
 * editable sample data. The actual template designs live in /emails/*.tsx
 * (React Email); this panel renders them via /api/email-preview so you can see
 * exactly how each email looks and try different content before it ships.
 */
export const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [dataText, setDataText] = useState<string>('{}');
  const [appliedData, setAppliedData] = useState<string>('{}');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/email-preview?list=1');
        if (!res.ok) throw new Error(`List failed (${res.status})`);
        const json = await res.json();
        if (cancelled) return;
        const list: TemplateMeta[] = json.templates || [];
        setTemplates(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          const pretty = JSON.stringify(list[0].sample, null, 2);
          setDataText(pretty);
          setAppliedData(pretty);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Could not load templates. Deploy the API and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSelect = (id: string) => {
    setSelectedId(id);
    const t = templates.find((x) => x.id === id);
    const pretty = JSON.stringify(t?.sample ?? {}, null, 2);
    setDataText(pretty);
    setAppliedData(pretty);
    setJsonError(null);
  };

  const applyData = () => {
    try {
      JSON.parse(dataText);
      setAppliedData(dataText);
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Invalid JSON: ' + (e?.message || ''));
    }
  };

  const previewSrc = useMemo(() => {
    if (!selectedId) return '';
    const params = new URLSearchParams({ template: selectedId, data: appliedData });
    return `/api/email-preview?${params.toString()}`;
  }, [selectedId, appliedData]);

  const grouped = useMemo(() => {
    const g: Record<string, TemplateMeta[]> = { Customer: [], Admin: [] };
    templates.forEach((t) => { (g[t.group] ||= []).push(t); });
    return g;
  }, [templates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-serif italic tracking-tight">Email templates<span className="brand-dot" aria-hidden="true" /></h2>
        <p className="text-sm text-stone-400 font-light mt-1">
          Live preview of every transactional email. Edit the sample data to see how it renders. Designs live in <code className="text-[12px] bg-stone-100 px-1 rounded">/emails</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
        {/* Left: picker + data editor */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Template</label>
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="luxury-input h-10 w-full text-sm"
            >
              {Object.entries(grouped).map(([group, list]) => (
                list.length > 0 && (
                  <optgroup key={group} label={group}>
                    {list.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </optgroup>
                )
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Sample data (JSON)</label>
            <textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              spellCheck={false}
              className="luxury-input p-3 w-full text-[12px] font-mono leading-relaxed resize-y min-h-[260px]"
            />
            {jsonError && <p className="text-[12px] text-red-500">{jsonError}</p>}
            <button
              type="button"
              onClick={applyData}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-colors"
            >
              <RefreshCw size={12} /> Update preview
            </button>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-full border border-stone-200 p-0.5">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${device === 'desktop' ? 'bg-charcoal text-white' : 'text-stone-400'}`}
              >
                <Monitor size={12} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${device === 'mobile' ? 'bg-charcoal text-white' : 'text-stone-400'}`}
              >
                <Smartphone size={12} /> Mobile
              </button>
            </div>
            {previewSrc && (
              <a
                href={previewSrc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
              >
                Open <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden flex justify-center">
            <iframe
              key={previewSrc + device}
              src={previewSrc}
              title="Email preview"
              className="bg-white transition-all duration-300"
              style={{ width: device === 'mobile' ? 390 : '100%', height: 720, border: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
