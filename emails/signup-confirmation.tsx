import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton, Muted12 } from './_components/Layout';

export interface SignupConfirmationProps {
  firstName: string;
  dashboardUrl: string;
  signupMethod: 'email' | 'google';
  /**
   * Firebase-issued verification URL. Required for `email` signups
   * (we generate it server-side via Admin SDK and embed it as the primary
   * CTA — this is the ONLY verification email the user receives, so the
   * link must work). Omit for `google` signups where the email is already
   * verified by Google.
   */
  verifyUrl?: string;
}

/**
 * Branded welcome email fired right after a new account is created via
 * Auth.tsx. For email/password signups this is also the verification
 * email — the CTA below carries the Firebase action link. We deliberately
 * do NOT send a separate Firebase-default verification email so the user
 * receives ONE clear message instead of two.
 */
export default function SignupConfirmation({ firstName, dashboardUrl, signupMethod, verifyUrl }: SignupConfirmationProps) {
  const needsVerification = signupMethod === 'email' && !!verifyUrl;
  const primaryCta = needsVerification ? verifyUrl! : dashboardUrl;
  const primaryLabel = needsVerification ? 'Verify your email' : 'Open your dashboard';

  return (
    <Layout preview={`Welcome to Hey Lola, ${firstName}`}>
      <Section32>
        <Heading1>Welcome to Hey Lola</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          Your account is ready. Welcome to a community that treats pets like
          the family they are.
        </Body14>
        {needsVerification ? (
          <Body14>
            One last step — tap the button below to confirm your email address.
            That unlocks your dashboard, perks and the community.
          </Body14>
        ) : (
          <Body14>Here's what you can do next:</Body14>
        )}
        {!needsVerification ? (
          <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', color: '#1a1a1a' }}>
            <li><strong>Finish your profile.</strong> Tell us about your pet so we can tailor recommendations.</li>
            <li><strong>Explore the city guide.</strong> Verified pet-friendly places, perks and partners.</li>
            <li><strong>Join the community.</strong> Local crews share spots, walks and rescue stories.</li>
          </ul>
        ) : null}
      </Section32>
      <CtaButton href={primaryCta}>{primaryLabel}</CtaButton>
      {needsVerification ? (
        <Section32>
          <Muted12>
            Or paste this link in your browser:<br />
            <a href={verifyUrl} style={{ color: '#888', wordBreak: 'break-all' }}>{verifyUrl}</a>
          </Muted12>
          <Body14>
            After verifying, you'll land on your dashboard with the next steps:
            finish your profile, explore the city guide, and join the community.
          </Body14>
        </Section32>
      ) : null}
      <Section32>
        <Body14>
          Need anything? Just reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

SignupConfirmation.PreviewProps = {
  firstName: 'Lola',
  dashboardUrl: 'https://heylola.co/dashboard',
  signupMethod: 'email',
  verifyUrl: 'https://hey-lola-5c343.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=sample',
} satisfies SignupConfirmationProps;
