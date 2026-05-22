import React, { useState, useEffect, useMemo } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Place, PlaceCategory, PlaceStatus, ClaimRequest, VerificationStatus, PerkStatus, ReservationProvider, BookingStatus } from '../types';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, XCircle, Mail, Gift, Upload } from 'lucide-react';
import { curatedPlaces } from '../data/curatedPlaces';
import { cn } from '../lib/utils';
import { OnboardingAdminPanel } from './OnboardingAdminPanel';
import { VenueOutreachPanel } from './VenueOutreachPanel';
import { AdminFoundation } from './AdminFoundation';
import { AdminShelters } from './AdminShelters';
import { AdminEmailTemplates } from './AdminEmailTemplates';
import { AdminFeatureFlags } from './AdminFeatureFlags';
import { AdminCRM } from './AdminCRM';

const PLACE_CATEGORIES: PlaceCategory[] = [
  'Parks / green areas',
  'Dog-friendly cafes',
  'Dog-friendly restaurants',
  'Pet shops',
  'Veterinary clinics',
  'Grooming services',
  'Pet-friendly hotels',
  'Pet-friendly coworking spaces',
  'Beaches',
  'Other',
];

const PLACE_CITIES: Place['city'][] = ['Barcelona', 'Miami', 'New York City'];

const PLACE_STATUSES: PlaceStatus[] = [
  'Pending verification',
  'Community recommended',
  'Claimed',
  'Verified',
  'Rejected',
];

const RESERVATION_PROVIDERS: ReservationProvider[] = ['None', 'OpenTable', 'Direct', 'Other'];
const BOOKING_STATUSES: BookingStatus[] = ['Not available', 'Pending', 'Active'];

type AdminTab = 'places' | 'claims' | 'applications' | 'blog' | 'posts' | 'users' | 'creators' | 'onboarding' | 'outreach' | 'foundation' | 'shelters' | 'features' | 'crm' | 'emails';

