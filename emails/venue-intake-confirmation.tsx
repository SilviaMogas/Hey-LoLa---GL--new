import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout';

export interface VenueIntakeConfirmationProps {
  firstName: string;
  businessName: string;
  hasPerk?: boolean;
}

/** Auto-responder for the /start Venue form (venue_claims collection). */
export default function VenueIntakeConfirmation({ firstName, businessName, hasPerk }: VenueIntakeConfirmationProps) {
  return (
    <Layout preview={`Thanks — ${businessName} is in our review queue`}>
      <Section32>
        <Heading1>Your venue intake is in</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>Thank you for submitting <strong>{businessName}</strong> to Hey Lola.</Body14>
        <Body14>
          Our team reviews each venue intake manually. You can expect a reply within{' '}
          <strong>5 business days</strong> with the next steps to verify
          {hasPerk ? ' and confirm your perk' : ''}.
        </Body14>
        <Body14>
          If you need anything, reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>Hey Lola</Body14>
      </Section32>
    </Layout>
  );
}

VenueIntakeConfirmation.PreviewProps = {
  firstName: 'Sam',
  businessName: 'The Bow Wow Bistro',
  hasPerk: true,
} satisfies VenueIntakeConfirmationProps;
