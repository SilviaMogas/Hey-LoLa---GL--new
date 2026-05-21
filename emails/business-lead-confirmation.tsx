import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout';

export interface BusinessLeadConfirmationProps {
  businessName: string;
}

/** Auto-responder for the B2B signup branch (Auth.tsx → "Business"). */
export default function BusinessLeadConfirmation({ businessName }: BusinessLeadConfirmationProps) {
  return (
    <Layout preview={`Thanks for reaching out — Hey Lola for ${businessName}`}>
      <Section32>
        <Heading1>Thanks for reaching out</Heading1>
        <Body14>Hi there,</Body14>
        <Body14>
          Thanks for reaching out to Hey Lola on behalf of <strong>{businessName}</strong>.
        </Body14>
        <Body14>
          We've passed your inquiry to our partnerships team. Someone will follow up within{' '}
          <strong>2 business days</strong> to talk through how Hey Lola can work for you.
        </Body14>
        <Body14>
          If you need anything sooner, reply to this email or write to{' '}
          <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

BusinessLeadConfirmation.PreviewProps = {
  businessName: 'The Bow Wow Bistro',
} satisfies BusinessLeadConfirmationProps;
