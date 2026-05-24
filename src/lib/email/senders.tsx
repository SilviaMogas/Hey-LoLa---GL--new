import * as React from 'react';
import { render } from '@react-email/render';

import { sendOne, ADMIN_INBOX, SendResult } from './transport.js';

// React Email templates — one component per "audience × workflow".
import VenueInvite from '../../../emails/venue-invite.js';
import PartnerApplicationConfirmation from '../../../emails/partner-application-confirmation.js';
import PartnerApplicationAdmin from '../../../emails/partner-application-admin.js';
import FoundationInterestConfirmation from '../../../emails/foundation-interest-confirmation.js';
import FoundationInterestAdmin from '../../../emails/foundation-interest-admin.js';
import GroupJoinConfirmation from '../../../emails/group-join-confirmation.js';
import GroupJoinAdmin from '../../../emails/group-join-admin.js';
import VenueClaimConfirmation from '../../../emails/venue-claim-confirmation.js';
import VenueClaimAdmin from '../../../emails/venue-claim-admin.js';
import OnboardingPetParentConfirmation from '../../../emails/onboarding-pet-parent-confirmation.js';
import OnboardingPetParentAdmin from '../../../emails/onboarding-pet-parent-admin.js';
import OnboardingAnimalLoverConfirmation from '../../../emails/onboarding-animal-lover-confirmation.js';
import OnboardingAnimalLoverAdmin from '../../../emails/onboarding-animal-lover-admin.js';
import VenueIntakeConfirmation from '../../../emails/venue-intake-confirmation.js';
import VenueIntakeAdmin from '../../../emails/venue-intake-admin.js';
import WaitlistConfirmation from '../../../emails/waitlist-confirmation.js';
import WaitlistAdmin from '../../../emails/waitlist-admin.js';
import BusinessLeadConfirmation from '../../../emails/business-lead-confirmation.js';
import BusinessLeadAdmin from '../../../emails/business-lead-admin.js';
import SignupConfirmation from '../../../emails/signup-confirmation.js';
import SignupAdmin from '../../../emails/signup-admin.js';
import SubscriberBroadcast from '../../../emails/subscriber-broadcast.js';
import OnboardingComplete from '../../../emails/onboarding-complete.js';
import EmailVerified from '../../../emails/email-verified.js';

// `@react-email/render` returns either `string` or `Promise<string>` depending
// on the version. Wrap to always await — keeps callers consistent.
async function renderBoth(node: React.ReactElement): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    Promise.resolve(render(node)),
    Promise.resolve(render(node, { plainText: true })),
  ]);
  return { html, text };
}

// ────────────────────────────────────────────────────────────────────────────
// VENUE INVITE (admin → venue)
// ────────────────────────────────────────────────────────────────────────────

export interface SendVenueInviteOptions {
  venueName: string;
  recipientEmail: string;
  claimUrl: string;
}

export interface SendVenueInviteResult {
  delivered: boolean;
  skippedReason?: string;
  providerMessageId?: string;
}

export async function sendVenueInviteEmail(opts: SendVenueInviteOptions): Promise<SendVenueInviteResult> {
  const { html, text } = await renderBoth(<VenueInvite venueName={opts.venueName} claimUrl={opts.claimUrl} />);
  const r = await sendOne(opts.recipientEmail, 'Your Hey Lola listing is ready to claim', html, text);
  return r;
}

// ────────────────────────────────────────────────────────────────────────────
// PARTNER APPLICATION
// ────────────────────────────────────────────────────────────────────────────

export interface PartnerApplicationEmailOpts {
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  city?: string;
  applicationId: string;
}

