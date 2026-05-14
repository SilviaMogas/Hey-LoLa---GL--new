import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Filter,
  KanbanSquare,
  ListChecks,
  Mail,
  Phone,
  Plus,
  StickyNote,
  Tag,
  X,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import {
  CRM_CATEGORY_LABEL,
  CRM_SOURCE_LABEL,
  CRM_STAGE_CHIP,
  CRM_STAGE_LABEL,
  CRM_STAGES,
  type CrmCategory,
  type CrmLead,
  type CrmSource,
  type CrmStage,
  type CrmTier,
} from '../data/crmLead';

type ViewMode = 'kanban' | 'list';

interface Filters {
  city: string;
  tier: 'all' | CrmTier;
  source: 'all' | CrmSource;
  search: string;
}

const EMPTY_FILTERS: Filters = { city: 'all', tier: 'all', source: 'all', search: '' };

const ADVANCE_LABEL: Partial<Record<CrmStage, string>> = {
  prospect: 'Mark contacted',
  contacted: 'Got a reply',
  replied: 'Book meeting',
  meeting: 'Start negotiation',
  negotiating: 'Mark signed',
  signed: 'Go live',
};

const NEXT_STAGE: Partial<Record<CrmStage, CrmStage>> = {
  prospect: 'contacted',
  contacted: 'replied',
  replied: 'meeting',
  meeting: 'negotiating',
  negotiating: 'signed',
  signed: 'live',
};

/**
 * Internal CRM surface, lives inside /admin. Manages everything venue /
 * ecommerce outreach: pipeline kanban + list view, per-lead detail panel
 * with notes, manual quick-add and stage transitions.
 *
 * Auto-ingest from /partners/onboard happens server-side via
 * /api/notify-partner-application (Admin SDK).
 */
