/**
 * Hey Lola CRM — types + canonical values shared by the admin surface, the
 * Firestore rules and the API auto-ingest endpoint.
 *
 * Every venue / ecommerce we talk to becomes one document in `crm_leads`.
 * The lead carries everything the team needs to drive an outreach from
 * cold prospect through to a live partner.
 */

export type CrmStage =
  | 'prospect'
  | 'contacted'
  | 'replied'
  | 'meeting'
  | 'negotiating'
  | 'signed'
  | 'live'
  | 'declined'
  | 'dormant';

export type CrmTier = 1 | 2 | 3;

export type CrmSource =
  | 'cold'
  | 'warm_intro'
  | 'inbound_form'
  | 'scraped'
  | 'event'
  | 'other';

export type CrmCategory =
  | 'restaurant'
  | 'hotel'
  | 'cafe'
  | 'beach_club'
  | 'service'
  | 'retail'
  | 'ecommerce'
  | 'real_estate'
  | 'other';

export interface CrmContact {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  ig?: string;
}

export interface CrmPerk {
  type?: string;
  description?: string;
  status?: 'not_confirmed' | 'proposed' | 'agreed' | 'live';
}

export interface CrmNote {
  at: number; // millis
  by: string;
  text: string;
}

export interface CrmLead {
  id: string;
  businessName: string;
  category: CrmCategory;
  tier: CrmTier;
  city: string;
  contact: CrmContact;
  source: CrmSource;
  stage: CrmStage;
  perk?: CrmPerk;
  tags: string[];
  notes: CrmNote[];
  nextAction?: string;
  nextActionAt?: number;
  lastTouchAt?: number;
  lastTouchBy?: string;
  linkedPartnerApplicationId?: string;
  linkedPlaceId?: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export const CRM_STAGES: CrmStage[] = [
  'prospect',
  'contacted',
  'replied',
  'meeting',
  'negotiating',
  'signed',
  'live',
  'declined',
  'dormant',
];

export const CRM_STAGE_LABEL: Record<CrmStage, string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting: 'Meeting',
  negotiating: 'Negotiating',
  signed: 'Signed',
  live: 'Live',
  declined: 'Declined',
  dormant: 'Dormant',
};

export const CRM_STAGE_CHIP: Record<CrmStage, string> = {
  prospect: 'bg-stone-100 text-stone-600',
  contacted: 'bg-[#FDE2CB] text-[#9E5826]',
  replied: 'bg-[#FFF4E0] text-[#7A5A1F]',
  meeting: 'bg-[#E5EEF1] text-[#3F6B8C]',
  negotiating: 'bg-[#E0EDD2] text-[#5F7A4C]',
  signed: 'bg-[#D6EFD9] text-[#3F6B43]',
  live: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-stone-50 text-stone-400 line-through',
  dormant: 'bg-stone-50 text-stone-400',
};

export const CRM_CATEGORY_LABEL: Record<CrmCategory, string> = {
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  cafe: 'Café',
  beach_club: 'Beach club',
  service: 'Service',
  retail: 'Retail',
  ecommerce: 'Ecommerce',
  real_estate: 'Real estate',
  other: 'Other',
};

export const CRM_SOURCE_LABEL: Record<CrmSource, string> = {
  cold: 'Cold',
  warm_intro: 'Warm intro',
  inbound_form: 'Inbound form',
  scraped: 'Scraped',
  event: 'Event',
  other: 'Other',
};
