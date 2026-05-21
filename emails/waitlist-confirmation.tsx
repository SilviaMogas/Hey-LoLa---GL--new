import * as React from 'react';
import { Layout, Section32, Heading1, Body14 } from './_components/Layout';

export interface WaitlistConfirmationProps {
  firstName: string;
  city?: string;
  plan?: string;
}

/** Auto-responder for WaitlistModal (member branch). */
export default function WaitlistConfirmation({ firstName, city, plan }: WaitlistConfirmationProps) {
  return (
    <Layout preview="You're on the Hey Lola waitlist">
      <Section32>
        <Heading1>You're on the list</Heading1>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>
          Welcome to the Hey Lola{plan ? <> <strong>{plan}</strong></> : null} waitlist.
        </Body14>
        <Body14>
          We'll notify you as soon as early access opens{city ? <> in <strong>{city}</strong></> : null}.
        </Body14>
        <Body14>
          In the meantime, follow along at <a href="https://heylola.co" style={{ color: '#1a1a1a' }}>heylola.co</a>{' '}
          or reply to this email if you have any questions about plans, perks or anything else.
        </Body14>
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

WaitlistConfirmation.PreviewProps = {
  firstName: 'Lola',
  city: 'Miami',
  plan: 'Travel / Plus',
} satisfies WaitlistConfirmationProps;
