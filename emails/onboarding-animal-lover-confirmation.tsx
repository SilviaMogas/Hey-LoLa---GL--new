import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout.js';

export interface OnboardingAnimalLoverConfirmationProps {
  firstName: string;
  city?: string;
}

/** Auto-responder for the /start Animal Lover form. */
export default function OnboardingAnimalLoverConfirmation({ firstName, city }: OnboardingAnimalLoverConfirmationProps) {
  return (
    <Layout preview="Welcome to the Hey Lola community">
      <Section32>
        <Heading1>Welcome to Hey Lola</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          Welcome to the Hey Lola community{city ? <> from <strong>{city}</strong></> : null}.
          No pet required — just a soft spot for them.
        </Body14>
        <Body14>
          We'll keep you posted on what's brewing — perks, events, rescue stories from our
          Foundation, and ways to get involved.
        </Body14>
        <Body14>
          If you ever want to reach us, just reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

OnboardingAnimalLoverConfirmation.PreviewProps = {
  firstName: 'Alex',
  city: 'Miami',
} satisfies OnboardingAnimalLoverConfirmationProps;
