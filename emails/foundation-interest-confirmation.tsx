import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton, Quote } from './_components/Layout.js';

export interface FoundationInterestConfirmationProps {
  contactName?: string;
  dogName: string;
  partnerName?: string;
  passportUrl: string;
}

/** Auto-responder fired when a user expresses interest in a rescue passport. */
export default function FoundationInterestConfirmation(props: FoundationInterestConfirmationProps) {
  const name = props.contactName || 'there';
  const partner = props.partnerName || 'the rescue partner';
  return (
    <Layout preview={`Your interest in ${props.dogName} — Hey Lola Foundation`} accent="orange">
      <Section32>
        <Heading1>Thank you for showing interest in {props.dogName}</Heading1>
        <Body14>Hi <strong>{name}</strong>,</Body14>
        <Body14>
          Thank you for expressing interest in <strong>{props.dogName}</strong> through the Hey Lola Foundation.
        </Body14>
      </Section32>
      <Quote tint="cream">
        <strong>This is not an adoption application.</strong> It is a warm signal that connects you
        with {partner} so they can guide you through their official process.
      </Quote>
      <Section32>
        <Body14>
          We have forwarded your details to the partner and to our team. Someone will be in touch
          within <strong>1–2 business days</strong>.
        </Body14>
      </Section32>
      <CtaButton href={props.passportUrl} color="orange">
        View {props.dogName}'s passport
      </CtaButton>
      <Section32>
        <Body14>With love,<br />The Hey Lola Foundation</Body14>
      </Section32>
    </Layout>
  );
}

FoundationInterestConfirmation.PreviewProps = {
  contactName: 'Alex Martinez',
  dogName: 'Luna',
  partnerName: 'Pet Rescue Miami',
  passportUrl: 'https://heylola.co/foundation/dogs/luna-miami',
} satisfies FoundationInterestConfirmationProps;
