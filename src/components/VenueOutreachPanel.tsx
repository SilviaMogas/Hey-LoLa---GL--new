import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Place } from '../types';
import {
  Check, Copy, Download, ExternalLink, Globe, Instagram,
  Loader2, Mail, MessageCircle, Phone, RefreshCw, UserCheck, X,
} from 'lucide-react';
import { cn } from '../lib/utils';

type EnrichFilter =
  | 'all'
  | 'missing_email'
  | 'enriched'
  | 'outreach_ready'
  | 'needs_review'
  | 'contacted'
  | 'follow_up_due';

const FILTER_LABELS: Record<EnrichFilter, string> = {
  all: 'All',
  missing_email: 'Missing email',
  enriched: 'Enriched',
  outreach_ready: 'Outreach ready',
  needs_review: 'Needs review',
  contacted: 'Contacted',
  follow_up_due: 'Follow-up due',
};

const ENRICHMENT_BADGE: Record<string, string> = {
  enriched: 'bg-green-50 text-green-700',
  partial: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-500',
  needs_manual_review: 'bg-purple-50 text-purple-700',
};

const CLAIM_LINK = 'https://www.heylola.co/start';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function getBestEmail(place: Place): string | undefined {
  return place.primaryEmail || place.contactEmail || undefined;
}

function generateEmail(place: Place): { subject: string; body: string } {
  const name = place.claimedByName?.split(' ')[0] || 'there';
  return {
    subject: 'Claim your Hey Lola profile',
    body: `Hi ${name},\n\nI'm Silvia, founder of Hey Lola.\n\nWe're launching a trusted pet-friendly community and city guide, starting in Miami, for pet parents, animal lovers, and local venues.\n\nI came across ${place.name} and thought it could be a great fit for the Hey Lola network.\n\nDuring launch, selected venues can claim their Hey Lola profile for free.\n\nClaim your profile here:\n${CLAIM_LINK}\n\nOnce submitted, we'll review the venue before marking it as claimed or verified.\n\nYou can also let us know if you'd like to offer a small perk to Hey Lola members, such as a welcome treat, small discount, priority booking, or special experience.\n\nBest,\nSilvia\nFounder, Hey Lola\nhttps://www.heylola.co/`,
  };
}

function generateDM(place: Place): string {
  return `Hi! I'm Silvia, founder of Hey Lola.\n\nWe're launching a pet-friendly community and city guide in Miami for pet parents, animal lovers, and trusted local places.\n\nI came across ${place.name} and thought it could be a great fit.\n\nDuring launch, selected venues can claim their Hey Lola profile for free and join the early partner network.\n\nWould you like me to send you the claim link?`;
}

interface DiffItem {
  field: string;
  label: string;
  current: string;
  suggested: string;
}

interface OutreachState {
  place: Place;
  email: { subject: string; body: string };
  dm: string;
}

interface DiffState {
  place: Place;
  diff: DiffItem[];
}

// ── Main panel ───────────────────────────────────────────────────────────────

