import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton } from './_components/Layout.js';

export interface EmailVerifiedProps {
  firstName: string;
  dashboardUrl: string;
}

export default function EmailVerified({ firstName, dashboardUrl }: EmailVerifiedProps) {
  return (
    <Layout preview="You're verified — full access unlocked" accent="orange">
      <Section32>
        <Heading1>You're verified</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          Your email is confirmed. You now have full access to Hey Lola — no more
          reminders, no restrictions.
        </Body14>
        <Body14>With your verified account you can:</Body14>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', color: '#1a1a1a' }}>
          <li><strong>Unlock partner perks.</strong> Exclusive offers at verified dog-friendly venues.</li>
          <li><strong>Join the community.</strong> Connect with other dog parents and share discoveries.</li>
          <li><strong>Build trust.</strong> Your verified badge helps partners and members know you're real.</li>
        </ul>
      </Section32>
      <CtaButton href={dashboardUrl} color="orange">Go to your dashboard</CtaButton>
      <Section32>
        <Body14>
          Questions? Reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

EmailVerified.PreviewProps = {
  firstName: 'Lola',
  dashboardUrl: 'https://heylola.co/dashboard',
} satisfies EmailVerifiedProps;