interface AdminProps {
  onBack?: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('places');
  const [places, setPlaces] = useState<Place[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allPets, setAllPets] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [creatorForm, setCreatorForm] = useState<any>({});
  const [editingCreator, setEditingCreator] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    totalPets: 0,
    pendingClaims: 0,
  });
  const [placeFilter, setPlaceFilter] = useState<{ city: string; category: string; status: string }>({
    city: 'all', category: 'all', status: 'all',
  });
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [inlineEmail, setInlineEmail] = useState<{ id: string; value: string } | null>(null);
  const [inlineWebsite, setInlineWebsite] = useState<{ id: string; value: string } | null>(null);
  const [autofillBusy, setAutofillBusy] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);

  const importSeedPlaces = async () => {
    if (!window.confirm(`Import ${curatedPlaces.length} curated places into Firestore? Existing docs won't be duplicated by name+city.`)) return;
    const existingNames = new Set(places.map(p => `${p.name}||${p.city}`));
    const toImport = curatedPlaces.filter(p => !existingNames.has(`${p.name}||${p.city}`));
    if (toImport.length === 0) { window.alert('All curated places are already in Firestore.'); return; }
    setImportProgress({ done: 0, total: toImport.length });
    let done = 0;
    for (const place of toImport) {
      await addDoc(collection(db, 'places'), { ...place, createdAt: new Date().toISOString() });
      done++;
      setImportProgress({ done, total: toImport.length });
    }
    setImportProgress(null);
    await fetchData();
    window.alert(`Done. ${done} places imported.`);
  };
  const scrapeWebsite = async () => {
    if (!formData.website) return;
    setScraping(true);
    try {
      const res = await fetch('/api/scrape-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.website }),
      });
      const data = await res.json();
      if (data.error) { window.alert(data.error); return; }
      setFormData((prev: any) => ({
        ...prev,
        ...(data.email && !prev.contactEmail ? { contactEmail: data.email } : {}),
        ...(data.phone && !prev.phone ? { phone: data.phone } : {}),
        ...(data.instagram && !prev.instagram ? { instagram: data.instagram } : {}),
      }));
    } catch {
      window.alert('Could not reach the scraper service.');
    } finally {
      setScraping(false);
    }
  };

  const userByUid = useMemo(() => {
    const map = new Map<string, { email?: string; displayName?: string }>();
    users.forEach(u => map.set(u.uid || u.id, { email: u.email, displayName: u.displayName }));
    return map;
  }, [users]);

  const resetFormData = () => {
    if (activeTab === 'places') {
      setFormData({
        name: '',
        category: 'Dog-friendly restaurants' as PlaceCategory,
        tags: [] as PlaceCategory[],
        city: 'Barcelona',
        address: '',
        lat: 0,
        lng: 0,
        phone: '',
        website: '',
        instagram: '',
        contactEmail: '',
        description: '',
        utility: '',
        petFriendlyNotes: '',
        image: '',
        rating: 5,
        status: 'Pending verification' as PlaceStatus,
        isHidden: false,
      });
    } else if (activeTab === 'blog') {
      setFormData({
        title: '',
        location: '',
        tag: 'Pet Friendly',
        author: '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        content: '',
        image: ''
      });
    }
  };

  useEffect(() => {
    resetFormData();
    fetchData();
  }, [activeTab]);

  // Stats (Total Users / Onboarded / Total Pets / Pending Claims) live in
  // the page header above the tab bar — they need to be populated regardless
  // of which tab is active. Fetch them once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [usersSnap, petsSnap, claimsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'pets')),
          getDocs(collection(db, 'claim_requests')),
        ]);
        if (!active) return;
        const usersList = usersSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setStats({
          totalUsers: usersList.length,
          onboardedUsers: usersList.filter((u: any) => u.onboarded).length,
          totalPets: petsSnap.size,
          pendingClaims: claimsSnap.docs.filter(d => (d.data() as any).status === 'Pending review').length,
        });
      } catch (err) {
        console.warn('Admin stats fetch failed', err);
      }
    })();
    return () => { active = false; };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'places') {
        const querySnapshot = await getDocs(collection(db, 'places'));
        setPlaces(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place)));
      } else if (activeTab === 'claims') {
        const [claimsSnap, usersSnap, placesSnap] = await Promise.all([
          getDocs(collection(db, 'claim_requests')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'places')),
        ]);
        setClaims(claimsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClaimRequest)));
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
        setPlaces(placesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Place)));
        setStats(prev => ({ ...prev, pendingClaims: claimsSnap.docs.filter(d => (d.data() as any).status === 'Pending review').length }));
      } else if (activeTab === 'blog') {
        const querySnapshot = await getDocs(collection(db, 'blog_posts'));
        setBlogPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'posts') {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        setCommunityPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'applications') {
        const querySnapshot = await getDocs(collection(db, 'partner_applications'));
        setApplications(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'users') {
        // Merged CRM: fetch users + every pet so each row can show breeds.
        const [usersSnap, petsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'pets')),
        ]);
        const fetchedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const fetchedPets = petsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(fetchedUsers);
        setAllPets(fetchedPets);
        setStats(prev => ({
          ...prev,
          totalUsers: fetchedUsers.length,
          onboardedUsers: fetchedUsers.filter((u: any) => u.onboarded).length,
          totalPets: fetchedPets.length,
        }));
      } else if (activeTab === 'creators') {
        const snap = await getDocs(collection(db, 'creators'));
        setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = useMemo(() => places.filter(p =>
    (placeFilter.city === 'all' || p.city === placeFilter.city) &&
    (placeFilter.category === 'all' || p.category === placeFilter.category) &&
    (placeFilter.status === 'all' || p.status === placeFilter.status)
  ), [places, placeFilter]);

  const updatePlaceField = async (id: string, patch: Partial<Place>) => {
    try {
      await updateDoc(doc(db, 'places', id), { ...patch, updatedAt: new Date().toISOString() });
      fetchData();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `places/${id}`);
    }
  };

  const autofillFromWebsite = async (place: Place) => {
    if (!place.website) { window.alert('Add a website first.'); return; }
    setAutofillBusy(place.id);
    try {
      const res = await fetch('/api/scrape-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: place.website }),
      });
      const data = await res.json();
      if (data.error) { window.alert(data.error); return; }
      const patch: Partial<Place> = {};
      if (data.email && !place.contactEmail) patch.contactEmail = data.email;
      if (data.phone && !place.phone) patch.phone = data.phone;
      if (data.instagram && !place.instagram) patch.instagram = data.instagram;
      if (Object.keys(patch).length === 0) {
        window.alert('Nothing new found on the website (or fields already filled).');
        return;
      }
      await updatePlaceField(place.id, patch);
    } catch {
      window.alert('Could not reach the scraper service.');
    } finally {
      setAutofillBusy(null);
    }
  };

  const inviteToVerify = async (place: Place) => {
    if (!auth.currentUser) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/invite-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ placeId: place.id }),
      });
      const data = await res.json();
      if (!data.success) {
        window.alert(data.error || 'Could not send invitation.');
        return;
      }
      const noteParts = [
        `Invitation issued to ${data.recipient}.`,
        data.delivered ? 'Email delivered via provider.' : `Email NOT sent: ${data.skippedReason || 'unknown reason'}. Copy the link below and send manually.`,
        '',
        data.claimUrl,
      ];
      window.alert(noteParts.join('\n'));
      fetchData();
    } catch (e) {
      console.error('inviteToVerify failed', e);
      window.alert('Could not reach the invitation service.');
    }
  };

  const setVerification = async (place: Place, status: VerificationStatus, alsoMarkPartner = false) => {
    if (!auth.currentUser) return;
    const now = new Date().toISOString();
    const patch: Partial<Place> = {
      verificationStatus: status,
      ...(status === 'verified' ? { approvedAt: now, approvedBy: auth.currentUser.email || 'admin', status: 'Verified' as PlaceStatus } : {}),
      ...(status === 'rejected' ? { rejectedAt: now, rejectedBy: auth.currentUser.email || 'admin' } : {}),
      ...(alsoMarkPartner ? { partnerStatus: 'active_partner' } : {}),
    };
    await updatePlaceField(place.id, patch);
  };

  const setPerkStatus = async (place: Place, status: PerkStatus) => {
    if (!auth.currentUser) return;
    const now = new Date().toISOString();
    const patch: Partial<Place> = {
      perkStatus: status,
      ...(status === 'perk_active' ? { perkApprovedAt: now, perkApprovedBy: auth.currentUser.email || 'admin' } : {}),
      ...(status === 'perk_rejected' ? { perkRejectedAt: now, perkRejectedBy: auth.currentUser.email || 'admin' } : {}),
    };
    await updatePlaceField(place.id, patch);
  };

  const reviewClaim = async (claim: ClaimRequest, decision: 'Approved' | 'Rejected', alsoVerify = false) => {
    try {
      await updateDoc(doc(db, 'claim_requests', claim.id), {
        status: decision,
        reviewedAt: new Date().toISOString(),
      });
      if (decision === 'Approved' && claim.placeId) {
        await updateDoc(doc(db, 'places', claim.placeId), {
          status: alsoVerify ? 'Verified' : 'Claimed',
          claimedBy: claim.userId,
          claimApprovedAt: new Date().toISOString(),
          contactEmail: claim.businessEmail,
          updatedAt: new Date().toISOString(),
        });
      }
      fetchData();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `claim_requests/${claim.id}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const collectionName = activeTab === 'places' ? 'places' : 'blog_posts';
      if (isEditing && isEditing !== 'new') {
        await updateDoc(doc(db, collectionName, isEditing), formData);
      } else {
        await addDoc(collection(db, collectionName), formData);
      }
      setIsEditing(null);
      resetFormData();
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        const collectionName = activeTab === 'places' ? 'places' : 'blog_posts';
        await deleteDoc(doc(db, collectionName, id));
        fetchData();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${activeTab}/${id}`);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8 animate-fade-in font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
           {onBack && (
             <button 
               onClick={onBack}
               className="flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors font-bold uppercase tracking-widest text-[10px] mb-6"
             >
               <ArrowLeft size={14} /> Back to Dashboard
             </button>
           )}
           <h1 className="text-4xl md:text-3xl font-bold tracking-tighter">Back Office</h1>
           
           <div className="grid grid-cols-3 gap-4 w-full max-w-xl py-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Total Users</p>
                <p className="text-2xl font-black text-charcoal">{stats.totalUsers}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Onboarded</p>
                <p className="text-2xl font-black text-green-500">{stats.onboardedUsers}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Total Pets</p>
                <p className="text-2xl font-black text-charcoal">{stats.totalPets}</p>
              </div>
           </div>

            <div className="flex flex-wrap gap-2">
              {([
                ['places', 'Places'],
                ['foundation', 'Foundation'],
                ['shelters', 'Shelters'],
                ['crm', 'CRM'],
                ['outreach', 'Outreach'],
                ['claims', stats.pendingClaims > 0 ? `Claims (${stats.pendingClaims})` : 'Claims'],
                ['applications', 'Partner Apps'],
                ['onboarding', 'Onboarding'],
                ['blog', 'Travel Hub'],
                ['posts', 'Community'],
                ['users', stats.totalUsers > 0 ? `Users (${stats.totalUsers})` : 'Users'],
                ['creators', 'Creators'],
                ['emails', 'Emails'],
                ['features', 'Features'],
              ] as [AdminTab, string][]).map(([tabId, label]) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tabId ? 'bg-charcoal text-white shadow-xl' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                >
                  {label}
                </button>
              ))}
           </div>
        </div>
        {!isEditing && (activeTab === 'places' || activeTab === 'blog') && (
          <div className="flex items-center gap-3">
            {activeTab === 'places' && (
              <button
                onClick={importSeedPlaces}
                disabled={!!importProgress}
                className="border border-stone-200 text-charcoal px-5 py-3 rounded-full flex items-center gap-2 font-bold hover:bg-stone-50 active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                {importProgress
                  ? <><Loader2 size={16} className="animate-spin" /> {importProgress.done}/{importProgress.total}</>
                  : <><Upload size={16} /> Import seed data</>
                }
              </button>
            )}
            <button
              onClick={() => setIsEditing('new')}
              className="bg-charcoal text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-all shadow-xl text-sm"
            >
              <Plus size={18} /> New {activeTab === 'places' ? 'Place' : 'Story'}
            </button>
          </div>
        )}
      </header>

      {isEditing && (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-stone-50 space-y-8 animate-fade-in">
           <div className="flex justify-between items-center border-b border-stone-50 pb-6">
              <h2 className="text-2xl font-bold italic">
                {isEditing === 'new' ? 'New Entry' : 'Edit Entry'} <span className="text-stone-300 not-italic ml-2">/ {activeTab === 'places' ? 'Venue' : 'Travel Hub'}</span>
              </h2>
              <button onClick={() => setIsEditing(null)} className="text-stone-300 hover:text-charcoal p-2"><X size={24}/></button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeTab === 'places' ? (
                <>
                  <Input label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                  <Select label="City" value={formData.city} onChange={v => setFormData({...formData, city: v})} options={PLACE_CITIES} />
                  <Select label="Primary Category" value={formData.category} onChange={v => setFormData({...formData, category: v})} options={PLACE_CATEGORIES} />
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Additional Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {PLACE_CATEGORIES.map(cat => {
                        const selected = (formData.tags || []).includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              const current: PlaceCategory[] = formData.tags || [];
                              setFormData({...formData, tags: selected ? current.filter((c: PlaceCategory) => c !== cat) : [...current, cat]});
                            }}
                            className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border", selected ? 'bg-charcoal text-white border-charcoal' : 'bg-stone-50 text-stone-400 border-stone-100 hover:border-stone-300')}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Select label="Status" value={formData.status} onChange={v => setFormData({...formData, status: v})} options={PLACE_STATUSES} />
                  <Input label="Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                  <div className="grid grid-cols-2 gap-4">
                     <Input label="Latitude" value={formData.lat} onChange={v => setFormData({...formData, lat: parseFloat(v) || 0})} />
                     <Input label="Longitude" value={formData.lng} onChange={v => setFormData({...formData, lng: parseFloat(v) || 0})} />
                  </div>
                  <Input label="Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input label="Website" value={formData.website} onChange={v => setFormData({...formData, website: v})} />
                    </div>
                    <button
                      type="button"
                      disabled={!formData.website || scraping}
                      onClick={scrapeWebsite}
                      className="mb-0.5 px-4 py-3 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-charcoal font-bold text-[10px] uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {scraping ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Auto-fill
                    </button>
                  </div>
                  <Input label="Instagram" value={formData.instagram} onChange={v => setFormData({...formData, instagram: v})} />
                  <Input label="Contact Email" value={formData.contactEmail} onChange={v => setFormData({...formData, contactEmail: v})} />
                  <Input label="Image URL" value={formData.image} onChange={v => setFormData({...formData, image: v})} />
                  <div className="flex items-center gap-4 bg-muted p-4 rounded-2xl md:col-span-2">
                     <input
                      type="checkbox"
                      checked={!!formData.isHidden}
                      onChange={e => setFormData({...formData, isHidden: e.target.checked})}
                      className="w-6 h-6 accent-charcoal"
                     />
                     <div>
                        <p className="text-sm font-bold">Hide from public site</p>
                        <p className="text-[10px] text-stone-400">Place stays in the database but is not shown on Explore.</p>
                     </div>
                  </div>
                  <Input label="Description" value={formData.description} onChange={v => setFormData({...formData, description: v})} textArea />
                  <Input label="Concierge note (utility)" value={formData.utility} onChange={v => setFormData({...formData, utility: v})} textArea />
                  <div className="md:col-span-2">
                    <Input label="Pet-friendly notes" value={formData.petFriendlyNotes} onChange={v => setFormData({...formData, petFriendlyNotes: v})} textArea />
                  </div>

                  <div className="md:col-span-2 mt-4 p-5 rounded-2xl border border-stone-100 bg-stone-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-stone-500">Reservations</p>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400">Powered by OpenTable</span>
                    </div>
                    <Input
                      label="OpenTable reservation URL"
                      value={formData.openTableUrl ?? ''}
                      onChange={v => setFormData({ ...formData, openTableUrl: v })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Reservation provider"
                        value={formData.reservationProvider ?? 'None'}
                        onChange={v => setFormData({ ...formData, reservationProvider: v })}
                        options={RESERVATION_PROVIDERS}
                      />
                      <Select
                        label="Booking status"
                        value={formData.bookingStatus ?? 'Not available'}
                        onChange={v => setFormData({ ...formData, bookingStatus: v })}
                        options={BOOKING_STATUSES}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 italic">
                      Affiliate / campaign metadata can be added later — empty by default.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Input label="Story Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                  <Input label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <Input label="Category/Tag" value={formData.tag} onChange={v => setFormData({...formData, tag: v})} />
                  <Input label="Author" value={formData.author} onChange={v => setFormData({...formData, author: v})} />
                  <Input label="Publish Date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                  <Input label="Image URL" value={formData.image} onChange={v => setFormData({...formData, image: v})} />
                  <div className="md:col-span-2">
                    <Input label="Full Content" value={formData.content} onChange={v => setFormData({...formData, content: v})} textArea />
                  </div>
                </>
              )}
           </div>

           <button 
             onClick={handleSave}
             className="w-full bg-charcoal text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all text-lg shadow-xl"
           >
             <Save size={20} /> {isEditing === 'new' ? 'Confirm & Create' : 'Save Changes'}
           </button>
        </div>
      )}

      {activeTab === 'foundation' ? (
        <AdminFoundation />
      ) : activeTab === 'shelters' ? (
        <AdminShelters />
      ) : activeTab === 'features' ? (
        <AdminFeatureFlags />
      ) : activeTab === 'crm' ? (
        <AdminCRM />
      ) : activeTab === 'emails' ? (
        <AdminEmailTemplates />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
           <div className="col-span-full py-10 flex flex-col items-center gap-4">
             <Loader2 size={32} className="animate-spin text-charcoal" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Synchronizing data...</p>
           </div>
         ) : activeTab === 'places' ? <>
           <div className="col-span-full -mb-2 flex flex-wrap gap-3 items-center">
             <FilterSelect label="City" value={placeFilter.city} onChange={v => setPlaceFilter(f => ({...f, city: v}))} options={['all', ...PLACE_CITIES]} />
             <FilterSelect label="Category" value={placeFilter.category} onChange={v => setPlaceFilter(f => ({...f, category: v}))} options={['all', ...PLACE_CATEGORIES]} />
             <FilterSelect label="Status" value={placeFilter.status} onChange={v => setPlaceFilter(f => ({...f, status: v}))} options={['all', ...PLACE_STATUSES]} />
             <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-stone-300">{filteredPlaces.length} of {places.length}</span>
           </div>
           <div className="col-span-full overflow-x-auto rounded-2xl border border-stone-100 bg-white shadow-sm">
             <table className="w-full text-[11px] border-collapse">
               <thead>
                 <tr className="bg-stone-50 text-[9px] font-black uppercase tracking-widest text-stone-400">
                   <th className="text-left px-4 py-3">Name</th>
                   <th className="text-left px-4 py-3">City</th>
                   <th className="text-left px-4 py-3">Category / Tags</th>
                   <th className="text-left px-4 py-3">Status</th>
                   <th className="text-left px-4 py-3">Verification</th>
                   <th className="text-left px-4 py-3">Website</th>
                   <th className="text-left px-4 py-3">Contact Email</th>
                   <th className="text-left px-4 py-3">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredPlaces.map((place, i) => (
                   <tr key={place.id} className={cn("border-t border-stone-50 hover:bg-stone-50/50 transition-colors", i % 2 === 0 ? 'bg-white' : 'bg-stone-50/20')}>
                     <td className="px-4 py-2.5 font-semibold text-charcoal max-w-[180px] truncate" title={place.name}>{place.name}</td>
                     <td className="px-4 py-2.5 text-stone-500 whitespace-nowrap">{place.city}</td>
                     <td className="px-4 py-2.5 max-w-[180px]">
                       <p className="text-stone-400 truncate" title={place.category}>{place.category}</p>
                       {place.tags && place.tags.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                           {place.tags.map(tag => (
                             <span key={tag} className="text-[8px] font-bold uppercase tracking-widest bg-stone-100 text-stone-400 rounded-full px-1.5 py-0.5 whitespace-nowrap">{tag}</span>
                           ))}
                         </div>
                       )}
                     </td>
                     <td className="px-4 py-2.5">
                       <select
                         value={place.status}
                         onChange={e => updatePlaceField(place.id, { status: e.target.value as PlaceStatus })}
                         className="text-[9px] font-black uppercase tracking-widest bg-stone-50 border border-stone-100 rounded-full px-2 py-1 outline-none focus:ring-2 focus:ring-stone-200"
                       >
                         {PLACE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                     </td>
                     <td className="px-4 py-2.5">
                       {place.verificationStatus && place.verificationStatus !== 'not_verified' ? (
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 whitespace-nowrap",
                           place.verificationStatus === 'verified' && 'bg-[#EBF1E9] text-[#7A8C6E]',
                           place.verificationStatus === 'pending_review' && 'bg-amber-50 text-amber-700',
                           place.verificationStatus === 'invitation_sent' && 'bg-stone-100 text-stone-500',
                           place.verificationStatus === 'claim_requested' && 'bg-blue-50 text-blue-700',
                           place.verificationStatus === 'rejected' && 'bg-red-50 text-red-500',
                         )}>
                           {place.verificationStatus.replace(/_/g, ' ')}
                         </span>
                       ) : <span className="text-stone-300">—</span>}
                     </td>
                     <td className="px-4 py-2.5 min-w-[200px]">
                       {inlineWebsite?.id === place.id ? (
                         <input
                           autoFocus
                           type="url"
                           value={inlineWebsite.value}
                           onChange={e => setInlineWebsite({ id: place.id, value: e.target.value })}
                           onBlur={async (e) => {
                             const val = e.target.value.trim();
                             if (val !== (place.website || '')) {
                               await updatePlaceField(place.id, { website: val });
                             }
                             setInlineWebsite(null);
                           }}
                           onKeyDown={e => {
                             if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                             if (e.key === 'Escape') setInlineWebsite(null);
                           }}
                           placeholder="https://example.com"
                           className="w-full border border-stone-300 rounded-lg px-2 py-1 text-[11px] outline-none focus:ring-2 focus:ring-charcoal"
                         />
                       ) : (
                         <button
                           onClick={() => setInlineWebsite({ id: place.id, value: place.website || '' })}
                           className={cn("text-left truncate max-w-[180px] hover:underline", place.website ? 'text-charcoal' : 'text-stone-300 italic')}
                           title={place.website || 'Add website…'}
                         >
                           {place.website ? place.website.replace(/^https?:\/\//, '') : 'Add website…'}
                         </button>
                       )}
                     </td>
                     <td className="px-4 py-2.5 min-w-[180px]">
                       {inlineEmail?.id === place.id ? (
                         <input
                           autoFocus
                           type="email"
                           value={inlineEmail.value}
                           onChange={e => setInlineEmail({ id: place.id, value: e.target.value })}
                           onBlur={async (e) => {
                             const val = e.target.value;
                             if (val !== place.contactEmail) {
                               await updatePlaceField(place.id, { contactEmail: val });
                             }
                             setInlineEmail(null);
                           }}
                           onKeyDown={e => {
                             if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                             if (e.key === 'Escape') setInlineEmail(null);
                           }}
                           className="w-full border border-stone-300 rounded-lg px-2 py-1 text-[11px] outline-none focus:ring-2 focus:ring-charcoal"
                         />
                       ) : (
                         <button
                           onClick={() => setInlineEmail({ id: place.id, value: place.contactEmail || '' })}
                           className={cn("text-left truncate max-w-[160px] hover:underline", place.contactEmail ? 'text-charcoal' : 'text-stone-300 italic')}
                         >
                           {place.contactEmail || 'Add email…'}
                         </button>
                       )}
                     </td>
                     <td className="px-4 py-2.5">
                       <div className="flex items-center gap-1.5">
                         <button
                           onClick={() => autofillFromWebsite(place)}
                           disabled={!place.website || autofillBusy === place.id}
                           title={place.website ? 'Scrape website for email/phone/instagram' : 'Add a website first'}
                           className="bg-stone-50 hover:bg-stone-100 disabled:bg-stone-50 disabled:text-stone-300 text-stone-500 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed"
                         >
                           {autofillBusy === place.id ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />} Auto-fill
                         </button>
                         <button
                           onClick={() => inviteToVerify(place)}
                           disabled={!place.contactEmail}
                           title={place.contactEmail ? 'Send invitation email' : 'Click email field to add an address first'}
                           className="bg-charcoal hover:bg-stone-700 disabled:bg-stone-100 disabled:text-stone-300 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed"
                         >
                           <Mail size={10} /> Invite
                         </button>
                         <button
                           onClick={() => setVerification(place, 'verified', true)}
                           disabled={place.verificationStatus !== 'pending_review' && place.verificationStatus !== 'claim_requested'}
                           title="Approve"
                           className="p-1.5 rounded-lg bg-[#EBF1E9] hover:bg-[#7A8C6E]/20 disabled:bg-stone-50 disabled:text-stone-300 text-[#7A8C6E] transition-colors disabled:cursor-not-allowed"
                         >
                           <CheckCircle2 size={13} />
                         </button>
                         <button
                           onClick={() => setVerification(place, 'rejected')}
                           disabled={place.verificationStatus === 'rejected'}
                           title="Reject"
                           className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 disabled:bg-stone-50 disabled:text-stone-300 text-red-400 transition-colors disabled:cursor-not-allowed"
                         >
                           <XCircle size={13} />
                         </button>
                         <button onClick={() => handleEdit(place)} title="Edit" className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-500 transition-colors">
                           <Edit2 size={13} />
                         </button>
                         <button
                           onClick={() => updatePlaceField(place.id, { isHidden: !place.isHidden })}
                           title={place.isHidden ? 'Unhide' : 'Hide'}
                           className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-400 transition-colors"
                         >
                           {place.isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                         </button>
                         <button onClick={() => handleDelete(place.id)} title="Delete" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                           <Trash2 size={13} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </> : activeTab === 'outreach' ? (
           <VenueOutreachPanel />
         ) : activeTab === 'applications' ? (
           <div className="col-span-full overflow-x-auto bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-black tracking-widest text-stone-300 border-b border-stone-50">
                    <th className="pb-4">Business</th>
                    <th className="pb-4">Contact</th>
                    <th className="pb-4">Submitted</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Policies & Perks</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {applications.map(app => (
                    <tr key={app.id} className="text-sm align-top">
                      <td className="py-4">
                        <div className="font-bold italic text-charcoal">{app.businessName}</div>
                        <div className="text-[10px] font-bold text-stone-400 mt-1">{app.category} • {app.city}</div>
                        <div className="text-[10px] text-stone-400 mt-1">{app.address}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-stone-600">{app.contactName}</div>
                        <div className="text-xs text-stone-500 mt-1">{app.email}</div>
                        {app.website && <a href={app.website} target="_blank" rel="noreferrer" className="text-brand-orange text-[10px] block mt-1 hover:underline">Website</a>}
                      </td>
                      <td className="py-4 text-xs text-stone-500">
                        {app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-stone-50 rounded-full text-[9px] uppercase font-black tracking-widest">
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 max-w-sm">
                        <div className="text-xs">{app.policy}</div>
                        {app.suggestedPerk && (
                          <div className="text-xs mt-2"><strong className="text-brand-orange">Perk:</strong> {app.suggestedPerk}</div>
                        )}
                      </td>
                      <td className="py-4">
                         {app.status === 'pending' && (
                           <div className="flex gap-2">
                             <button onClick={async () => {
                               try {
                                 await updateDoc(doc(db, 'partner_applications', app.id), { status: 'verified' });
                                 setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'verified' } : a));
                               } catch (err) {
                                 console.error(err);
                               }
                             }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                               <CheckCircle2 size={16} />
                             </button>
                             <button onClick={async () => {
                               try {
                                 await updateDoc(doc(db, 'partner_applications', app.id), { status: 'rejected' });
                                 setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a));
                               } catch (err) {
                                 console.error(err);
                               }
                             }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                               <XCircle size={16} />
                             </button>
                           </div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
         ) : activeTab === 'claims' ? (
           <ClaimsPanel claims={claims} userByUid={userByUid} placesById={Object.fromEntries(places.map(p => [p.id, p]))} onReview={reviewClaim} />
         ) : activeTab === 'onboarding' ? (
           <OnboardingAdminPanel />
         ) : activeTab === 'blog' ? blogPosts.map(post => (
           <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-stone-50 shadow-soft group hover:shadow-xl transition-all">
              <div className="aspect-video rounded-[1.5rem] overflow-hidden mb-6 bg-stone-50">
                 <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
              </div>
              <h3 className="font-bold text-lg leading-tight italic line-clamp-2">{post.title}</h3>
              <div className="flex gap-4 mt-2">
                <p className="text-[9px] uppercase font-bold tracking-widest text-stone-300">{post.location}</p>
                <p className="text-[9px] uppercase font-bold tracking-widest text-charcoal">{post.tag}</p>
              </div>
              
              <div className="mt-8 flex gap-3 border-t border-stone-50 pt-6">
                 <button onClick={() => handleEdit(post)} className="flex-1 bg-stone-50 hover:bg-stone-100 p-3 rounded-xl flex items-center justify-center gap-2 text-charcoal font-bold text-[10px] uppercase tracking-widest transition-colors">
                    <Edit2 size={12} /> Edit
                 </button>
                 <button onClick={() => handleDelete(post.id)} className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl flex items-center justify-center transition-colors">
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
         )) : activeTab === 'users' ? (
           <div className="col-span-full overflow-x-auto bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-black tracking-widest text-stone-300 border-b border-stone-50">
                    <th className="pb-4">User</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Billing</th>
                    <th className="pb-4">Pets · breed</th>
                    <th className="pb-4">Joined</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.map(user => {
                    const pets = allPets.filter(p => p.userId === user.id);
                    return (
                    <tr key={user.id} className="text-sm align-top">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold overflow-hidden">
                            {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.displayName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold">{user.displayName}</p>
                            <p className="text-[10px] text-stone-400">@{user.username} • {user.email}</p>
                            {(user.localHub || user.homeCity) && (
                              <p className="text-[10px] text-stone-400">
                                📍 {user.localHub ? `Hub: ${user.localHub}` : ''}
                                {user.localHub && user.homeCity ? ' · ' : ''}
                                {user.homeCity ? `Lives: ${user.homeCity}` : ''}
                              </p>
                            )}
                            {user.bio && <p className="text-[10px] text-stone-400 italic max-w-[240px] line-clamp-2">{user.bio}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          user.onboarded ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {user.onboarded ? "Onboarded" : "Incomplete"}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-stone-400">{user.userType}</td>
                      <td className="py-4">
                        {(() => {
                          const plan = user.memberPlan || 'free';
                          const m = user.membership;
                          const planLabel: Record<string, string> = { free: 'Free', local: 'Local', plus: 'Travel', travel: 'Travel', black: 'Black' };
                          const statusColor: Record<string, string> = {
                            on_trial: 'text-blue-600', active: 'text-green-600', past_due: 'text-amber-600',
                            cancelled: 'text-stone-400', unpaid: 'text-red-500', expired: 'text-stone-400',
                          };
                          return (
                            <div className="space-y-0.5 text-[11px]">
                              <p className="font-bold">{planLabel[plan] || plan}</p>
                              {m?.status && (
                                <p className={cn("font-medium", statusColor[m.status] || 'text-stone-400')}>{m.status.replace('_', ' ')}</p>
                              )}
                              {m?.billingProvider && (
                                <p className="text-stone-400">{m.billingProvider}</p>
                              )}
                              {m?.trialEndsAt && m.status === 'on_trial' && (
                                <p className="text-stone-400">Trial ends {new Date(m.trialEndsAt).toLocaleDateString()}</p>
                              )}
                              {m?.currentPeriodEnd && m.status !== 'on_trial' && (
                                <p className="text-stone-400">Period end {new Date(m.currentPeriodEnd).toLocaleDateString()}</p>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-4">
                        {pets.length === 0 ? (
                          <span className="text-[10px] text-stone-300 italic">No pets yet</span>
                        ) : (
                          <ul className="space-y-1">
                            {pets.map(pet => (
                              <li key={pet.id}>
                                <a
                                  href={`/pet/${pet.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 group hover:bg-stone-50 rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors"
                                  title={`Open ${pet.name || 'pet'} profile`}
                                >
                                  <span className="text-[14px] leading-none">
                                    {pet.type === 'Dog' ? '🐕' : pet.type === 'Cat' ? '🐈' : '🐾'}
                                  </span>
                                  <span className="text-charcoal font-bold text-[12px] group-hover:underline underline-offset-2">{pet.name || 'Unnamed'}</span>
                                  {pet.breed && (
                                    <span className="text-[9px] uppercase tracking-widest text-stone-400 bg-stone-50 rounded-full px-2 py-0.5">
                                      {pet.breed}
                                    </span>
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-4 text-xs text-stone-400 whitespace-nowrap">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={async () => {
                            if(confirm("Remove user?")) {
                              try {
                                await deleteDoc(doc(db, 'users', user.id));
                                fetchData();
                              } catch (error) {
                                handleFirestoreError(error, OperationType.DELETE, `users/${user.id}`);
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
           </div>
         ) : activeTab === 'creators' ? (
            <div className="col-span-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold italic">Creator Partners ({creators.length})</h3>
                <button
                  onClick={() => { setEditingCreator('new'); setCreatorForm({}); }}
                  className="bg-charcoal text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                >
                  + Add Creator
                </button>
              </div>

              {editingCreator && (
                <div className="bg-white p-8 rounded-[2rem] border border-stone-100 space-y-6">
                  <h4 className="font-bold italic text-xl border-b border-stone-100 pb-4">
                    {editingCreator === 'new' ? 'New Creator' : 'Edit Creator'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Name" value={creatorForm.name} onChange={v => setCreatorForm({...creatorForm, name: v})} />
                    <Input label="Email" value={creatorForm.email} onChange={v => setCreatorForm({...creatorForm, email: v})} />
                    <Input label="City" value={creatorForm.city} onChange={v => setCreatorForm({...creatorForm, city: v})} />
                    <Input label="Referral Code (uppercase)" value={creatorForm.referralCode} onChange={v => setCreatorForm({...creatorForm, referralCode: v.toUpperCase()})} />
                    <Input label="Instagram handle" value={creatorForm.instagram} onChange={v => setCreatorForm({...creatorForm, instagram: v})} />
                    <Input label="TikTok handle" value={creatorForm.tiktok} onChange={v => setCreatorForm({...creatorForm, tiktok: v})} />
                    <Input label="Website" value={creatorForm.website} onChange={v => setCreatorForm({...creatorForm, website: v})} />
                    <Input label="Profile URL" value={creatorForm.profileUrl} onChange={v => setCreatorForm({...creatorForm, profileUrl: v})} />
                    <Input label="Commission %" value={creatorForm.commissionPercent} onChange={v => setCreatorForm({...creatorForm, commissionPercent: Number(v)})} />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status</label>
                      <select
                        value={creatorForm.status || 'invited'}
                        onChange={e => setCreatorForm({...creatorForm, status: e.target.value})}
                        className="w-full bg-muted border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        {['invited', 'accepted', 'active', 'paused'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={async () => {
                        if (!creatorForm.name || !creatorForm.email || !creatorForm.referralCode) {
                          alert('Name, email and referral code are required.'); return;
                        }
                        const now = new Date().toISOString();
                        if (editingCreator === 'new') {
                          await addDoc(collection(db, 'creators'), { ...creatorForm, commissionPercent: Number(creatorForm.commissionPercent || 10), status: creatorForm.status || 'invited', createdAt: now, updatedAt: now });
                        } else {
                          await updateDoc(doc(db, 'creators', editingCreator), { ...creatorForm, commissionPercent: Number(creatorForm.commissionPercent), updatedAt: now });
                        }
                        const snap = await getDocs(collection(db, 'creators'));
                        setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                        setEditingCreator(null);
                        setCreatorForm({});
                      }}
                      className="bg-charcoal text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                      Save
                    </button>
                    <button onClick={() => { setEditingCreator(null); setCreatorForm({}); }} className="px-8 py-3 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-widest">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creators.map(creator => (
                  <div key={creator.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg italic">{creator.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{creator.city}</p>
                      </div>
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full', {
                        'bg-green-50 text-green-700': creator.status === 'active',
                        'bg-yellow-50 text-yellow-700': creator.status === 'invited' || creator.status === 'accepted',
                        'bg-stone-100 text-stone-500': creator.status === 'paused',
                      })}>{creator.status}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between"><span className="text-stone-400 font-bold uppercase tracking-widest text-[9px]">Email</span><span className="truncate text-charcoal">{creator.email}</span></div>
                      <div className="flex justify-between"><span className="text-stone-400 font-bold uppercase tracking-widest text-[9px]">Code</span><span className="font-black tracking-widest text-charcoal">{creator.referralCode}</span></div>
                      <div className="flex justify-between"><span className="text-stone-400 font-bold uppercase tracking-widest text-[9px]">Commission</span><span className="text-charcoal">{creator.commissionPercent ?? 10}%</span></div>
                      {creator.signupsCount != null && <div className="flex justify-between"><span className="text-stone-400 font-bold uppercase tracking-widest text-[9px]">Signups</span><span className="text-charcoal">{creator.signupsCount}</span></div>}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setEditingCreator(creator.id); setCreatorForm(creator); }} className="flex-1 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete creator?')) {
                            await deleteDoc(doc(db, 'creators', creator.id));
                            setCreators(prev => prev.filter(c => c.id !== creator.id));
                          }
                        }}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         ) : communityPosts.map(post => (
           <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-stone-50 shadow-soft group">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold">
                    {post.displayName?.[0] || 'U'}
                 </div>
                 <div>
                    <p className="text-xs font-bold">{post.displayName}</p>
                    <p className="text-[8px] uppercase tracking-widest text-stone-300">Channel: {post.channel}</p>
                 </div>
              </div>
              <p className="text-sm line-clamp-3 text-charcoal/80 mb-6">{post.content}</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-stone-50">
                 <span className="text-[8px] font-bold text-stone-400 px-2 py-1 bg-stone-50 rounded italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                    Pet: {post.petName}
                 </span>
                  <button onClick={async () => {
                   if (window.confirm("Delete this user post?")) {
                     try {
                       await deleteDoc(doc(db, 'posts', post.id));
                       fetchData();
                     } catch (error) {
                       handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
                     }
                   }
                 }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 size={14} />
                 </button>
              </div>
           </div>
         ))}
      </div>
      )}
    </div>
  );
};

function Input({ label, value, onChange, textArea }: { label: string, value: any, onChange: (v: string) => void, textArea?: boolean }) {
  const baseCls = "w-full bg-muted border-none rounded-2xl p-4 outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-stone-300";
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</label>
      {textArea ? (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className={`${baseCls} min-h-[120px]`}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className={baseCls}
        />
      )}
    </div>
  );
}

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: readonly T[] }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</label>
      <select
        value={value || options[0]}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-muted border-none rounded-2xl p-4 outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-stone-300 font-bold text-sm"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-full px-4 py-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-[11px] font-bold text-charcoal outline-none focus:outline-none focus-visible:outline-none capitalize"
      >
        {options.map(o => <option key={o} value={o}>{o === 'all' ? 'All' : o}</option>)}
      </select>
    </label>
  );
}

interface ClaimsPanelProps {
  claims: ClaimRequest[];
  userByUid: Map<string, { email?: string; displayName?: string }>;
  placesById: Record<string, Place>;
  onReview: (claim: ClaimRequest, decision: 'Approved' | 'Rejected', alsoVerify?: boolean) => Promise<void>;
}

function ClaimsPanel({ claims, userByUid, placesById, onReview }: ClaimsPanelProps) {
  if (!claims.length) {
    return (
      <div className="col-span-full py-8 text-center space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">No claim requests yet</p>
        <p className="text-stone-400 italic">Claims submitted from the public site will land here for review.</p>
      </div>
    );
  }
  const sorted = [...claims].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Pending review' ? -1 : 1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
  return (
    <div className="col-span-full space-y-4">
      {sorted.map(claim => {
        const submitter = userByUid.get(claim.userId);
        const place = placesById[claim.placeId];
        const isPending = claim.status === 'Pending review';
        return (
          <div key={claim.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-soft space-y-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black tracking-tight">{claim.placeName || place?.name || claim.placeId}</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    claim.status === 'Pending review' && 'bg-amber-50 text-amber-700',
                    claim.status === 'Approved' && 'bg-green-50 text-green-700',
                    claim.status === 'Rejected' && 'bg-stone-100 text-stone-500',
                  )}>{claim.status}</span>
                  {place && <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current: {place.status}</span>}
                </div>
                <p className="text-[11px] text-stone-400">Submitted {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : 'unknown date'}</p>
              </div>
              {isPending && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onReview(claim, 'Approved', false)}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <CheckCircle2 size={13} /> Approve as Claimed
                  </button>
                  <button
                    onClick={() => onReview(claim, 'Approved', true)}
                    className="bg-[#EBF1E9] text-[#7A8C6E] hover:opacity-80 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <CheckCircle2 size={13} /> Approve & Verify
                  </button>
                  <button
                    onClick={() => onReview(claim, 'Rejected')}
                    className="bg-red-50 text-red-500 hover:bg-red-100 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[12px]">
              <ClaimRow label="Business" value={claim.businessName} />
              <ClaimRow label="Contact" value={claim.contactPerson} />
              <ClaimRow label="Email" value={<a className="text-charcoal underline" href={`mailto:${claim.businessEmail}`}>{claim.businessEmail}</a>} />
              <ClaimRow label="Phone" value={claim.phone || '—'} />
              <ClaimRow label="Website" value={claim.website ? <a className="text-charcoal underline" href={claim.website} target="_blank" rel="noreferrer">{claim.website}</a> : '—'} />
              <ClaimRow label="Submitter" value={`${submitter?.displayName || '—'} · ${submitter?.email || claim.userId}`} />
              {claim.message && (
                <div className="md:col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-1">Message</p>
                  <p className="text-stone-500 italic leading-relaxed">"{claim.message}"</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClaimRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">{label}</p>
      <p className="text-charcoal font-medium truncate">{value}</p>
    </div>
  );
}
