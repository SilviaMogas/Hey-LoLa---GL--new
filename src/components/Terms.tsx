import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface TermsProps {
  onBack: () => void;
}

export const Terms: React.FC<TermsProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-charcoal">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <BrandLogo size="md" />
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-4 border-l border-stone-100 pl-4">
            Terms of Service
          </span>
        </div>
      </header>

      <main className="pt-12 pb-10 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="space-y-4">
             <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center">
                <FileText className="text-charcoal" size={24} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-black tracking-tighter italic">Terms of Service.</h1>
             <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px]">Effective Date: April 2024</p>
          </div>

          <div className="prose prose-stone max-w-none space-y-8 text-stone-600">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">1. Acceptance of Terms</h2>
              <p>By accessing HeyLola., you agree to be bound by these terms. We provide a platform for pet parents to manage documentation and discover verified spots.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">2. User Responsibilities</h2>
              <p>Users are responsible for the accuracy of the medical and vaccination data uploaded to their pet's Digital Passport. HeyLola. is a tool for organization and does not replace official veterinary advice.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">3. Verified Content</h2>
              <p>While we strive for 100% accuracy in our verified spots, policies at venues may change. Users should always confirm with venues directly for specific pet requirements.</p>
            </section>

            <section className="space-y-4">
               <h2 className="text-xl font-bold text-charcoal">4. Premium Services</h2>
               <p>Access to certain Hub features and emergency support may require a subscription as outlined in our service levels.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
