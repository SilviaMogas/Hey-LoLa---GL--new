import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Place, PlaceCategory } from '../types';
import { curatedPlaces } from '../data/curatedPlaces';
import { ArrowLeft, Loader2, MapPin, Heart, Trash2, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface SavedPlacesProps {
  user: { uid: string } | null;
  onBack: () => void;
  onExplore: () => void;
}

const CATEGORY_ORDER: PlaceCategory[] = [
  'Parks / green areas',
  'Beaches',
  'Dog-friendly cafes',
  'Dog-friendly restaurants',
  'Pet-friendly hotels',
  'Pet shops',
  'Veterinary clinics',
  'Grooming services',
  'Pet-friendly coworking spaces',
  'Other',
];

interface FavRow {
  favId: string;
  place: Place;
}

export const SavedPlaces: React.FC<SavedPlacesProps> = ({ user, onBack, onExplore }) => {
  const [rows, setRows] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const favSnap = await getDocs(query(collection(db, 'favorites'), where('userId', '==', user.uid)));
        const favEntries = favSnap.docs.map(d => ({ favId: d.id, placeId: d.data().placeId as string }));

        const placesSnapshot = await getDocs(collection(db, 'places'));
        const dbPlaces = placesSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Place[];
        const seedPlaces = curatedPlaces.map((cp) => ({
          ...cp,
          id: `curated_${cp.name.replace(/\s/g, '_')}`,
        })) as Place[];

        const byId = new Map<string, Place>();
        dbPlaces.forEach(p => byId.set(p.id, p));
        seedPlaces.forEach(p => { if (!byId.has(p.id)) byId.set(p.id, p); });

        const resolved: FavRow[] = favEntries
          .map(({ favId, placeId }) => {
            const place = byId.get(placeId);
            return place ? { favId, place } : null;
          })
          .filter((row): row is FavRow => row !== null);

        if (active) setRows(resolved);
      } catch (err) {
        console.error('SavedPlaces load error', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  // Group rows: city → category → rows[]
  const grouped = useMemo(() => {
    const cities = new Map<string, Map<string, FavRow[]>>();
    rows.forEach((row) => {
      const city = row.place.city || 'Other';
      const category = row.place.category || 'Other';
      if (!cities.has(city)) cities.set(city, new Map());
      const byCat = cities.get(city)!;
      if (!byCat.has(category)) byCat.set(category, []);
      byCat.get(category)!.push(row);
    });
    return cities;
  }, [rows]);

  const totalCount = rows.length;

  const handleRemove = async (favId: string) => {
    setRemoving(favId);
    try {
      await deleteDoc(doc(db, 'favorites', favId));
      setRows(prev => prev.filter(r => r.favId !== favId));
    } catch (err) {
      console.error('Remove favorite error', err);
      alert('Could not remove this saved spot.');
    } finally {
      setRemoving(null);
    }
  };

  const sortCategories = (categories: string[]) =>
    [...categories].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a as PlaceCategory);
      const bi = CATEGORY_ORDER.indexOf(b as PlaceCategory);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in font-boutique">
      <header className="flex items-end justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={12} /> Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-serif italic text-charcoal tracking-tight">Saved spots</h1>
          <p className="text-sm text-stone-500 italic">
            {totalCount === 0 ? 'No saved spots yet — start exploring.' : `${totalCount} curated spot${totalCount === 1 ? '' : 's'}, organised by city.`}
          </p>
        </div>
        <button
          onClick={onExplore}
          className="bg-charcoal text-white px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors flex items-center gap-2"
        >
          <Compass size={14} /> Explore
        </button>
      </header>

      {totalCount === 0 ? (
        <section className="bg-white border border-stone-100 rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-xl bg-stone-50/60 flex items-center justify-center text-stone-300">
            <Heart size={20} />
          </div>
          <p className="text-base font-light text-stone-400 italic">Tap the heart on any venue to save it here.</p>
        </section>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([city, byCategory]) => (
            <section key={city} className="space-y-4">
              <div className="flex items-end justify-between border-b border-stone-100 pb-2">
                <h2 className="text-2xl font-serif italic text-charcoal tracking-tight">{city}</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-300">
                  {Array.from(byCategory.values()).reduce((sum, list) => sum + list.length, 0)} saved
                </span>
              </div>

              <div className="space-y-6">
                {sortCategories(Array.from(byCategory.keys())).map((category) => {
                  const list = byCategory.get(category) || [];
                  return (
                    <div key={`${city}-${category}`} className="space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                        {category} <span className="text-stone-300">· {list.length}</span>
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {list.map(({ favId, place }) => (
                          <motion.li
                            key={favId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-stone-100 rounded-2xl p-3 flex gap-3 items-center shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-50">
                              <img
                                src={place.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=200&q=80'}
                                alt={place.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif italic text-base text-charcoal/90 truncate">{place.name}</h4>
                              <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] truncate flex items-center gap-1">
                                <MapPin size={10} />
                                {place.neighborhood ? `${place.neighborhood}, ${place.city}` : place.city}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemove(favId)}
                              disabled={removing === favId}
                              title="Remove from saved"
                              className="p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            >
                              {removing === favId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