export const VenueOutreachPanel: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EnrichFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const [outreach, setOutreach] = useState<OutreachState | null>(null);
  const [diff, setDiff] = useState<DiffState | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'places'));
      setPlaces(snap.docs.map(d => ({ id: d.id, ...d.data() } as Place)));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const today = todayISO();

  function matchFilter(p: Place, f: EnrichFilter): boolean {
    switch (f) {
      case 'missing_email': return !getBestEmail(p);
      case 'enriched': return p.enrichmentStatus === 'enriched' || p.enrichmentStatus === 'partial';
      case 'outreach_ready': return p.outreachReady === true;
      case 'needs_review': return p.enrichmentStatus === 'needs_manual_review';
      case 'contacted': return !!p.lastContactedDate;
      case 'follow_up_due': return !!p.nextFollowUpDate && p.nextFollowUpDate <= today;
      default: return true;
    }
  }

  const filteredPlaces = useMemo(
    () => places.filter(p => matchFilter(p, filter)),
    [places, filter, today],
  );

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<EnrichFilter, number>> = {};
    (Object.keys(FILTER_LABELS) as EnrichFilter[]).forEach(f => {
      counts[f] = f === 'all' ? places.length : places.filter(p => matchFilter(p, f)).length;
    });
    return counts;
  }, [places, today]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(key);
      setTimeout(() => setCopyFeedback(null), 2200);
    } catch { /* ignore */ }
  };

  const enrichVenue = async (place: Place): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    setEnrichingIds(prev => new Set([...prev, place.id]));
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/enrich-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ placeId: place.id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Enrichment failed.');
        return;
      }
      if (data.diff && data.diff.length > 0) {
        setDiff({ place, diff: data.diff });
      }
      await fetchPlaces();
    } catch {
      alert('Could not reach the enrichment service.');
    } finally {
      setEnrichingIds(prev => { const s = new Set(prev); s.delete(place.id); return s; });
    }
  };

  const markContacted = async (place: Place) => {
    const now = todayISO();
    const followUp = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    try {
      await updateDoc(doc(db, 'places', place.id), {
        verificationStatus: 'invitation_sent',
        lastContactedDate: now,
        nextAction: 'follow_up',
        nextFollowUpDate: followUp,
        updatedAt: new Date().toISOString(),
      });
      await fetchPlaces();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `places/${place.id}`);
    }
  };

  const applyDiff = async (item: DiffItem) => {
    if (!diff) return;
    try {
      await updateDoc(doc(db, 'places', diff.place.id), {
        [item.field]: item.suggested,
        updatedAt: new Date().toISOString(),
      });
      setDiff(prev => prev
        ? { ...prev, diff: prev.diff.filter(d => d.field !== item.field) }
        : null,
      );
      await fetchPlaces();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `places/${diff.place.id}`);
    }
  };

  const ignoreDiff = (item: DiffItem) => {
    setDiff(prev => prev
      ? { ...prev, diff: prev.diff.filter(d => d.field !== item.field) }
      : null,
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.size === filteredPlaces.length && filteredPlaces.length > 0
        ? new Set()
        : new Set(filteredPlaces.map(p => p.id)),
    );
  };

  const bulkEnrich = async () => {
    setBulkBusy(true);
    for (const id of selectedIds) {
      const place = places.find(p => p.id === id);
      if (place) await enrichVenue(place);
    }
    setBulkBusy(false);
  };

  const bulkMarkContacted = async () => {
    setBulkBusy(true);
    for (const id of selectedIds) {
      const place = places.find(p => p.id === id);
      if (place) await markContacted(place);
    }
    setBulkBusy(false);
    setSelectedIds(new Set());
  };

  const exportCSV = () => {
    const rows = selectedIds.size > 0
      ? places.filter(p => selectedIds.has(p.id))
      : filteredPlaces;
    const headers = [
      'Name', 'City', 'Neighborhood', 'Category',
      'Primary Email', 'Website', 'Instagram', 'Phone',
      'Verification Status', 'Enrichment Status', 'Outreach Ready',
      'Last Contacted', 'Next Follow-up',
    ];
    const body = rows.map(p =>
      [
        p.name, p.city, p.neighborhood || '', p.category,
        getBestEmail(p) || '',
        p.website || '',
        p.instagram || '',
        p.phone || '',
        p.verificationStatus || '',
        p.enrichmentStatus || 'not_started',
        p.outreachReady ? 'Yes' : 'No',
        p.lastContactedDate || '',
        p.nextFollowUpDate || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','),
    );
    const csv = [headers.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heylola-outreach-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = selectedIds.size === filteredPlaces.length && filteredPlaces.length > 0;

  return (
    <div className="col-span-full space-y-5">

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as EnrichFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
              filter === f
                ? 'bg-charcoal text-white shadow-lg'
                : 'bg-white text-stone-400 border border-stone-200 hover:bg-stone-50',
            )}
          >
            {FILTER_LABELS[f]}
            {(filterCounts[f] ?? 0) > 0 && (
              <span className="ml-1.5 opacity-60">({filterCounts[f]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 bg-charcoal text-white rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3 shadow-2xl">
          <span className="text-sm font-bold">{selectedIds.size} selected</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button
              onClick={bulkEnrich}
              disabled={bulkBusy}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              {bulkBusy ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Enrich selected
            </button>
            <button
              onClick={bulkMarkContacted}
              disabled={bulkBusy}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <UserCheck size={11} /> Mark contacted
            </button>
            <button
              onClick={exportCSV}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <Download size={11} /> Export CSV
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Select-all row */}
      {!loading && filteredPlaces.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors"
          >
            <div className={cn(
              'w-4 h-4 rounded border flex items-center justify-center transition-colors',
              allSelected ? 'bg-charcoal border-charcoal' : 'border-stone-300',
            )}>
              {allSelected && <Check size={10} className="text-white" />}
            </div>
            Select all
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">
            {filteredPlaces.length} venues
          </span>
          <button
            onClick={exportCSV}
            className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors"
          >
            <Download size={12} /> Export
          </button>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-stone-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : filteredPlaces.length === 0 ? (
        <p className="text-sm text-stone-400 italic px-2 py-10 text-center">
          No venues match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlaces.map(place => (
            <VenueCard
              key={place.id}
              place={place}
              selected={selectedIds.has(place.id)}
              enriching={enrichingIds.has(place.id)}
              copyFeedback={copyFeedback}
              today={today}
              onSelect={() => toggleSelect(place.id)}
              onEnrich={() => enrichVenue(place)}
              onOutreach={() => setOutreach({
                place,
                email: generateEmail(place),
                dm: generateDM(place),
              })}
              onMarkContacted={() => markContacted(place)}
              onCopy={copy}
            />
          ))}
        </div>
      )}

      {/* Outreach modal */}
      {outreach && (
        <OutreachModal
          outreach={outreach}
          copyFeedback={copyFeedback}
          onCopy={copy}
          onMarkContacted={async () => { await markContacted(outreach.place); setOutreach(null); }}
          onClose={() => setOutreach(null)}
        />
      )}

      {/* Diff modal */}
      {diff && diff.diff.length > 0 && (
        <DiffModal
          diff={diff}
          onAccept={applyDiff}
          onIgnore={ignoreDiff}
          onClose={() => setDiff(null)}
        />
      )}
    </div>
  );
};

// ── Venue card ───────────────────────────────────────────────────────────────

interface VenueCardProps {
  place: Place;
  selected: boolean;
  enriching: boolean;
  copyFeedback: string | null;
  today: string;
  onSelect: () => void;
  onEnrich: () => void;
  onOutreach: () => void;
  onMarkContacted: () => void;
  onCopy: (text: string, key: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  place, selected, enriching, copyFeedback, today,
  onSelect, onEnrich, onOutreach, onMarkContacted, onCopy,
}) => {
  const email = getBestEmail(place);
  const isContacted = !!place.lastContactedDate;
  const isFollowUpDue = !!place.nextFollowUpDate && place.nextFollowUpDate <= today;

  return (
    <div className={cn(
      'bg-white rounded-[1.5rem] border p-5 space-y-4 transition-all flex flex-col',
      selected ? 'border-charcoal shadow-xl' : 'border-stone-100 shadow-sm hover:shadow-md',
      isFollowUpDue && 'ring-2 ring-amber-300',
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onSelect}
          aria-label={selected ? 'Deselect' : 'Select'}
          className={cn(
            'mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
            selected ? 'bg-charcoal border-charcoal' : 'border-stone-300',
          )}
        >
          {selected && <Check size={11} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-charcoal leading-tight text-sm truncate">{place.name}</h3>
            {place.enrichmentStatus && place.enrichmentStatus !== 'not_started' && (
              <span className={cn(
                'text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0',
                ENRICHMENT_BADGE[place.enrichmentStatus] ?? 'bg-stone-50 text-stone-400',
              )}>
                {place.enrichmentStatus.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            {place.category}
            {place.neighborhood && ` · ${place.neighborhood}`}
            {` · ${place.city}`}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-[11px] flex-1">
        {place.website && (
          <div className="flex items-center gap-2">
            <Globe size={11} className="text-stone-300 flex-shrink-0" />
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="text-charcoal hover:underline truncate"
            >
              {place.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {place.instagram && (
          <div className="flex items-center gap-2">
            <Instagram size={11} className="text-stone-300 flex-shrink-0" />
            <span className="text-stone-500 truncate">{place.instagram}</span>
          </div>
        )}
        {email ? (
          <div className="flex items-center gap-2">
            <Mail size={11} className="text-stone-300 flex-shrink-0" />
            <span className="text-charcoal truncate font-medium">{email}</span>
            <button
              onClick={() => onCopy(email, `email-${place.id}`)}
              className="ml-auto text-stone-300 hover:text-charcoal flex-shrink-0 p-0.5"
            >
              {copyFeedback === `email-${place.id}`
                ? <Check size={11} className="text-green-500" />
                : <Copy size={11} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Mail size={11} className="text-stone-200 flex-shrink-0" />
            <span className="text-stone-300 italic text-[10px]">No email found</span>
          </div>
        )}
        {place.phone && (
          <div className="flex items-center gap-2">
            <Phone size={11} className="text-stone-300 flex-shrink-0" />
            <span className="text-stone-500">{place.phone}</span>
          </div>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-1.5">
        {place.verificationStatus && (
          <span className={cn(
            'text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5',
            place.verificationStatus === 'verified' && 'bg-green-50 text-green-700',
            place.verificationStatus === 'pending_review' && 'bg-amber-50 text-amber-700',
            place.verificationStatus === 'invitation_sent' && 'bg-blue-50 text-blue-600',
            !['verified', 'pending_review', 'invitation_sent'].includes(place.verificationStatus) && 'bg-stone-100 text-stone-400',
          )}>
            {place.verificationStatus.replace(/_/g, ' ')}
          </span>
        )}
        {place.perkStatus && place.perkStatus !== 'no_perks' && (
          <span className="text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 bg-purple-50 text-purple-600">
            perk: {place.perkStatus.replace(/_/g, ' ')}
          </span>
        )}
        {isContacted && (
          <span className="text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 bg-sky-50 text-sky-600">
            contacted {fmtDate(place.lastContactedDate)}
          </span>
        )}
        {isFollowUpDue && (
          <span className="text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">
            follow-up due
          </span>
        )}
      </div>

      {place.nextAction && place.nextAction !== 'none' && (
        <p className="text-[10px] text-stone-400">
          Next:{' '}
          <span className="font-bold text-charcoal">{place.nextAction.replace(/_/g, ' ')}</span>
          {place.nextFollowUpDate && ` · ${fmtDate(place.nextFollowUpDate)}`}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-50">
        <button
          onClick={onEnrich}
          disabled={enriching || !place.website}
          title={!place.website ? 'Add a website first' : 'Enrich venue data'}
          className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-charcoal px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          {enriching
            ? <Loader2 size={11} className="animate-spin" />
            : <RefreshCw size={11} />}
          Enrich
        </button>
        <button
          onClick={onOutreach}
          className="flex items-center gap-1.5 bg-charcoal hover:bg-stone-700 text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <Mail size={11} /> Outreach
        </button>
        {place.instagram && (
          <button
            onClick={() => onCopy(generateDM(place), `dm-${place.id}`)}
            className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-charcoal px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            {copyFeedback === `dm-${place.id}`
              ? <Check size={11} className="text-green-500" />
              : <MessageCircle size={11} />}
            Copy DM
          </button>
        )}
        <button
          onClick={onMarkContacted}
          disabled={isContacted}
          title={isContacted ? `Contacted ${fmtDate(place.lastContactedDate)}` : 'Mark as contacted'}
          className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-charcoal px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ml-auto"
        >
          <UserCheck size={11} />
          {isContacted ? 'Contacted' : 'Mark contacted'}
        </button>
      </div>
    </div>
  );
};

// ── Outreach modal ───────────────────────────────────────────────────────────

interface OutreachModalProps {
  outreach: OutreachState;
  copyFeedback: string | null;
  onCopy: (text: string, key: string) => void;
  onMarkContacted: () => Promise<void>;
  onClose: () => void;
}

const OutreachModal: React.FC<OutreachModalProps> = ({
  outreach, copyFeedback, onCopy, onMarkContacted, onClose,
}) => {
  const { place, email, dm } = outreach;
  const toEmail = getBestEmail(place);
  const mailtoUrl = toEmail
    ? `mailto:${toEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-[2rem] px-6 py-4 border-b border-stone-100 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-bold italic">{place.name}</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
              {place.city} · {place.category}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-charcoal p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Email section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Email outreach</h4>
              <div className="flex gap-2 flex-wrap">
                {toEmail && mailtoUrl && (
                  <a
                    href={mailtoUrl}
                    onClick={() => onMarkContacted()}
                    className="flex items-center gap-1.5 bg-charcoal text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-700 transition-colors"
                  >
                    <ExternalLink size={11} /> Send email
                  </a>
                )}
                <button
                  onClick={() => onCopy(`Subject: ${email.subject}\n\n${email.body}`, 'email-full')}
                  className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-charcoal px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {copyFeedback === 'email-full'
                    ? <Check size={11} className="text-green-500" />
                    : <Copy size={11} />}
                  Copy email
                </button>
              </div>
            </div>
            {toEmail ? (
              <p className="text-[11px] text-stone-500">
                To: <span className="font-bold text-charcoal">{toEmail}</span>
              </p>
            ) : (
              <p className="text-[11px] text-amber-600 italic">
                No email found — enrich this venue first or add one manually.
              </p>
            )}
            <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subject</p>
              <p className="text-sm font-bold">{email.subject}</p>
              <hr className="border-stone-100" />
              <pre className="text-[12px] text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">
                {email.body}
              </pre>
            </div>
          </section>

          {/* Instagram DM */}
          {place.instagram && (
            <section className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Instagram DM · {place.instagram}
                </h4>
                <button
                  onClick={() => onCopy(dm, 'dm-modal')}
                  className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-charcoal px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {copyFeedback === 'dm-modal'
                    ? <Check size={11} className="text-green-500" />
                    : <Copy size={11} />}
                  Copy DM
                </button>
              </div>
              <div className="bg-stone-50 rounded-2xl p-4">
                <pre className="text-[12px] text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {dm}
                </pre>
              </div>
            </section>
          )}

          {/* Mark contacted */}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <button
              onClick={async () => { await onMarkContacted(); onClose(); }}
              className="w-full bg-charcoal text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors"
            >
              <UserCheck size={16} /> Mark as contacted
            </button>
            <p className="text-[10px] text-stone-400 text-center">
              Updates claim status · sets a 7-day follow-up reminder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Diff comparison modal ────────────────────────────────────────────────────

interface DiffModalProps {
  diff: DiffState;
  onAccept: (item: DiffItem) => Promise<void>;
  onIgnore: (item: DiffItem) => void;
  onClose: () => void;
}

const DiffModal: React.FC<DiffModalProps> = ({ diff, onAccept, onIgnore, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white rounded-t-[2rem] px-6 py-4 border-b border-stone-100 flex items-center justify-between z-10">
        <div>
          <h3 className="text-base font-bold italic">Review enriched data</h3>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest">{diff.place.name}</p>
        </div>
        <button onClick={onClose} className="text-stone-300 hover:text-charcoal p-2 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-[11px] text-stone-400 italic">
          These fields differ from what's already saved. Accept or ignore each suggestion.
        </p>
        {diff.diff.map(item => (
          <div key={item.field} className="bg-stone-50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{item.label}</p>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-1">Current</p>
                <p className="text-stone-500 break-all">{item.current || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Suggested</p>
                <p className="text-charcoal font-bold break-all">{item.suggested}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAccept(item)}
                className="flex-1 bg-charcoal text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-700 transition-colors flex items-center justify-center gap-1"
              >
                <Check size={11} /> Accept
              </button>
              <button
                onClick={() => onIgnore(item)}
                className="flex-1 bg-stone-100 text-stone-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          className="w-full border border-stone-200 text-stone-500 py-3 rounded-2xl font-bold text-sm hover:bg-stone-50 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  </div>
);
