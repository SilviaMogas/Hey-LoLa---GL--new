import * as React from 'react';
import { Layout, Section32, Heading1, Body14, CtaButton, Muted12 } from './_components/Layout.js';

export interface VenueInviteProps {
  venueName: string;
  claimUrl: string;
}

/**
 * Sent by an admin from the Back Office to invite a venue to claim/verify
 * their listing. Recipient is the venue's contact email; the admin is the
 * initiator so there is no separate notification.
 */
export default function VenueInvite({ venueName, claimUrl }: VenueInviteProps) {
  return (
    <Layout preview={`Claim your ${venueName} listing on Hey Lola`} accent="charcoal">
      <Section32>
        <Heading1>Join the Hey Lola Partner Network</Heading1>
        <Body14>Hi <strong>{venueName}</strong> team,</Body14>
        <Body14>
          We are reaching out from <strong>Hey Lola</strong>, a trust-first platform for pet
          lovers discovering pet-friendly places, services and experiences across different cities.
        </Body14>
        <Body14>
          Your venue has been listed on Hey Lola because it appears to be relevant for our community
          of pet owners and animal lovers.
        </Body14>
        <Body14>
          We would love to invite you to <strong>claim and verify your listing for free</strong> as
          part of our early Hey Lola Partner Network.
        </Body14>
        <Body14>By joining, you can:</Body14>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', color: '#1a1a1a' }}>
          <li>Confirm that your business information is accurate.</li>
          <li>Show pet owners that your venue is officially recognised by Hey Lola.</li>
          <li>Build trust with potential visitors.</li>
          <li>Increase visibility among a highly relevant pet-loving audience.</li>
          <li>Highlight your pet-friendly policies, services or conditions.</li>
          <li>Join an early partner ecosystem before we launch premium features.</li>
        </ul>
        <Body14><strong>For now, joining and verifying your listing is completely free.</strong></Body14>
      </Section32>
      <CtaButton href={claimUrl}>Claim your listing</CtaButton>
      <Section32>
        <Muted12>
          Or paste this link in your browser:<br />
          <a href={claimUrl} style={{ color: '#888', wordBreak: 'break-all' }}>{claimUrl}</a>
        </Muted12>
        <Body14>Once submitted, our team will review the information before marking your venue as verified.</Body14>
      </Section32>
    </Layout>
  );
}

VenueInvite.PreviewProps = {
  venueName: 'The Bow Wow Bistro',
  claimUrl: 'https://heylola.co/claim-listing/abc123',
} satisfies VenueInviteProps;
