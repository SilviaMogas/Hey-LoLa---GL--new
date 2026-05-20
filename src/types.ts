export interface Vaccination {
  name: string;
  date: string;
  nextDueDate: string;
}

export interface TravelRecord {
  destination: string;
  date: string;
}

/** Lifestyle traits chosen during onboarding — drive vaccine suggestions
 *  (e.g. boarding → bordetella) and content personalisation. */
export type Activity =
  | 'parks'
  | 'beach'
  | 'hiking'
  | 'swimming'
  | 'cafes'
  | 'travel'
  | 'boarding'
  | 'daycare'
  | 'training'
  | 'dating'
  | 'rural'
  | 'urban';

export type WeightUnit = 'kg' | 'lb';

export interface WeightRecord {
  value: string;
  date: string;
  /** Optional unit. Records without a unit are treated as kg for backwards compat. */
  unit?: WeightUnit;
}

export interface EmergencyContact {
  role: string;
  name: string;
  phone: string;
}

export interface HealthEvent {
  date: string;
  event: string;
  type: 'Clinical' | 'Travel' | 'Wellness' | 'Other';
  notes?: string;
}

export interface PetData {
  id: string;
  userId: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Other' | 'pet_lover';
  breed: string;
  birthDate: string;
  currentWeight: WeightRecord;
  weightHistory: WeightRecord[];
  vaccinations: Vaccination[];
  vaxStatus: string;
  specialNeeds: string;
  photoURL?: string;
  countryOfBirth: string;
  residenceCountry: string;
  travelHistory: TravelRecord[];
  /** Country codes the pet wants to visit next (e.g. 'ES','US'). */
  plannedDestinations?: string[];
  /** Lifestyle traits — used for vaccine suggestions + content matching. */
  activities?: Activity[];
  microchipID: string;
  hobbies: string;
  passportNumber?: string;
  /** Owner has opted-in to a public profile. Defaults to false. */
  isPublic?: boolean;
  /** Admin override — hides the pet from the public site even if isPublic is true. */
  isHidden?: boolean;
  city?: string;
  /** Emergency contacts — Owner, Primary Vet, etc. */
  emergencyContacts?: EmergencyContact[];
  /** Health timeline events shown on the passport. */
  healthTimeline?: HealthEvent[];
  updatedAt?: string;
}

export type MemberPlan = 'free' | 'local' | 'plus' | 'black' | 'travel';
export type PaidMemberPlan = Exclude<MemberPlan, 'free'>;
export type SubscriptionStatus =
  | 'on_trial'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'unpaid'
  | 'cancelled'
  | 'expired';

/** Subscription metadata stored in Firestore. Populated by the Lemon Squeezy webhook. The client reads this cache. */
export interface MembershipSubscription {
  plan: PaidMemberPlan;
  status: SubscriptionStatus;
  /** Payment provider: 'lemonsqueezy' */
  billingProvider?: 'lemonsqueezy';
  /** Provider subscription ID. */
  subscriptionId: string;
  /** Lemon Squeezy customer portal deeplink. */
  customerPortalUrl?: string;
  /** ISO timestamp when the next renewal is due (or trial ends for active plans). */
  renewsAt?: string;
  /** ISO timestamp of the current period end. */
  currentPeriodEnd?: string;
  /** ISO timestamp when the subscription will fully end (set when cancelled). */
  endsAt?: string;
  /** ISO timestamp when the trial ends, if any. */
  trialEndsAt?: string;
  /** ISO timestamp when the trial started. */
  trialStart?: string;
  /** Whether the subscription cancels at end of current period. */
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
}

export type CreatorStatus = 'invited' | 'accepted' | 'active' | 'paused';

