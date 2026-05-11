import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { resetCookieConsent } from './CookieBanner';

interface PrivacyProps {
  onBack: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onBack }) => {
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
            Privacy Policy
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
                <Shield className="text-charcoal" size={24} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-black tracking-tighter italic">Privacy Policy.</h1>
             <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 2024</p>
          </div>

          <div className="prose prose-stone max-w-none space-y-8 text-stone-600">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">1. Introduction</h2>
              <p>Welcome to HeyLola. Your privacy is paramount to us. This policy describes how we collect, use, and protect your data and the data of your companions.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">2. Data We Collect</h2>
              <p>We collect information you provide directly to us when creating a profile, registering a pet, or using our exploration tools. This includes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal identification (Name, Email)</li>
                <li>Pet documentation (Photos, Vaccination records, Microchip IDs)</li>
                <li>Location data (to provide verified pet-friendly spots)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">3. How We Use Data</h2>
              <p>Your data is used to provide the Digital Passport service, verify pet-friendly statuses, and personalize your experience in our Travel Hub.</p>
            </section>

            <section className="space-y-4">
               <h2 className="text-xl font-bold text-charcoal">4. Data Security</h2>
               <p>We implement high-fidelity security standards to protect your sensitive pet medical records and personal identity.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal">5. {t.cookies.sectionTitle}</h2>
              <p>{t.cookies.sectionBody}</p>
              <button
                onClick={resetCookieConsent}
                className="mt-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest border border-stone-300 text-charcoal hover:bg-stone-50 rounded-xl transition-colors"
              >
                {t.cookies.resetButton}
              </button>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
