// Drop-in re-export of the email senders. Existing imports across api/* and
// src/lib continue to work as `import { sendXxx } from '../src/lib/email'`
// because module resolution finds this `email/index.ts` when the bare path
// `email` is requested.
//
// Architecture:
//   - transport.ts  → Resend wiring + sendOne + SendResult (no JSX)
//   - senders.tsx   → public sendXxxEmails(...) helpers (renders templates)
//   - emails/*.tsx  → React Email templates (designer-editable)

export {
  sendVenueInviteEmail,
  sendPartnerApplicationEmails,
  sendFoundationInterestEmails,
  sendGroupJoinEmails,
  sendVenueClaimEmails,
  sendOnboardingSubmissionEmails,
  sendVenueIntakeEmails,
  sendWaitlistEmails,
  sendBusinessLeadEmails,
  sendSignupEmails,
} from './senders';

export type {
  SendVenueInviteOptions,
  SendVenueInviteResult,
  PartnerApplicationEmailOpts,
  FoundationInterestEmailOpts,
  GroupJoinEmailOpts,
  VenueClaimEmailOpts,
  OnboardingSubmissionEmailOpts,
  VenueIntakeEmailOpts,
  WaitlistEmailOpts,
  BusinessLeadEmailOpts,
  SignupEmailOpts,
} from './senders';

export type { SendResult } from './transport';
