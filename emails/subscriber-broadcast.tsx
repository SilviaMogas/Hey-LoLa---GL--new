import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton } from './_components/Layout.js';

export interface SubscriberBroadcastProps {
  firstName?: string;
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export default function SubscriberBroadcast({
  firstName,
  subject,
  body,
  ctaLabel,
  ctaUrl,
}: SubscriberBroadcastProps) {
  const paragraphs = body.split('\n').filter((l) => l.trim().length > 0);
  return (
    <Layout preview={subject}>
      <Section32>
        <Heading1>{subject}</Heading1>
        {firstName && <Body14>Hi <strong>{firstName}</strong>,</Body14>}
        {paragraphs.map((p, i) => (
          <Body14 key={i}>{p}</Body14>
        ))}
        {ctaLabel && ctaUrl && (
          <CtaButton href={ctaUrl} color="orange">{ctaLabel}</CtaButton>
        )}
        <Body14>With love,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

SubscriberBroadcast.PreviewProps = {
  firstName: 'Lola',
  subject: 'Big news from Hey Lola',
  body: 'We have some exciting updates to share with our community.\n\nStay tuned for more details coming soon!',
  ctaLabel: 'Visit Hey Lola',
  ctaUrl: 'https://heylola.co',
} satisfies SubscriberBroadcastProps;
