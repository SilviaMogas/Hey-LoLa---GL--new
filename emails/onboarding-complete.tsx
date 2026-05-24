import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton } from './_components/Layout.js';

export interface OnboardingCompleteProps {
  firstName: string;
  petName?: string;
  dashboardUrl: string;
  exploreUrl: string;
}

export default function OnboardingComplete({ firstName, petName, dashboardUrl, exploreUrl }: OnboardingCompleteProps) {
  return (
    <Layout preview={`Your passport is ready${petName ? `, ${petName}` : ''}`}>
      <Section32>
        <Heading1>Passport complete</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          {petName
            ? `${petName}'s Hey Lola passport is all set. Your pet profile, records and preferences are saved — you're ready to explore.`
            : `Your Hey Lola profile is all set. Preferences are saved — you're ready to explore.`}
        </Body14>
        <Body14>Here's what to do next:</Body14>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', color: '#1a1a1a' }}>
          <li><strong>Explore the city guide.</strong> Verified dog-friendly places, perks and partner venues.</li>
          <li><strong>Save your favourites.</strong> Bookmark spots to build your personal map.</li>
          <li><strong>Connect with the community.</strong> Meet other dog parents in your city.</li>
        </ul>
      </Section32>
      <CtaButton href={exploreUrl}>Explore the city</CtaButton>
      <Section32>
        <Body14>
          You can always manage your profile and records from your{' '}
          <a href={dashboardUrl} style={{ color: '#1a1a1a' }}>dashboard</a>.
        </Body14>
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

OnboardingComplete.PreviewProps = {
  firstName: 'Lola',
  petName: 'Bruno',
  dashboardUrl: 'https://heylola.co/dashboard',
  exploreUrl: 'https://heylola.co/explore',
} satisfies OnboardingCompleteProps;