export interface Creator {
  id: string;
  name: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  city: string;
  referralCode: string;
  commissionPercent: number;
  status: CreatorStatus;
  signupsCount?: number;
  paidConversions?: number;
  totalCommissionOwed?: number;
  lastGuideSubmitted?: string;
  profileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  userType: 'Dog Owner' | 'Business';
  photoURL?: string;
  homeCity?: string;
  bio?: string;
  dreamDestination?: string;
  referralCode?: string;
  referredBy?: string;
  memberPlan?: MemberPlan;
  membership?: MembershipSubscription;
  onboarded?: boolean;
  onboardingStep?: number;
  onboardingStatus?: {
    hasSelectedPetType: boolean;
    selectedPetType?: string;
    hasPet: boolean;
    petLoverNoPet: boolean;
    updatedAt: string;
  } | any;
  emailVerified?: boolean;
  status?: string;
  statusUpdatedAt?: string;
  /** ISO timestamps of handle changes — used to enforce max 2 changes / 30 days. */
  usernameChangedAt?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlaceCategory = 
  | 'Parks / green areas' 
  | 'Dog-friendly cafes' 
  | 'Dog-friendly restaurants' 
  | 'Pet shops' 
  | 'Veterinary clinics' 
  | 'Grooming services' 
  | 'Pet-friendly hotels' 
  | 'Pet-friendly coworking spaces' 
  | 'Beaches' 
  | 'Other';

/**
 * Lifecycle for a venue listing. The Verified state is reserved for places
 * that an admin has manually approved (either after a claim or independently)
 * — see firestore.rules and the back-office Claims tab. Default for all
 * imported / scraped places is `Pending verification`.
 */
export type PlaceStatus =
  | 'Pending verification'
  | 'Community recommended'
  | 'Claimed'
  | 'Verified'
  | 'Rejected';

/**
 * Two-stage verification ladder, kept on the venue document and updated by
 * the back-office invite/claim flow. Default for any new venue is
 * `not_verified`. Public site only shows the Verified badge when this is
 * `verified` (admin-approved).
 */
export type VerificationStatus =
  | 'not_verified'
  | 'invitation_sent'
  | 'claim_requested'
  | 'pending_review'
  | 'verified'
  | 'rejected';

/** Whether the venue has joined the (free) Hey Lola Partner Network. */
export type PartnerStatus =
  | 'not_invited'
  | 'invited'
  | 'active_partner'
  | 'inactive_partner';

/** Lifecycle for any perk a venue may offer Hey Lola users. */
export type PerkStatus =
  | 'no_perks'
  | 'perk_proposed'
  | 'perk_pending_review'
  | 'perk_active'
  | 'perk_rejected';

export type PerkType =
  | 'discount'
  | 'free_item'
  | 'priority_booking'
  | 'pet_friendly_experience'
  | 'loyalty_reward'
  | 'other';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  tags?: PlaceCategory[];
  city: 'Miami' | 'New York City' | 'Barcelona';
  neighborhood?: string;
  description: string;
  utility: string;
  status: PlaceStatus;
  lat: number;
  lng: number;
  image?: string;
  rating?: number;
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  contactEmail?: string;
  petFriendlyNotes?: string;
  /** uid of the user who has claimed this listing (pending or approved). */
  claimedBy?: string;
  /** Set once the admin has approved an associated claim_request. */
  claimApprovedAt?: string;
  /** Admin override — hide the place from the public site without deleting it. */
  isHidden?: boolean;
  updatedAt?: string;
  /** Creator who recommended this place. */
  recommendedBy?: string;
  /** Link to the creator's profile or guide. */
  recommendedByUrl?: string;
  /** Member-exclusive perk at this venue (only shown when perkStatus === 'perk_active'). */
  memberPerk?: string;

  /* ── Partner / verification ladder ─────────────────────────────────── */
  verificationStatus?: VerificationStatus;
  partnerStatus?: PartnerStatus;
  perkStatus?: PerkStatus;
  /** When the back-office sent the most recent invitation email. */
  verificationEmailSentAt?: string;
  verificationEmailSentTo?: string;
  /** Submission timestamp from the public claim form. */
  claimRequestedAt?: string;
  claimedByEmail?: string;
  claimedByName?: string;
  claimedByRole?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  /** Perk fields — only public when perkStatus === 'perk_active'. */
  perkType?: PerkType;
  perkDescription?: string;
  perkConditions?: string;
  perkStartDate?: string;
  perkEndDate?: string;
  perkAvailableDays?: string;
  perkApprovedAt?: string;
  perkApprovedBy?: string;
  perkRejectedAt?: string;
  perkRejectedBy?: string;

  /* ── Enrichment / outreach ─────────────────────────────────────────── */
  /** Best outreach email found during enrichment (ranked by prefix priority). */
  primaryEmail?: string;
  /** Additional emails found on the site. */
  secondaryEmails?: string[];
  /** URL of the venue's contact page, if discovered. */
  contactPageUrl?: string;
  enrichmentStatus?: 'not_started' | 'enriched' | 'partial' | 'failed' | 'needs_manual_review';
  enrichmentSource?: string;
  enrichmentLastCheckedAt?: string;
  /** True once a primaryEmail has been confirmed. */
  outreachReady?: boolean;
  /** ISO date (YYYY-MM-DD) when we last reached out to this venue. */
  lastContactedDate?: string;
  nextAction?: 'none' | 'follow_up';
  /** ISO date (YYYY-MM-DD) for the next follow-up. */
  nextFollowUpDate?: string;

