import * as React from 'react';
import { render } from '@react-email/render';

// React Email templates (compiled .js, same imports the senders use).
import VenueInvite from '../emails/venue-invite.js';
import PartnerApplicationConfirmation from '../emails/partner-application-confirmation.js';
import PartnerApplicationAdmin from '../emails/partner-application-admin.js';
import FoundationInterestConfirmation from '../emails/foundation-interest-confirmation.js';
import FoundationInterestAdmin from '../emails/foundation-interest-admin.js';
import GroupJoinConfirmation from '../emails/group-join-confirmation.js';
import GroupJoinAdmin from '../emails/group-join-admin.js';
import VenueClaimConfirmation from '../emails/venue-claim-confirmation.js';
import VenueClaimAdmin from '../emails/venue-claim-admin.js';
import OnboardingPetParentConfirmation from '../emails/onboarding-pet-parent-confirmation.js';
import OnboardingPetParentAdmin from '../emails/onboarding-pet-parent-admin.js';
import OnboardingAnimalLoverConfirmation from '../emails/onboarding-animal-lover-confirmation.js';
import OnboardingAnimalLoverAdmin from '../emails/onboarding-animal-lover-admin.js';
import VenueIntakeConfirmation from '../emails/venue-intake-confirmation.js';
import VenueIntakeAdmin from '../emails/venue-intake-admin.js';
import WaitlistConfirmation from '../emails/waitlist-confirmation.js';
import WaitlistAdmin from '../emails/waitlist-admin.js';
import BusinessLeadConfirmation from '../emails/business-lead-confirmation.js';
import BusinessLeadAdmin from '../emails/business-lead-admin.js';
import SignupConfirmation from '../emails/signup-confirmation.js';
import SignupAdmin from '../emails/signup-admin.js';

type TemplateEntry = {
  label: string;
  group: 'Customer' | 'Admin';
  Component: React.ComponentType<any>;
  sample: Record<string, unknown>;
};

