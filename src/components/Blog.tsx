import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export const Blog: React.FC<{ onBack: () => void }> = ({ onBack }) => {

  useEffect(() => {
    // Load the Elfsight script dynamically
    const scriptId = 'elfsight-platform-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60vh]">
      {/* Back navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-black font-sans uppercase tracking-[0.35em] text-stone-300 hover:text-charcoal transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-charcoal group-hover:border-charcoal group-hover:text-white transition-all duration-500">
            <ArrowLeft size={13} />
          </span>
          Back to Home
        </button>

        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter">
            The <span className="text-stone-300">Journal</span><span className="brand-dot" aria-hidden="true" />
          </h1>
          <p className="text-[9px] font-black font-sans uppercase tracking-[0.4em] text-stone-300 mt-1">Stories & Guides</p>
        </div>
      </div>

      <div className="w-full min-h-[60vh]">
        {/* Elfsight RSS Feed | Untitled RSS Feed */}
        <div className="elfsight-app-6d741dfd-833f-40ce-a827-cc7b81020c0c" data-elfsight-app-lazy></div>
      </div>
    </div>
  );
};
