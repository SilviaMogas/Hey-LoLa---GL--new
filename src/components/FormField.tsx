import React from 'react';

// Shared form field used across the claim flows (ClaimPlaceDialog,
// ClaimListing). Centralises the input/textarea styling so a tweak only
// happens in one place — and so the static analyser doesn't keep flagging
// two near-identical Field helpers as duplicate code.

const INPUT_CLS = 'w-full bg-bone border border-stone-line rounded-2xl px-4 py-3 text-sm focus:outline-none focus-visible:outline-none focus:border-charcoal/30 focus:ring-2 focus:ring-stone-200 transition-colors';

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}

export function FormField({ label, value, onChange, type = 'text', required, multiline, placeholder }: FormFieldProps) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
        {label}{required && <span className="text-brand-orange ml-1">*</span>}
      </span>
      {multiline ? (
        <textarea value={value} onChange={onChange} rows={3} className={INPUT_CLS} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={onChange} className={INPUT_CLS} placeholder={placeholder} />
      )}
    </label>
  );
}

export function FormSelect({ label, value, onChange, children }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</span>
      <select value={value} onChange={onChange} className={INPUT_CLS}>
        {children}
      </select>
    </label>
  );
}