// One entry per template, with editable sample data. Keep ids stable — the
// admin Email Templates panel reads this registry via /api/email-preview?list=1.
const REGISTRY: Record<string, TemplateEntry> = {
  'signup-confirmation': {
    label: 'Signup — welcome (customer)', group: 'Customer', Component: SignupConfirmation,
    sample: { firstName: 'Silvia', dashboardUrl: 'https://heylola.co/dashboard', signupMethod: 'email', verifyUrl: 'https://heylola.co/verify' },
  },
  'signup-admin': {
    label: 'Signup — admin alert', group: 'Admin', Component: SignupAdmin,
    sample: { firstName: 'Silvia', lastName: 'Mogás', email: 'silvia@example.com', username: 'silviamogas', userType: 'Dog Owner', signupMethod: 'email', emailVerified: false, referredBy: '', userId: 'abc123' },
  },
  'waitlist-confirmation': {
    label: 'Waitlist — confirmation (customer)', group: 'Customer', Component: WaitlistConfirmation,
    sample: { firstName: 'Silvia', city: 'Miami', plan: 'Plus' },
  },
  'waitlist-admin': {
    label: 'Waitlist — admin alert', group: 'Admin', Component: WaitlistAdmin,
    sample: { firstName: 'Silvia', lastName: 'Mogás', email: 'silvia@example.com', city: 'Miami', plan: 'Plus', dogName: 'Lola', dogType: 'Poodle', perks: 'Cafés, travel', entryId: 'wl_123' },
  },
  'onboarding-pet-parent-confirmation': {
    label: 'Onboarding · Pet Parent — confirmation', group: 'Customer', Component: OnboardingPetParentConfirmation,
    sample: { firstName: 'Silvia', city: 'Miami', petName: 'Lola' },
  },
  'onboarding-pet-parent-admin': {
    label: 'Onboarding · Pet Parent — admin alert', group: 'Admin', Component: OnboardingPetParentAdmin,
    sample: { firstName: 'Silvia', lastName: 'Mogás', email: 'silvia@example.com', city: 'Miami', instagram: '@heylola', petName: 'Lola', petType: 'Poodle', foundingClubInterest: 'Yes', submissionId: 'sub_123' },
  },
  'onboarding-animal-lover-confirmation': {
    label: 'Onboarding · Animal Lover — confirmation', group: 'Customer', Component: OnboardingAnimalLoverConfirmation,
    sample: { firstName: 'Silvia', city: 'Barcelona' },
  },
  'onboarding-animal-lover-admin': {
    label: 'Onboarding · Animal Lover — admin alert', group: 'Admin', Component: OnboardingAnimalLoverAdmin,
    sample: { firstName: 'Silvia', lastName: 'Mogás', email: 'silvia@example.com', city: 'Barcelona', instagram: '@heylola', interests: ['Walks', 'Travel'], submissionId: 'sub_123' },
  },
  'group-join-confirmation': {
    label: 'Community hub join — confirmation', group: 'Customer', Component: GroupJoinConfirmation,
    sample: { firstName: 'Silvia', groupName: 'Miami 🌴', groupUrl: 'https://heylola.co/community/mia-pack' },
  },
  'group-join-admin': {
    label: 'Community hub join — admin alert', group: 'Admin', Component: GroupJoinAdmin,
    sample: { memberName: 'Silvia Mogás', memberEmail: 'silvia@example.com', groupName: 'Miami 🌴', groupUrl: 'https://heylola.co/community/mia-pack' },
  },
  'foundation-interest-confirmation': {
    label: 'Foundation interest — confirmation', group: 'Customer', Component: FoundationInterestConfirmation,
    sample: { contactName: 'Silvia', dogName: 'Bravo', partnerName: 'Bobbi and the Strays', passportUrl: 'https://heylola.co/foundation' },
  },
  'foundation-interest-admin': {
    label: 'Foundation interest — admin alert', group: 'Admin', Component: FoundationInterestAdmin,
    sample: { dogName: 'Bravo', partnerName: 'Bobbi and the Strays', passportUrl: 'https://heylola.co/foundation', contactName: 'Silvia', contactEmail: 'silvia@example.com', contactPhone: '+1 555 0100', message: 'We would love to meet Bravo.', interestId: 'fi_123' },
  },
  'partner-application-confirmation': {
    label: 'Partner application — confirmation', group: 'Customer', Component: PartnerApplicationConfirmation,
    sample: { contactName: 'Silvia', businessName: 'The Corner Café' },
  },
  'partner-application-admin': {
    label: 'Partner application — admin alert', group: 'Admin', Component: PartnerApplicationAdmin,
    sample: { businessName: 'The Corner Café', contactName: 'Silvia', contactEmail: 'silvia@example.com', contactRole: 'Owner', city: 'Miami', applicationId: 'pa_123' },
  },
  'venue-invite': {
    label: 'Venue invite (to venue)', group: 'Admin', Component: VenueInvite,
    sample: { venueName: 'The Corner Café', claimUrl: 'https://heylola.co/claim-listing/token' },
  },
  'venue-claim-confirmation': {
    label: 'Venue claim — confirmation', group: 'Customer', Component: VenueClaimConfirmation,
    sample: { firstName: 'Silvia', businessName: 'The Corner Café' },
  },
  'venue-claim-admin': {
    label: 'Venue claim — admin alert', group: 'Admin', Component: VenueClaimAdmin,
    sample: { claimantName: 'Silvia Mogás', claimantEmail: 'silvia@example.com', businessName: 'The Corner Café', placeName: 'The Corner Café — Miami', placeUrl: 'https://heylola.co/venue/the-corner-cafe', message: 'This is my business.' },
  },
  'venue-intake-confirmation': {
    label: 'Venue intake — confirmation', group: 'Customer', Component: VenueIntakeConfirmation,
    sample: { firstName: 'Silvia', businessName: 'The Corner Café', hasPerk: true },
  },
  'venue-intake-admin': {
    label: 'Venue intake — admin alert', group: 'Admin', Component: VenueIntakeAdmin,
    sample: { businessName: 'The Corner Café', category: 'Café', city: 'Miami', address: '123 Ocean Dr', website: 'https://corner.cafe', instagram: '@cornercafe', contactPerson: 'Silvia Mogás', contactRole: 'Owner', email: 'silvia@example.com', phone: '+1 555 0100', petFriendlyStatus: 'Very', perkInterest: '10% off', notes: 'Loves dogs.', claimId: 'vi_123' },
  },
  'business-lead-confirmation': {
    label: 'Business lead — confirmation', group: 'Customer', Component: BusinessLeadConfirmation,
    sample: { businessName: 'The Corner Café' },
  },
  'business-lead-admin': {
    label: 'Business lead — admin alert', group: 'Admin', Component: BusinessLeadAdmin,
    sample: { businessName: 'The Corner Café', email: 'silvia@example.com', contactRole: 'Owner', location: 'Miami', reason: 'Want to partner.', leadId: 'bl_123' },
  },
};

// GET /api/email-preview?list=1            → JSON list of templates + samples
// GET /api/email-preview?template=<id>     → rendered HTML (uses sample data)
// GET /api/email-preview?template=<id>&data=<urlencoded JSON> → HTML with overrides
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (req.query?.list) {
    const list = Object.entries(REGISTRY).map(([id, e]) => ({ id, label: e.label, group: e.group, sample: e.sample }));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ templates: list });
    return;
  }

  const id = String(req.query?.template || '');
  const entry = REGISTRY[id];
  if (!entry) {
    res.status(404).send(`Unknown template "${id}". Add ?list=1 to see available templates.`);
    return;
  }

  let overrides: Record<string, unknown> = {};
  if (req.query?.data) {
    try {
      overrides = JSON.parse(String(req.query.data));
    } catch {
      // ignore malformed overrides — fall back to sample data
    }
  }

  try {
    const props = { ...entry.sample, ...overrides };
    const html = await Promise.resolve(render(React.createElement(entry.Component, props as any)));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(html);
  } catch (err: any) {
    res.status(500).send(`Failed to render "${id}": ${err?.message || 'unknown error'}`);
  }
}
