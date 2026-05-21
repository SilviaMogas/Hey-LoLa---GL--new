import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout';

export interface PartnerApplicationConfirmationProps {
  contactName: string;
  businessName: string;
}

/** Auto-responder fired right after a partner submits /partners/onboard. */
export default function PartnerApplicationConfirmation({ contactName, businessName }: PartnerApplicationConfirmationProps) {
  return (
    <Layout preview={`Welcome to the Hey Lola Partner Network, ${businessName}`}>
      <Section32>
        <Heading1>Welcome to the Hey Lola Partner Network</Heading1>
        <Body14>Hi <strong>{contactName}</strong>,</Body14>
        <Body14>
          Thank you for applying to join the Hey Lola Partner Network as <strong>{businessName}</strong>.
        </Body14>
        <Body14>
          Our team will review your application within <strong>1–2 business days</strong>. Once
          verified, your venue will be featured on Hey Lola's curated city guide and your perk will
          be available to our members.
        </Body14>
        <Body14>
          In the meantime, reach us anytime at <a href="mailto:hey@heylola.co" style={{ color: '#1a1a1a' }}>hey@heylola.co</a>.
        </Body14>
        <Body14>Welcome aboard,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

PartnerApplicationConfirmation.PreviewProps = {
  contactName: 'Sam Rivera',
  businessName: 'The Bow Wow Bistro',
} satisfies PartnerApplicationConfirmationProps;
