import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  OnboardingSubmission,
  OnboardingSubmissionStatus,
  VenueClaim,
  VenueClaimPerkStatus,
  VenueClaimStatus,
  VenueClaimVerificationStatus,
} from '../types';
import { Loader2 } from 'lucide-react';

type SubTab = 'pet_parents' | 'animal_lovers' | 'venues';

const SUBMISSION_STATUSES: OnboardingSubmissionStatus[] = ['new', 'contacted', 'active', 'archived'];
const CLAIM_STATUSES: VenueClaimStatus[] = ['claim_submitted', 'not_contacted', 'contacted', 'interested', 'claimed', 'rejected', 'no_response'];
const VERIFICATION_STATUSES: VenueClaimVerificationStatus[] = ['not_verified', 'pending_review', 'verified_manually', 'verified_by_claim'];
const PERK_STATUSES: VenueClaimPerkStatus[] = ['not_confirmed', 'no_perk', 'interested', 'perk_agreed', 'live'];

const fmtDate = (raw: any): string => {
  if (!raw) return '—';
  const d = raw?.toDate ? raw.toDate() : new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

export const OnboardingAdminPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('pet_parents');
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
  const [claims, setClaims] = useState<VenueClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subSnap, claimSnap] = await Promise.all([
        getDocs(query(collection(db, 'onboarding_submissions'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'venue_claims'), orderBy('createdAt', 'desc'))),
      ]);
      setSubmissions(subSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setClaims(claimSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const petParents = useMemo(() => submissions.filter((s) => s.type === 'pet_parent'), [submissions]);
  const animalLovers = useMemo(() => submissions.filter((s) => s.type === 'animal_lover'), [submissions]);

  const updateSubmissionStatus = async (id: string, status: OnboardingSubmissionStatus) => {
    try {
      await updateDoc(doc(db, 'onboarding_submissions', id), { status });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `onboarding_submissions/${id}`);
    }
  };

  const updateClaim = async (id: string, patch: Partial<VenueClaim>) => {
    try {
      await updateDoc(doc(db, 'venue_claims', id), patch);
      setClaims((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `venue_claims/${id}`);
    }
  };

  return (
    <div className="col-span-full space-y-6">
      <div className="flex flex-wrap gap-2">
        {([
          ['pet_parents', `Pet parents (${petParents.length})`],
          ['animal_lovers', `Animal lovers (${animalLovers.length})`],
          ['venues', `Venues (${claims.length})`],
        ] as [SubTab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              subTab === id ? 'bg-charcoal text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-stone-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : subTab === 'pet_parents' ? (
        <SubmissionTable
          rows={petParents}
          extraColumns={[
            { header: 'City', cell: (s) => s.city },
            { header: 'Pet', cell: (s) => `${s.petName ?? '—'} (${s.petType ?? '—'})` },
            { header: 'Founding club', cell: (s) => s.foundingClubInterest ?? '—' },
          ]}
          onUpdateStatus={updateSubmissionStatus}
        />
      ) : subTab === 'animal_lovers' ? (
        <SubmissionTable
          rows={animalLovers}
          extraColumns={[
            { header: 'City', cell: (s) => s.city },
            { header: 'Interests', cell: (s) => (s.interests || []).join(', ') || '—' },
          ]}
          onUpdateStatus={updateSubmissionStatus}
        />
      ) : (
        <VenueClaimsTable rows={claims} onUpdate={updateClaim} />
      )}
    </div>
  );
};

const SubmissionTable: React.FC<{
  rows: OnboardingSubmission[];
  extraColumns: { header: string; cell: (s: OnboardingSubmission) => React.ReactNode }[];
  onUpdateStatus: (id: string, status: OnboardingSubmissionStatus) => void;
}> = ({ rows, extraColumns, onUpdateStatus }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-stone-400 italic px-2">No submissions yet.</p>;
  }
  return (
    <div className="overflow-x-auto bg-white rounded-[2rem] shadow-soft border border-stone-100 p-6">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase font-black tracking-widest text-stone-300 border-b border-stone-50">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            {extraColumns.map((c) => <th key={c.header} className="pb-3">{c.header}</th>)}
            <th className="pb-3">Instagram</th>
            <th className="pb-3">Created</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {rows.map((s) => (
            <tr key={s.id} className="align-top">
              <td className="py-3 font-bold">{s.firstName} {s.lastName}</td>
              <td className="py-3 text-xs">{s.email}</td>
              {extraColumns.map((c) => <td key={c.header} className="py-3 text-xs">{c.cell(s)}</td>)}
              <td className="py-3 text-xs text-stone-400">{s.instagram || '—'}</td>
              <td className="py-3 text-xs text-stone-400 whitespace-nowrap">{fmtDate(s.createdAt)}</td>
              <td className="py-3">
                <select
                  value={s.status}
                  onChange={(e) => onUpdateStatus(s.id, e.target.value as OnboardingSubmissionStatus)}
                  className="text-xs border border-stone-200 rounded-full px-3 py-1 bg-white"
                >
                  {SUBMISSION_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VenueClaimsTable: React.FC<{
  rows: VenueClaim[];
  onUpdate: (id: string, patch: Partial<VenueClaim>) => void;
}> = ({ rows, onUpdate }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-stone-400 italic px-2">No venue claims yet.</p>;
  }
  return (
    <div className="space-y-4">
      {rows.map((c) => (
        <div key={c.id} className="bg-white rounded-[1.5rem] border border-stone-100 shadow-soft p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold italic">{c.businessName}</h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 rounded-full px-2 py-0.5">{c.category}</span>
            </div>
            <p className="text-xs text-stone-500">{c.address} · {c.city}</p>
            <p className="text-xs text-stone-400">{c.contactPerson} ({c.role || 'role —'}) · {c.email} · {c.phone}</p>
            <div className="flex flex-wrap gap-3 text-[10px] text-stone-400 uppercase tracking-widest pt-1">
              {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="hover:text-charcoal">Website</a>}
              {c.instagram && <span>{c.instagram}</span>}
              <span>Pet-friendly: {c.petFriendlyStatus}</span>
              <span>Perk interest: {c.perkInterest}</span>
            </div>
            {c.notes && <p className="text-xs text-stone-500 italic pt-1">"{c.notes}"</p>}
            <p className="text-[10px] text-stone-300 uppercase tracking-widest pt-1">Submitted {fmtDate(c.createdAt)}</p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatusSelect
              label="Claim"
              value={c.claimStatus}
              options={CLAIM_STATUSES}
              onChange={(v) => onUpdate(c.id, { claimStatus: v as VenueClaimStatus })}
            />
            <StatusSelect
              label="Verification"
              value={c.verificationStatus}
              options={VERIFICATION_STATUSES}
              onChange={(v) => onUpdate(c.id, { verificationStatus: v as VenueClaimVerificationStatus })}
            />
            <StatusSelect
              label="Perk"
              value={c.perkStatus}
              options={PERK_STATUSES}
              onChange={(v) => onUpdate(c.id, { perkStatus: v as VenueClaimPerkStatus })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className="space-y-1 block">
    <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs border border-stone-200 rounded-2xl px-3 py-2 bg-white"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </label>
);
