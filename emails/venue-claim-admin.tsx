import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Quote } from './_components/Layout.js';

export interface VenueClaimAdminProps {
  claimantName: string;
  claimantEmail: string;
  businessName: string;
  placeName: string;
  placeUrl?: string;
  message?: string;
}

export default function VenueClaimAdmin(props: VenueClaimAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Place', props.placeName],
    ['Business', props.businessName],
    ['Claimant', props.claimantName],
    ['Email', <a href={`mailto:${props.claimantEmail}`} style={{ color: '#1a1a1a' }}>{props.claimantEmail}</a>],
  ];
  if (props.placeUrl) rows.push(['Listing', <a href={props.placeUrl} style={{ color: '#1a1a1a' }}>{props.placeUrl}</a>]);

  return (
    <Layout preview={`New venue claim — ${props.businessName}`}>
      <Section32>
        <Heading2>New venue claim</Heading2>
        <Body14>A claim is waiting for manual review.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      {props.message ? <Quote>{props.message}</Quote> : null}
      <Section32>
        <Body14>Review in <em>Admin → Onboarding → Venue claims</em>.</Body14>
      </Section32>
    </Layout>
  );
}

VenueClaimAdmin.PreviewProps = {
  claimantName: 'Sam Rivera',
  claimantEmail: 'sam@bowwowbistro.com',
  businessName: 'The Bow Wow Bistro',
  placeName: 'Bow Wow Bistro · Coconut Grove',
  placeUrl: 'https://heylola.co/venue/bow-wow-bistro-coconut-grove',
  message: 'We just opened our second location and would love to be officially listed. Happy to verify any way you need.',
} satisfies VenueClaimAdminProps;