  /* ── Reservations (outbound) ───────────────────────────────────────── */
  /** Direct deeplink to the venue's reservation page on OpenTable. */
  openTableUrl?: string;
  /** Which provider owns the booking flow for this venue. Defaults to None. */
  reservationProvider?: ReservationProvider;
  /** Whether reservations are currently enabled for this venue. */
  bookingStatus?: BookingStatus;
  /** Optional affiliate / campaign metadata for future commission attribution. */
  reservationAffiliateId?: string;
  reservationCampaignId?: string;
  reservationReferralCode?: string;
}

export type ReservationProvider = 'OpenTable' | 'Direct' | 'Other' | 'None';
export type BookingStatus = 'Active' | 'Pending' | 'Not available';

/**
 * Outbound reservation-click event, written every time a user clicks the
 * "Reserve with OpenTable" CTA. Used for analytics today and as the seed for
 * future affiliate-commission attribution.
 */
export interface ReservationClick {
  venueId: string;
  venueName: string;
  city: string;
  userId?: string;
  timestamp: string;
  source: 'heylola';
  action: 'opentable_reservation_click';
  provider: ReservationProvider;
  /** Future-ready affiliate metadata (populated when set on the place). */
  affiliateId?: string;
  campaignId?: string;
  referralCode?: string;
  /** Set later if/when we ingest confirmation pings. */
  commissionStatus?: 'pending' | 'eligible' | 'paid' | 'rejected';
  bookingConfirmed?: boolean;
}

/**
 * Stored at /place_secrets/{placeId} (admin-only). The secure verification
 * token, recipient business email, and invite metadata that should never be
 * exposed to the client. The server-side /api/submit-claim endpoint reads
 * this collection via the Admin SDK to validate token-bearing claim
 * submissions.
 */
export interface PlaceSecret {
  /** Cryptographically random base64url string. */
  verificationToken: string;
  /** ISO timestamp; tokens expire after 30 days by default. */
  verificationTokenExpiresAt?: string;
  businessEmail?: string;
  contactPhone?: string;
  outreachNotes?: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  placeId: string;
  createdAt: any;
}

/**
 * Submitted via the public "Claim this place" dialog. Reviewed by an admin
 * in the back-office Claims tab; on approval the linked Place's status is
 * promoted to `Claimed` (or `Verified` if the admin chooses).
 */
export interface ClaimRequest {
  id: string;
  placeId: string;
  placeName: string;
  /** uid of the submitter (must be signed in to claim). */
  userId: string;
  businessName: string;
  contactPerson: string;
  businessEmail: string;
  phone?: string;
  website?: string;
  message?: string;
  status: 'Pending review' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  displayName: string;
  petName: string;
  channel: string;
  content: string;
  image?: string;
  likes: number;
  createdAt: any;
}

export type View = 'home' | 'explore' | 'community' | 'passport' | 'profile' | 'auth' | 'onboarding' | 'admin' | 'blog' | 'dashboard' | 'verify-email' | 'reset-password' | 'about' | 'privacy' | 'terms' | 'club' | 'creators' | 'saved' | 'faq' | 'start';

export type OnboardingSubmissionType = 'pet_parent' | 'animal_lover';
export type OnboardingSubmissionStatus = 'new' | 'contacted' | 'active' | 'archived';

export interface OnboardingSubmission {
  id: string;
  type: OnboardingSubmissionType;
  status: OnboardingSubmissionStatus;
  source: string;
  createdAt: any;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  instagram?: string;
  petName?: string;
  petType?: 'Dog' | 'Cat' | 'Other';
  foundingClubInterest?: 'Yes' | 'Maybe' | 'Not now';
  interests?: string[];
}

export type VenueClaimStatus = 'claim_submitted' | 'not_contacted' | 'contacted' | 'interested' | 'claimed' | 'rejected' | 'no_response';
export type VenueClaimVerificationStatus = 'not_verified' | 'pending_review' | 'verified_manually' | 'verified_by_claim';
export type VenueClaimPerkStatus = 'not_confirmed' | 'no_perk' | 'interested' | 'perk_agreed' | 'live';

export interface VenueClaim {
  id: string;
  businessName: string;
  category: 'Restaurant' | 'Café' | 'Hotel' | 'Store' | 'Groomer' | 'Vet' | 'Coworking' | 'Real estate' | 'Other';
  city: string;
  address: string;
  website?: string;
  instagram?: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  petFriendlyStatus: 'Indoors' | 'Outdoors' | 'Sometimes' | 'Not yet';
  perkInterest: 'Yes' | 'Maybe' | 'Tell me more';
  notes?: string;
  claimStatus: VenueClaimStatus;
  verificationStatus: VenueClaimVerificationStatus;
  perkStatus: VenueClaimPerkStatus;
  source: string;
  createdAt: any;
}
