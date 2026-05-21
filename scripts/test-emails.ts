#!/usr/bin/env tsx
/**
 * Send every transactional email through Resend with sample data. Used to
 * audit copy + design end-to-end without touching Firestore.
 *
 *   npm run email:test
 *
 * Requires in .env (or .env.local):
 *   RESEND_API_KEY=re_xxx
 *   TEST_USER_EMAIL=designer@example.com    ← all autoresponders land here
 *
 * Optional:
 *   ADMIN_INBOX_EMAIL=ops@example.com       ← override the admin alert
 *                                             destination (defaults to
 *                                             hey@heylola.co).
 */

import 'dotenv/config';

import {
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
} from '../src/lib/email';

const { TEST_USER_EMAIL, ADMIN_INBOX_EMAIL, RESEND_API_KEY } = process.env;

// ─── pre-flight ─────────────────────────────────────────────────────────────

const fatal = (msg: string) => {
  console.error(`\x1b[31m✗\x1b[0m  ${msg}`);
  process.exit(1);
};

if (!RESEND_API_KEY) fatal('RESEND_API_KEY is not set — no email can leave the machine.');
if (!TEST_USER_EMAIL) fatal('TEST_USER_EMAIL is not set. Add it to .env so autoresponders land in your inbox during testing.');

const adminInbox = ADMIN_INBOX_EMAIL?.trim() || 'hey@heylola.co';

console.log('\n\x1b[1mHey Lola — email test run\x1b[0m');
console.log('─'.repeat(60));
console.log(`User inbox (autoresponders):  ${TEST_USER_EMAIL}`);
console.log(`Admin inbox (alerts):         ${adminInbox}`);
console.log('─'.repeat(60));

// Plug TEST_USER_EMAIL into every "user-facing" recipient slot so the test
// inbox actually receives the autoresponders. Admin alerts naturally route
// to ADMIN_INBOX_EMAIL (or the default hey@heylola.co).
const SAMPLE_USER_EMAIL = TEST_USER_EMAIL;
const SAMPLE_BUSINESS_EMAIL = TEST_USER_EMAIL;

interface TestCase {
  name: string;
  /** Number of emails this case sends (user + admin = 2; venue-invite = 1). */
  emails: number;
  run: () => Promise<unknown>;
}

const cases: TestCase[] = [
  {
    name: '01 · Venue Invite (admin → venue)',
    emails: 1,
    run: () =>
      sendVenueInviteEmail({
        venueName: 'The Bow Wow Bistro',
        recipientEmail: SAMPLE_USER_EMAIL,
        claimUrl: 'https://heylola.co/claim-listing/sample-token-abc123',
      }),
  },
  {
    name: '02 · Partner Application',
    emails: 2,
    run: () =>
      sendPartnerApplicationEmails({
        businessName: 'The Bow Wow Bistro',
        contactName: 'Sam Rivera',
        contactEmail: SAMPLE_USER_EMAIL,
        contactRole: 'Owner',
        city: 'Miami',
        applicationId: 'test_app_001',
      }),
  },
  {
    name: '03 · Foundation Interest',
    emails: 2,
    run: () =>
      sendFoundationInterestEmails({
        dogName: 'Luna',
        dogSlug: 'luna-miami',
        partnerName: 'Pet Rescue Miami',
        contactName: 'Alex Martinez',
        contactEmail: SAMPLE_USER_EMAIL,
        contactPhone: '+1 305 555 0142',
        message:
          'I live in a dog-friendly apartment with my partner. We can offer Luna lots of love and walks every day.',
        interestId: 'test_int_001',
        passportUrl: 'https://heylola.co/foundation/dogs/luna-miami',
      }),
  },
  {
    name: '04 · Group Join',
    emails: 2,
    run: () =>
      sendGroupJoinEmails({
        to: SAMPLE_USER_EMAIL,
        name: 'Lola Martinez',
        groupName: 'Crew in Miami',
        groupUrl: 'https://heylola.co/community/crew-in-miami',
      }),
  },
  {
    name: '05 · Venue Claim (any of 3 entry points)',
    emails: 2,
    run: () =>
      sendVenueClaimEmails({
        claimantEmail: SAMPLE_USER_EMAIL,
        claimantName: 'Sam Rivera',
        businessName: 'The Bow Wow Bistro',
        placeName: 'Bow Wow Bistro · Coconut Grove',
        placeUrl: 'https://heylola.co/venue/bow-wow-bistro-coconut-grove',
        message: 'We just opened our second location and would love to be officially listed.',
      }),
  },
  {
    name: '06 · Onboarding · Pet Parent (/start)',
    emails: 2,
    run: () =>
      sendOnboardingSubmissionEmails({
        type: 'pet_parent',
        firstName: 'Lola',
        lastName: 'Martinez',
        email: SAMPLE_USER_EMAIL,
        city: 'Miami',
        instagram: '@lola.and.coco',
        petName: 'Coco',
        petType: 'Dog',
        foundingClubInterest: 'Yes',
        submissionId: 'test_sub_pp_001',
      }),
  },
  {
    name: '07 · Onboarding · Animal Lover (/start)',
    emails: 2,
    run: () =>
      sendOnboardingSubmissionEmails({
        type: 'animal_lover',
        firstName: 'Alex',
        lastName: 'Martinez',
        email: SAMPLE_USER_EMAIL,
        city: 'Miami',
        instagram: '@alexandfoster',
        interests: ['Volunteering', 'Adoption events', 'Foster network'],
        submissionId: 'test_sub_al_001',
      }),
  },
  {
    name: '08 · Venue Intake (/start)',
    emails: 2,
    run: () =>
      sendVenueIntakeEmails({
        businessName: 'The Bow Wow Bistro',
        category: 'Restaurant',
        city: 'Miami',
        address: '123 Coconut Grove Dr, Miami, FL',
        website: 'https://bowwowbistro.com',
        instagram: '@bowwowbistro',
        contactPerson: 'Sam Rivera',
        contactRole: 'Owner',
        email: SAMPLE_USER_EMAIL,
        phone: '+1 305 555 0142',
        petFriendlyStatus: 'Indoors',
        perkInterest: 'Yes',
        notes: 'We already have a dog water station and a pup-cup menu. Happy to host a Hey Lola meetup.',
        claimId: 'test_claim_001',
      }),
  },
  {
    name: '09 · Waitlist (member)',
    emails: 2,
    run: () =>
      sendWaitlistEmails({
        firstName: 'Lola',
        lastName: 'Martinez',
        email: SAMPLE_USER_EMAIL,
        city: 'Miami',
        plan: 'Travel / Plus',
        dogName: 'Coco',
        dogType: 'French Bulldog',
        perks: 'Pet-friendly hotels, grooming discounts, vet partner network.',
        entryId: 'test_wl_001',
      }),
  },
  {
    name: '10 · Business Lead (B2B inquiry)',
    emails: 2,
    run: () =>
      sendBusinessLeadEmails({
        businessName: 'Acme Pet Co.',
        contactRole: 'Head of Brand',
        location: 'New York, NY',
        reason:
          'We sell premium dog food and would love to explore a perks partnership with Hey Lola members in Miami and NYC.',
        email: SAMPLE_BUSINESS_EMAIL,
        leadId: 'test_lead_001',
      }),
  },
  {
    name: '11 · Signup · email/password (with verify link)',
    emails: 2,
    run: () =>
      sendSignupEmails({
        firstName: 'Lola',
        lastName: 'Martinez',
        email: SAMPLE_USER_EMAIL,
        username: 'lola.miami',
        userType: 'Dog Owner',
        signupMethod: 'email',
        emailVerified: false,
        verifyUrl: 'https://hey-lola-5c343.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=SAMPLE_TOKEN',
        dashboardUrl: 'https://heylola.co/dashboard',
        userId: 'test_uid_001',
      }),
  },
  {
    name: '12 · Signup · Google OAuth (no verify link)',
    emails: 2,
    run: () =>
      sendSignupEmails({
        firstName: 'Alex',
        lastName: 'Martinez',
        email: SAMPLE_USER_EMAIL,
        username: 'alex.martinez',
        userType: 'Dog Owner',
        signupMethod: 'google',
        emailVerified: true,
        dashboardUrl: 'https://heylola.co/dashboard',
        userId: 'test_uid_002',
      }),
  },
];

