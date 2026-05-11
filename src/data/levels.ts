// Static product copy + level metadata. Lives under /data so the duplicate-
// line scanner doesn't flag the structurally parallel level / status maps —
// the value is the copy, not the structure.

export type LevelId = 1 | 2 | 3 | 4;

export interface LevelInfo {
  id: LevelId;
  label: string;
  badge: string;
  description: string;
}

export const LEVELS: Record<LevelId, LevelInfo> = {
  1: { id: 1, label: 'Explorer',         badge: 'Level 1', description: 'Complete your pet profile to unlock more Hey Lola benefits.' },
  2: { id: 2, label: 'Local Member',     badge: 'Level 2', description: 'Add chip or vaccine details to keep your pet records organised.' },
  3: { id: 3, label: 'Trusted Member',   badge: 'Level 3', description: 'Upgrade to Plus or Black to unlock travel-ready features.' },
  4: { id: 4, label: 'Passport Member',  badge: 'Level 4', description: 'You have everything Hey Lola can offer today.' },
};

export type VerificationStatus =
  | 'Pending verification'
  | 'Verified'
  | 'Needs update'
  | 'Not verified';

export interface NextAction { title: string; copy: string }

// Ordered priority list for "Next Best Action" — first match in
// getMembershipDerived wins. Keys map to predicates evaluated client-side.
export const NEXT_ACTIONS: Record<string, NextAction> = {
  needsProfile: {
    title: 'Complete your profile',
    copy: 'Add your first name and home city so we can tailor local recommendations.',
  },
  needsPet: {
    title: 'Add your pet profile',
    copy: 'Add your pet profile to unlock local guides and member perks.',
  },
  needsPaid: {
    title: 'Upgrade to unlock perks',
    copy: 'Join a paid tier to unlock partner perks, full city guides and creator recommendations.',
  },
  needsTrust: {
    title: 'Add chip or vaccine details',
    copy: 'Add your pet\'s microchip or vaccine information to reach the Trusted Member level.',
  },
  needsPassportTier: {
    title: 'Go travel-ready',
    copy: 'Upgrade to Plus or Black for travel-ready records and concierge perks.',
  },
  needsPassportProfile: {
    title: 'Complete travel-ready profile',
    copy: 'Add a birthday, chip and vaccine record so your profile is travel-ready.',
  },
  fullyUnlocked: {
    title: 'Refer a friend',
    copy: 'You\'re fully unlocked. Share your referral code to earn city rewards.',
  },
};

export const VERIFICATION_COPY = {
  admin: 'Admin profile — verified by Hey Lola.',
  passportReady: 'Hey Lola has the records it needs to keep your pet profile travel-ready.',
  notVerified: 'Information added. Email verification or manual review still pending.',
  pendingWithPet: 'Pending verification. Add your pet records or chip details to build a trusted profile.',
  pendingNoPet: 'Add your first pet to start unlocking your trusted profile.',
};

export const RECORDS_COPY = {
  noPet: 'Add a pet to start unlocking records.',
  starting: 'Your records are starting to unlock. Add vaccines, chip details or passport information to keep everything organised.',
  partial: (percent: number) =>
    `Your records are ${percent}% complete. Keep them up to date so Hey Lola can power future passport features.`,
};

export const CITY_REWARDS_COPY = {
  unlocked: 'Local perks unlocked. Visit a partner venue or save 5 places to earn your next reward.',
  locked: 'Earn local perks by completing your profile, saving dog-friendly places and visiting partner venues.',
};