export const AdminCRM: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [view, setView] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [activeLead, setActiveLead] = useState<CrmLead | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'crm_leads'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setLeads(
        snap.docs.map((d) => {
          const data = d.data() as Omit<CrmLead, 'id'>;
          return { id: d.id, ...data };
        }),
      );
    });
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.city && set.add(l.city));
    return Array.from(set).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filters.city !== 'all' && l.city !== filters.city) return false;
      if (filters.tier !== 'all' && l.tier !== filters.tier) return false;
      if (filters.source !== 'all' && l.source !== filters.source) return false;
      if (q) {
        const hay = [
          l.businessName,
          l.city,
          l.contact?.name,
          l.contact?.email,
          ...(l.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filters]);

  const byStage = useMemo(() => {
    const map = new Map<CrmStage, CrmLead[]>();
    CRM_STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((l) => map.get(l.stage)?.push(l));
    return map;
  }, [filtered]);

  const moveStage = async (lead: CrmLead, nextStage: CrmStage) => {
    await updateDoc(doc(db, 'crm_leads', lead.id), {
      stage: nextStage,
      lastTouchAt: Date.now(),
      lastTouchBy: user?.email || 'admin',
      updatedAt: serverTimestamp(),
    });
    if (activeLead?.id === lead.id) {
      setActiveLead({ ...lead, stage: nextStage });
    }
  };

  const addNote = async (lead: CrmLead, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const note = { at: Date.now(), by: user?.email || 'admin', text: trimmed };
    const nextNotes = [...(lead.notes || []), note];
    await updateDoc(doc(db, 'crm_leads', lead.id), {
      notes: nextNotes,
      lastTouchAt: note.at,
      lastTouchBy: note.by,
      updatedAt: serverTimestamp(),
    });
    if (activeLead?.id === lead.id) {
      setActiveLead({ ...lead, notes: nextNotes, lastTouchAt: note.at, lastTouchBy: note.by });
    }
  };

  const createLead = async (input: NewLeadInput) => {
    const now = Date.now();
    const payload = {
      businessName: input.businessName.trim(),
      category: input.category,
      tier: input.tier,
      city: input.city.trim(),
      contact: {
        name: input.contactName.trim(),
        role: input.contactRole.trim(),
        email: input.contactEmail.trim(),
        phone: input.contactPhone.trim(),
        ig: input.contactIg.trim(),
      },
      source: input.source,
      stage: 'prospect' as CrmStage,
      tags: input.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: [],
      createdAt: now,
      updatedAt: serverTimestamp(),
      createdBy: user?.email || 'admin',
    };
    await addDoc(collection(db, 'crm_leads'), payload);
  };

  return (
    <div className="col-span-full space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h2 className="font-serif italic text-2xl">CRM</h2>
          <p className="text-sm text-stone-500 font-light">
            {leads.length} lead{leads.length === 1 ? '' : 's'} in the pipeline.
            {' '}
            <span className="text-stone-400">
              {byStage.get('live')?.length ?? 0} live · {byStage.get('signed')?.length ?? 0} signed
              · {(byStage.get('meeting')?.length ?? 0) + (byStage.get('negotiating')?.length ?? 0)} in flight
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-2 rounded-full border border-stone-200 text-stone-600 hover:border-charcoal hover:text-charcoal transition-colors"
          >
            {view === 'kanban' ? <ListChecks size={12} /> : <KanbanSquare size={12} />}
            {view === 'kanban' ? 'List view' : 'Kanban view'}
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-2 rounded-full bg-charcoal text-white hover:bg-charcoal/85 transition-colors"
          >
            <Plus size={12} /> Add lead
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-black uppercase tracking-[0.3em]">
        <span className="inline-flex items-center gap-1.5 text-stone-400">
          <Filter size={11} /> Filter
        </span>
        <select
          value={filters.city}
          onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          className="border border-stone-200 rounded-full px-3 py-1.5 bg-white"
        >
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.tier === 'all' ? 'all' : String(filters.tier)}
          onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value === 'all' ? 'all' : (Number(e.target.value) as CrmTier) }))}
          className="border border-stone-200 rounded-full px-3 py-1.5 bg-white"
        >
          <option value="all">All tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <select
          value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value as Filters['source'] }))}
          className="border border-stone-200 rounded-full px-3 py-1.5 bg-white"
        >
          <option value="all">All sources</option>
          {Object.entries(CRM_SOURCE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder="Search name, email, tag"
          className="border border-stone-200 rounded-full px-3 py-1.5 bg-white normal-case tracking-normal font-medium text-xs min-w-[180px]"
        />
        {(filters.city !== 'all' || filters.tier !== 'all' || filters.source !== 'all' || filters.search) && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-stone-400 hover:text-charcoal underline-offset-4 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center space-y-2">
          <p className="text-sm text-stone-500 italic">No leads yet.</p>
          <p className="text-xs text-stone-400">
            Add manually or wait for /partners/onboard submissions — they auto-ingest as <code>inbound_form</code> leads.
          </p>
        </div>
      )}

      {/* Kanban or list */}
      {view === 'kanban' ? (
        <div className="overflow-x-auto -mx-2 pb-4">
          <div className="flex gap-3 px-2 min-w-max">
            {CRM_STAGES.map((stage) => {
              const lanes = byStage.get(stage) ?? [];
              return (
                <section key={stage} className="w-72 shrink-0 bg-stone-50 rounded-2xl p-3 space-y-2">
                  <header className="flex items-center justify-between px-1">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full ${CRM_STAGE_CHIP[stage]}`}>
                      {CRM_STAGE_LABEL[stage]}
                    </span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-stone-400">{lanes.length}</span>
                  </header>
                  <div className="space-y-2">
                    {lanes.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onOpen={() => setActiveLead(lead)}
                        onAdvance={NEXT_STAGE[stage] ? () => moveStage(lead, NEXT_STAGE[stage]!) : undefined}
                        advanceLabel={ADVANCE_LABEL[stage]}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onOpen={() => setActiveLead(lead)} />
          ))}
        </div>
      )}

      {activeLead && (
        <LeadDetail
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onMoveStage={(s) => moveStage(activeLead, s)}
          onAddNote={(t) => addNote(activeLead, t)}
        />
      )}

      {showAdd && <QuickAddModal onClose={() => setShowAdd(false)} onCreate={createLead} />}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────── */
/* Subcomponents                                                       */
/* ──────────────────────────────────────────────────────────────────── */

function LeadCard({
  lead,
  onOpen,
  onAdvance,
  advanceLabel,
}: {
  lead: CrmLead;
  onOpen: () => void;
  onAdvance?: () => void;
  advanceLabel?: string;
}) {
  return (
    <article className="bg-white rounded-xl border border-stone-100 p-3 space-y-2 hover:shadow-lg transition-shadow">
      <button
        type="button"
        onClick={onOpen}
        className="text-left w-full space-y-1"
      >
        <p className="font-serif italic text-base leading-tight">{lead.businessName}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          T{lead.tier} · {CRM_CATEGORY_LABEL[lead.category] || lead.category} · {lead.city || '—'}
        </p>
        {lead.contact?.name && (
          <p className="text-xs text-stone-500 font-light truncate">{lead.contact.name}</p>
        )}
        {lead.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {lead.tags.slice(0, 3).map((t, i) => (
              <span key={`${lead.id}-tag-${i}-${t}`} className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </button>
      {onAdvance && advanceLabel && (
        <button
          type="button"
          onClick={onAdvance}
          className="w-full inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] py-1.5 rounded-full border border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal transition-colors"
        >
          {advanceLabel} <ChevronRight size={11} />
        </button>
      )}
    </article>
  );
}

function LeadRow({ lead, onOpen }: { lead: CrmLead; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left bg-white rounded-xl border border-stone-100 px-4 py-3 hover:shadow-md transition-shadow flex items-center justify-between gap-3"
    >
      <div className="space-y-1 min-w-0">
        <p className="font-serif italic text-base leading-tight truncate">{lead.businessName}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          T{lead.tier} · {CRM_CATEGORY_LABEL[lead.category]} · {lead.city || '—'} · {CRM_SOURCE_LABEL[lead.source]}
        </p>
      </div>
      <span className={`shrink-0 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full ${CRM_STAGE_CHIP[lead.stage]}`}>
        {CRM_STAGE_LABEL[lead.stage]}
      </span>
      <ArrowRight size={14} className="text-stone-300 shrink-0" />
    </button>
  );
}

function LeadDetail({
  lead,
  onClose,
  onMoveStage,
  onAddNote,
}: {
  lead: CrmLead;
  onClose: () => void;
  onMoveStage: (s: CrmStage) => void;
  onAddNote: (text: string) => void;
}) {
  const [note, setNote] = useState('');
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <aside
        className="w-full sm:w-[520px] bg-white h-full overflow-y-auto p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
              T{lead.tier} · {CRM_CATEGORY_LABEL[lead.category]} · {lead.city || '—'}
            </p>
            <h3 className="font-serif italic text-3xl leading-tight">{lead.businessName}</h3>
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full ${CRM_STAGE_CHIP[lead.stage]}`}>
              {CRM_STAGE_LABEL[lead.stage]}
            </span>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-charcoal p-1" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {/* Contact */}
        <section className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Contact</h4>
          <div className="space-y-1 text-sm text-stone-600">
            {lead.contact?.name && <p>{lead.contact.name}{lead.contact.role ? ` · ${lead.contact.role}` : ''}</p>}
            {lead.contact?.email && (
              <p className="inline-flex items-center gap-1.5 text-stone-500">
                <Mail size={12} /> <a className="hover:underline" href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a>
              </p>
            )}
            {lead.contact?.phone && (
              <p className="inline-flex items-center gap-1.5 text-stone-500">
                <Phone size={12} /> {lead.contact.phone}
              </p>
            )}
            {lead.contact?.ig && (
              <p className="inline-flex items-center gap-1.5 text-stone-500">
                <Building2 size={12} /> @{lead.contact.ig.replace(/^@/, '')}
              </p>
            )}
            {!lead.contact?.name && !lead.contact?.email && !lead.contact?.phone && (
              <p className="text-xs text-stone-400 italic">No contact info yet.</p>
            )}
          </div>
        </section>

        {/* Tags */}
        {lead.tags?.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-1.5">
              <Tag size={11} /> Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((t, i) => (
                <span key={`${i}-${t}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 bg-stone-100 px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </section>
        )}

        {/* Stage transitions */}
        <section className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Move to stage</h4>
          <div className="flex flex-wrap gap-1.5">
            {CRM_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onMoveStage(s)}
                disabled={s === lead.stage}
                className={`text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-full border transition-colors ${
                  s === lead.stage
                    ? 'border-charcoal bg-charcoal text-white cursor-default'
                    : 'border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal'
                }`}
              >
                {CRM_STAGE_LABEL[s]}
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-1.5">
            <StickyNote size={11} /> Notes ({lead.notes?.length || 0})
          </h4>
          <div className="space-y-2">
            {(lead.notes || []).slice().reverse().map((n) => (
              <article key={n.at} className="rounded-lg border border-stone-100 bg-stone-50/60 p-3 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                  {new Date(n.at).toLocaleString()} · {n.by}
                </p>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{n.text}</p>
              </article>
            ))}
            {(!lead.notes || lead.notes.length === 0) && (
              <p className="text-xs text-stone-400 italic">No notes yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this lead…"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm h-20"
            />
            <button
              type="button"
              disabled={!note.trim()}
              onClick={() => { onAddNote(note); setNote(''); }}
              className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full bg-charcoal text-white hover:bg-charcoal/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save note
            </button>
          </div>
        </section>

        {/* Linkbacks */}
        {(lead.linkedPartnerApplicationId || lead.linkedPlaceId) && (
          <section className="space-y-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
            {lead.linkedPartnerApplicationId && <p>Linked partner_application: {lead.linkedPartnerApplicationId}</p>}
            {lead.linkedPlaceId && <p>Linked place: {lead.linkedPlaceId}</p>}
          </section>
        )}
      </aside>
    </div>
  );
}

interface NewLeadInput {
  businessName: string;
  category: CrmCategory;
  tier: CrmTier;
  city: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  contactIg: string;
  source: CrmSource;
  tags: string;
}

const EMPTY_INPUT: NewLeadInput = {
  businessName: '',
  category: 'restaurant',
  tier: 2,
  city: 'Miami',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  contactIg: '',
  source: 'cold',
  tags: '',
};

function QuickAddModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: NewLeadInput) => Promise<void>;
}) {
  const [input, setInput] = useState<NewLeadInput>(EMPTY_INPUT);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.businessName.trim()) return;
    setSaving(true);
    try {
      await onCreate(input);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof NewLeadInput>(k: K, v: NewLeadInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4"
      >
        <header className="flex items-center justify-between">
          <h3 className="font-serif italic text-2xl">Add lead</h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-charcoal p-1" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Business name *">
            <input type="text" required value={input.businessName} onChange={(e) => set('businessName', e.target.value)} className="apple-input" />
          </Field>
          <Field label="City">
            <input type="text" value={input.city} onChange={(e) => set('city', e.target.value)} className="apple-input" />
          </Field>
          <Field label="Tier">
            <select value={String(input.tier)} onChange={(e) => set('tier', Number(e.target.value) as CrmTier)} className="apple-input">
              <option value="1">Tier 1 — Premium</option>
              <option value="2">Tier 2 — Services</option>
              <option value="3">Tier 3 — Lifestyle / Retail</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={input.category} onChange={(e) => set('category', e.target.value as CrmCategory)} className="apple-input">
              {Object.entries(CRM_CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select value={input.source} onChange={(e) => set('source', e.target.value as CrmSource)} className="apple-input">
              {Object.entries(CRM_SOURCE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input type="text" value={input.tags} onChange={(e) => set('tags', e.target.value)} placeholder="wynwood, ecommerce" className="apple-input" />
          </Field>
          <Field label="Contact name">
            <input type="text" value={input.contactName} onChange={(e) => set('contactName', e.target.value)} className="apple-input" />
          </Field>
          <Field label="Contact role">
            <input type="text" value={input.contactRole} onChange={(e) => set('contactRole', e.target.value)} className="apple-input" />
          </Field>
          <Field label="Email">
            <input type="email" value={input.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className="apple-input" />
          </Field>
          <Field label="Phone">
            <input type="tel" value={input.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} className="apple-input" />
          </Field>
          <Field label="Instagram">
            <input type="text" value={input.contactIg} onChange={(e) => set('contactIg', e.target.value)} placeholder="@handle" className="apple-input" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 text-stone-500 hover:text-charcoal transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !input.businessName.trim()} className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full bg-charcoal text-white hover:bg-charcoal/85 disabled:opacity-40 transition-colors">
            {saving ? 'Saving…' : 'Save lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">{label}</span>
      {children}
    </label>
  );
}
