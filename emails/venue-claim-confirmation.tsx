import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout.js';

export interface VenueClaimConfirmationProps {
  firstName: string;
  businessName: string;
}

/**
 * Auto-responder for a venue claim — used by all three claim entry points
 * (public dialog, partner-link page, admin-invite link).
 */
export default function VenueClaimConfirmation({ firstName, businessName }: VenueClaimConfirmationProps) {
  return (
    <Layout preview={`Thanks — your ${businessName} claim is in review`}>
      <Section32>
        <Heading1>Your claim is in review</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>Thanks for submitting a claim for <strong>{businessName}</strong>.</Body14>
        <Body14>
          Our team reviews each request manually. <strong>You'll hear back from us within one week</strong>
          {' '}with the next steps to verify the listing.
        </Body14>
        <Body14>
          In the meantime, if you need anything, reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>Hey Lola</Body14>
      </Section32>
    </Layout>
  );
}

VenueClaimConfirmation.PreviewProps = {
  firstName: 'Sam',
  businessName: 'The Bow Wow Bistro',
} satisfies VenueClaimConfirmationProps;