export async function sendPartnerApplicationEmails(opts: PartnerApplicationEmailOpts) {
  const confirmation = await renderBoth(
    <PartnerApplicationConfirmation contactName={opts.contactName} businessName={opts.businessName} />,
  );
  const alert = await renderBoth(
    <PartnerApplicationAdmin
      businessName={opts.businessName}
      contactName={opts.contactName}
      contactEmail={opts.contactEmail}
      contactRole={opts.contactRole}
      city={opts.city}
      applicationId={opts.applicationId}
    />,
  );
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.contactEmail, 'Welcome to the Hey Lola Partner Network', confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, `New partner application — ${opts.businessName}`, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// FOUNDATION INTEREST
// ────────────────────────────────────────────────────────────────────────────

export interface FoundationInterestEmailOpts {
  dogName: string;
  dogSlug: string;
  partnerName?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  message?: string;
  interestId: string;
  passportUrl: string;
}

export async function sendFoundationInterestEmails(opts: FoundationInterestEmailOpts) {
  const confirmation = await renderBoth(
    <FoundationInterestConfirmation
      contactName={opts.contactName}
      dogName={opts.dogName}
      partnerName={opts.partnerName}
      passportUrl={opts.passportUrl}
    />,
  );
  const alert = await renderBoth(
    <FoundationInterestAdmin
      dogName={opts.dogName}
      partnerName={opts.partnerName}
      passportUrl={opts.passportUrl}
      contactName={opts.contactName}
      contactEmail={opts.contactEmail}
      contactPhone={opts.contactPhone}
      message={opts.message}
      interestId={opts.interestId}
    />,
  );
  const subjectAlert = `New interest — ${opts.dogName}${opts.partnerName ? ` (${opts.partnerName})` : ''}`;
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.contactEmail, `Hey Lola — Your interest in ${opts.dogName}`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, subjectAlert, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// COMMUNITY GROUP JOIN
// ────────────────────────────────────────────────────────────────────────────

export interface GroupJoinEmailOpts {
  to: string;
  name: string;
  groupName: string;
  groupUrl: string;
}

export async function sendGroupJoinEmails(opts: GroupJoinEmailOpts) {
  const firstName = (opts.name || 'there').trim().split(/\s+/)[0];
  const confirmation = await renderBoth(
    <GroupJoinConfirmation firstName={firstName} groupName={opts.groupName} groupUrl={opts.groupUrl} />,
  );
  const alert = await renderBoth(
    <GroupJoinAdmin
      memberName={opts.name}
      memberEmail={opts.to}
      groupName={opts.groupName}
      groupUrl={opts.groupUrl}
    />,
  );
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.to, `Welcome to ${opts.groupName}`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, `New group join — ${opts.groupName}`, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// VENUE CLAIM (claim_requests collection — public, partner-link, email-link)
// ────────────────────────────────────────────────────────────────────────────

export interface VenueClaimEmailOpts {
  claimantEmail: string;
  claimantName: string;
  businessName: string;
  placeName: string;
  placeUrl?: string;
  message?: string;
}

export async function sendVenueClaimEmails(opts: VenueClaimEmailOpts) {
  const firstName = (opts.claimantName || 'there').trim().split(/\s+/)[0];
  const confirmation = await renderBoth(
    <VenueClaimConfirmation firstName={firstName} businessName={opts.businessName} />,
  );
  const alert = await renderBoth(
    <VenueClaimAdmin
      claimantName={opts.claimantName}
      claimantEmail={opts.claimantEmail}
      businessName={opts.businessName}
      placeName={opts.placeName}
      placeUrl={opts.placeUrl}
      message={opts.message?.slice(0, 600)}
    />,
  );
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.claimantEmail, `Thanks — your ${opts.businessName} claim is in review`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, `[Claim] ${opts.businessName} (${opts.placeName})`, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// ONBOARDING SUBMISSIONS (Pet Parent / Animal Lover)
// ────────────────────────────────────────────────────────────────────────────

export interface OnboardingSubmissionEmailOpts {
  type: 'pet_parent' | 'animal_lover';
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  petName?: string;
  petType?: string;
  instagram?: string | null;
  foundingClubInterest?: string;
  interests?: string[];
  submissionId: string;
}

export async function sendOnboardingSubmissionEmails(opts: OnboardingSubmissionEmailOpts) {
  const isPetParent = opts.type === 'pet_parent';
  const label = isPetParent ? 'Pet Parent' : 'Animal Lover';
  const igClean = typeof opts.instagram === 'string' ? opts.instagram : undefined;

  const confirmation = isPetParent
    ? await renderBoth(
        <OnboardingPetParentConfirmation firstName={opts.firstName} city={opts.city} petName={opts.petName} />,
      )
    : await renderBoth(
        <OnboardingAnimalLoverConfirmation firstName={opts.firstName} city={opts.city} />,
      );

  const alert = isPetParent
    ? await renderBoth(
        <OnboardingPetParentAdmin
          firstName={opts.firstName}
          lastName={opts.lastName}
          email={opts.email}
          city={opts.city}
          instagram={igClean}
          petName={opts.petName}
          petType={opts.petType}
          foundingClubInterest={opts.foundingClubInterest}
          submissionId={opts.submissionId}
        />,
      )
    : await renderBoth(
        <OnboardingAnimalLoverAdmin
          firstName={opts.firstName}
          lastName={opts.lastName}
          email={opts.email}
          city={opts.city}
          instagram={igClean}
          interests={opts.interests}
          submissionId={opts.submissionId}
        />,
      );

  const subjectAlert = `New ${label} signup — ${opts.firstName || opts.email}${opts.city ? ` (${opts.city})` : ''}`;
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.email, `Welcome to Hey Lola — you're on the list`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, subjectAlert, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// VENUE INTAKE (Start.tsx VenueForm → venue_claims)
// ────────────────────────────────────────────────────────────────────────────

export interface VenueIntakeEmailOpts {
  businessName: string;
  category?: string;
  city: string;
  address?: string;
  contactPerson: string;
  contactRole?: string;
  email: string;
  phone?: string;
  petFriendlyStatus?: string;
  perkInterest?: string;
  notes?: string;
  website?: string;
  instagram?: string;
  claimId: string;
}

export async function sendVenueIntakeEmails(opts: VenueIntakeEmailOpts) {
  const firstName = (opts.contactPerson || 'there').trim().split(/\s+/)[0];
  const hasPerk = !!opts.perkInterest && opts.perkInterest !== 'Tell me more';

  const confirmation = await renderBoth(
    <VenueIntakeConfirmation firstName={firstName} businessName={opts.businessName} hasPerk={hasPerk} />,
  );
  const alert = await renderBoth(
    <VenueIntakeAdmin
      businessName={opts.businessName}
      category={opts.category}
      city={opts.city}
      address={opts.address}
      website={opts.website}
      instagram={opts.instagram}
      contactPerson={opts.contactPerson}
      contactRole={opts.contactRole}
      email={opts.email}
      phone={opts.phone}
      petFriendlyStatus={opts.petFriendlyStatus}
      perkInterest={opts.perkInterest}
      notes={opts.notes}
      claimId={opts.claimId}
    />,
  );

  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.email, `Thanks — ${opts.businessName} is in our review queue`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, `[Venue intake] ${opts.businessName}${opts.city ? ` — ${opts.city}` : ''}`, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// WAITLIST (member signup from WaitlistModal)
// ────────────────────────────────────────────────────────────────────────────

export interface WaitlistEmailOpts {
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  dogName?: string;
  dogType?: string;
  plan?: string;
  perks?: string;
  entryId: string;
}

export async function sendWaitlistEmails(opts: WaitlistEmailOpts) {
  const firstName = (opts.firstName || 'there').trim().split(/\s+/)[0];
  const confirmation = await renderBoth(
    <WaitlistConfirmation firstName={firstName} city={opts.city} plan={opts.plan} />,
  );
  const alert = await renderBoth(
    <WaitlistAdmin
      firstName={opts.firstName}
      lastName={opts.lastName}
      email={opts.email}
      city={opts.city}
      plan={opts.plan}
      dogName={opts.dogName}
      dogType={opts.dogType}
      perks={opts.perks}
      entryId={opts.entryId}
    />,
  );
  const subjectAlert = `New waitlist signup — ${opts.firstName || opts.email}${opts.city ? ` (${opts.city})` : ''}`;
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.email, `You're on the Hey Lola waitlist`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, subjectAlert, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// BUSINESS LEAD (B2B inquiry from /signup)
// ────────────────────────────────────────────────────────────────────────────

export interface BusinessLeadEmailOpts {
  businessName: string;
  contactRole?: string;
  location?: string;
  reason?: string;
  email: string;
  leadId: string;
}

export async function sendBusinessLeadEmails(opts: BusinessLeadEmailOpts) {
  const confirmation = await renderBoth(<BusinessLeadConfirmation businessName={opts.businessName} />);
  const alert = await renderBoth(
    <BusinessLeadAdmin
      businessName={opts.businessName}
      email={opts.email}
      contactRole={opts.contactRole}
      location={opts.location}
      reason={opts.reason}
      leadId={opts.leadId}
    />,
  );
  const subjectAlert = `[B2B lead] ${opts.businessName}${opts.location ? ` — ${opts.location}` : ''}`;
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.email, `Thanks for reaching out — Hey Lola for ${opts.businessName}`, confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, subjectAlert, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// SIGNUP (new account via Auth.tsx — email/password or Google OAuth)
// ────────────────────────────────────────────────────────────────────────────

export interface SignupEmailOpts {
  firstName: string;
  lastName?: string;
  email: string;
  username?: string;
  userType?: string;
  signupMethod: 'email' | 'google';
  emailVerified?: boolean;
  referredBy?: string;
  dashboardUrl: string;
  /** Firebase-issued verification URL. Embedded as the primary CTA for
   *  email/password signups; omit (or undefined) for Google OAuth. */
  verifyUrl?: string;
  userId: string;
}

export async function sendSignupEmails(opts: SignupEmailOpts) {
  const firstName = (opts.firstName || 'there').trim().split(/\s+/)[0];

  const confirmation = await renderBoth(
    <SignupConfirmation
      firstName={firstName}
      dashboardUrl={opts.dashboardUrl}
      signupMethod={opts.signupMethod}
      verifyUrl={opts.verifyUrl}
    />,
  );
  const alert = await renderBoth(
    <SignupAdmin
      firstName={opts.firstName}
      lastName={opts.lastName}
      email={opts.email}
      username={opts.username}
      userType={opts.userType}
      signupMethod={opts.signupMethod}
      emailVerified={opts.emailVerified}
      referredBy={opts.referredBy}
      userId={opts.userId}
    />,
  );

  const subjectAlert = `New signup — ${opts.firstName || opts.email}${opts.signupMethod === 'google' ? ' (Google)' : ''}`;
  const [confirmationResult, alertResult] = await Promise.all([
    sendOne(opts.email, 'Welcome to Hey Lola', confirmation.html, confirmation.text),
    sendOne(ADMIN_INBOX, subjectAlert, alert.html, alert.text),
  ]);
  return { confirmation: confirmationResult, alert: alertResult };
}

// ────────────────────────────────────────────────────────────────────────────
// SUBSCRIBER BROADCAST
// ────────────────────────────────────────────────────────────────────────────

export interface SubscriberBroadcastEmailOpts {
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface BroadcastRecipient {
  email: string;
  firstName?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// ONBOARDING COMPLETE (user finishes their pet passport)
// ────────────────────────────────────────────────────────────────────────────

export interface OnboardingCompleteEmailOpts {
  firstName: string;
  email: string;
  petName?: string;
  dashboardUrl: string;
  exploreUrl: string;
  userId: string;
}

export async function sendOnboardingCompleteEmail(opts: OnboardingCompleteEmailOpts) {
  const firstName = (opts.firstName || 'there').trim().split(/\s+/)[0];
  const { html, text } = await renderBoth(
    <OnboardingComplete
      firstName={firstName}
      petName={opts.petName}
      dashboardUrl={opts.dashboardUrl}
      exploreUrl={opts.exploreUrl}
    />,
  );
  const subject = opts.petName
    ? `${opts.petName}'s passport is ready`
    : 'Your passport is ready';
  return sendOne(opts.email, subject, html, text);
}

// ────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFIED (user confirms their email address)
// ────────────────────────────────────────────────────────────────────────────

export interface EmailVerifiedEmailOpts {
  firstName: string;
  email: string;
  dashboardUrl: string;
  userId: string;
}

export async function sendEmailVerifiedEmail(opts: EmailVerifiedEmailOpts) {
  const firstName = (opts.firstName || 'there').trim().split(/\s+/)[0];
  const { html, text } = await renderBoth(
    <EmailVerified firstName={firstName} dashboardUrl={opts.dashboardUrl} />,
  );
  return sendOne(opts.email, "You're verified — welcome to Hey Lola", html, text);
}

// ────────────────────────────────────────────────────────────────────────────
// SUBSCRIBER BROADCAST
// ────────────────────────────────────────────────────────────────────────────

export async function sendSubscriberBroadcast(
  opts: SubscriberBroadcastEmailOpts,
  recipients: BroadcastRecipient[],
): Promise<{ total: number; delivered: number; failed: number; results: Array<{ email: string; result: SendResult }> }> {
  const results: Array<{ email: string; result: SendResult }> = [];
  let delivered = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const { html, text } = await renderBoth(
      <SubscriberBroadcast
        firstName={recipient.firstName}
        subject={opts.subject}
        body={opts.body}
        ctaLabel={opts.ctaLabel}
        ctaUrl={opts.ctaUrl}
      />,
    );
    const result = await sendOne(recipient.email, opts.subject, html, text);
    results.push({ email: recipient.email, result });
    if (result.delivered) delivered++;
    else failed++;
  }

  return { total: recipients.length, delivered, failed, results };
}
