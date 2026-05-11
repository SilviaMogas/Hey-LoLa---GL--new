import React, { useState } from 'react';
import { MessageCircle, X, Send, Mail, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-stone-line overflow-hidden flex flex-col"
          >
            <div className="bg-charcoal p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-medium italic text-xl tracking-tight leading-none">Support Hub.</h3>
                <p className="text-[8px] uppercase font-black tracking-[0.2em] text-stone-400 mt-2">Always here for you</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="bg-bone p-5 rounded-2xl text-[11px] font-medium text-stone-500 leading-tight italic tracking-tight border border-stone-line/50">
                  For immediate assistance, connect with our human support curators.
                </div>
                <div className="text-center py-4 border-b border-stone-line">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-300 mb-1">Direct Email</p>
                  <p className="text-sm font-medium text-charcoal">hey@heylola.co</p>
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href="mailto:hey@heylola.co"
                  className="luxury-button-primary w-full h-12 flex items-center justify-center gap-3 text-[10px]"
                >
                  <Mail size={14} /> Open Email Client
                  <ExternalLink size={12} className="opacity-40" />
                </a>
                
                <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-stone-300 mt-2">
                  Human-Powered Network
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-charcoal hover:bg-stone-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 group relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-charcoal rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
};