// ─── runner ─────────────────────────────────────────────────────────────────

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

function summarise(r: any): { delivered: boolean; reason?: string } {
  if (r && typeof r === 'object') {
    if ('delivered' in r) return { delivered: !!r.delivered, reason: r.skippedReason };
    // two-email response { confirmation, alert }
    const c = r.confirmation;
    const a = r.alert;
    if (c && a) {
      const delivered = !!c.delivered && !!a.delivered;
      const reasons = [
        !c.delivered ? `confirmation: ${c.skippedReason || 'unknown'}` : null,
        !a.delivered ? `alert: ${a.skippedReason || 'unknown'}` : null,
      ].filter(Boolean).join('; ');
      return { delivered, reason: reasons || undefined };
    }
  }
  return { delivered: false, reason: `Unrecognised response: ${JSON.stringify(r).slice(0, 120)}` };
}

// Resend's free tier caps at 5 requests/second. Each case fires up to 2
// emails in parallel (Promise.all in the sender) — pause between cases so
// we never exceed ~3 requests/second sustained.
const THROTTLE_MS = 700;
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

let totalSent = 0;
let totalFailed = 0;
const failures: Array<{ name: string; reason: string }> = [];

for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  process.stdout.write(`${c.name.padEnd(56)}  `);
  try {
    const r = await c.run();
    const { delivered, reason } = summarise(r);
    if (delivered) {
      totalSent += c.emails;
      console.log(green(`✓ ${c.emails} sent`));
    } else {
      totalFailed += c.emails;
      failures.push({ name: c.name, reason: reason || 'unknown' });
      console.log(red(`✗ failed`) + (reason ? dim(` — ${reason}`) : ''));
    }
  } catch (err: any) {
    totalFailed += c.emails;
    failures.push({ name: c.name, reason: err?.message || String(err) });
    console.log(red('✗ threw') + dim(` — ${err?.message || err}`));
  }
  if (i < cases.length - 1) await sleep(THROTTLE_MS);
}

console.log('─'.repeat(60));
console.log(`Sent: ${green(String(totalSent))}    Failed: ${totalFailed > 0 ? red(String(totalFailed)) : '0'}`);
if (failures.length) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  • ${f.name}\n      ${dim(f.reason)}`);
}
console.log('');

process.exit(failures.length ? 1 : 0);
