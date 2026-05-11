import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MapPin, X, ShieldAlert, Navigation } from 'lucide-react';
import { PetData } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  petData: PetData;
}

const RESOURCES = [
  {
    name: "Pet-Focused ER — 24/7",
    address: "7712 Biscayne Blvd, Miami",
    phone: "(305) 555-0123",
    dist: "1.2 mi"
  },
  {
    name: "Urgent Care Vet",
    address: "1221 Brickell Ave, Miami",
    phone: "(305) 555-0987",
    dist: "0.8 mi"
  }
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, petData }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close emergency panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-md cursor-default"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative z-10 border-2 border-stone-200"
          >
            {/* Header */}
            <div className="bg-charcoal p-8 sm:p-6 text-white flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={26} className="animate-pulse shrink-0" />
                  <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight leading-none">
                    HeyLola <span className="text-white/70 not-italic font-bold ml-1 text-lg">SOS</span>
                  </h2>
                </div>
                <p className="text-white/70 text-sm font-light italic">
                  Priority access for {petData?.name || 'your companion'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/15 p-3 rounded-2xl hover:bg-white/25 transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 sm:p-6 space-y-8">
              {/* Resource cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {RESOURCES.map((r, i) => (
                  <div key={i} className="bg-stone-50 p-6 sm:p-8 rounded-[2rem] border border-stone-100 space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-base font-black font-sans tracking-tight text-charcoal leading-tight">{r.name}</h3>
                      <span className="text-[9px] bg-white px-3 py-1 rounded-full font-black font-sans uppercase tracking-widest text-charcoal shrink-0 border border-stone-100">
                        {r.dist}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 italic flex items-center gap-1.5">
                      <MapPin size={11} className="shrink-0 text-stone-400" /> {r.address}
                    </p>
                    <div className="flex gap-2.5 pt-1">
                      <a
                        href={`tel:${r.phone}`}
                        className="flex-1 bg-charcoal text-white h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-stone-800 transition-all duration-500 shadow-md hover:shadow-xl"
                      >
                        <Phone size={13} /> Call Now
                      </a>
                      <button className="w-11 h-11 bg-white rounded-xl border border-stone-line flex items-center justify-center text-stone-300 hover:text-charcoal transition-colors">
                        <Navigation size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pet briefing */}
              {petData?.name && (
                <div className="bg-[#EBF1E9]/40 p-6 sm:p-8 rounded-2xl border border-[#7A8C6E]/10 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden rotate-[-3deg] border-4 border-white shadow-xl shrink-0 bg-stone-100">
                    <img
                      src={petData.photoURL || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300"}
                      alt={petData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <h4 className="text-lg font-serif italic text-charcoal/80">Companion Briefing</h4>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#7A8C6E]">
                      <p>Name <span className="block text-charcoal mt-0.5 normal-case font-medium">{petData.name}</span></p>
                      <p>Vax <span className="block text-charcoal mt-0.5 normal-case font-medium">{petData.vaxStatus}</span></p>
                      <p>Weight <span className="block text-charcoal mt-0.5 normal-case font-medium">{petData.currentWeight?.value || 'N/A'} kg</span></p>
                    </div>
                  </div>
                  <button className="bg-[#7A8C6E] text-white px-7 py-3.5 rounded-2xl text-[9px] font-black font-sans uppercase tracking-[0.2em] hover:shadow-lg transition-all shrink-0">
                    Digital ID
                  </button>
                </div>
              )}

              <p className="text-center text-[9px] text-stone-300 font-black font-sans uppercase tracking-[0.3em]">
                HeyLola Exclusive Support Network
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
