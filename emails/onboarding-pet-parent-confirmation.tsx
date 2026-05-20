import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout';

export interface OnboardingPetParentConfirmationProps {
  firstName: string;
  city?: string;
  petName?: string;
}

/** Auto-responder for the /start Pet Parent form. */
export default function OnboardingPetParentConfirmation({ firstName, city, petName }: OnboardingPetParentConfirmationProps) {
  return (
    <Layout preview="Welcome to Hey Lola — you're on the list">
      <Section32>
        <Heading1>Welcome to Hey Lola</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          Welcome to Hey Lola{city ? <> from <strong>{city}</strong></> : null} — your details are in.
        </Body14>
        <Body14>
          We'll let you know as soon as early access opens in your city
          {petName ? <> so you and <strong>{petName}</strong> can dive in first</> : null}.
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

OnboardingPetParentConfirmation.PreviewProps = {
  firstName: 'Lola',
  city: 'Miami',
  petName: 'Coco',
} satisfies OnboardingPetParentConfirmationProps;
