import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Quote, Muted12 } from './_components/Layout';

export interface VenueIntakeAdminProps {
  businessName: string;
  category?: string;
  city: string;
  address?: string;
  website?: string;
  instagram?: string;
  contactPerson: string;
  contactRole?: string;
  email: string;
  phone?: string;
  petFriendlyStatus?: string;
  perkInterest?: string;
  notes?: string;
  claimId: string;
}

export default function VenueIntakeAdmin(props: VenueIntakeAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Business', <strong>{props.businessName}</strong>],
    ...(props.category ? [['Category', props.category] as [string, React.ReactNode]] : []),
    ['City', props.city || '—'],
    ...(props.address ? [['Address', props.address] as [string, React.ReactNode]] : []),
    ...(props.website ? [['Website', <a href={props.website} style={{ color: '#1a1a1a' }}>{props.website}</a>] as [string, React.ReactNode]] : []),
    ...(props.instagram ? [['Instagram', props.instagram] as [string, React.ReactNode]] : []),
    ['Contact', `${props.contactPerson}${props.contactRole ? ` (${props.contactRole})` : ''}`],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
    ...(props.phone ? [['Phone', props.phone] as [string, React.ReactNode]] : []),
    ...(props.petFriendlyStatus ? [['Pet-friendly', props.petFriendlyStatus] as [string, React.ReactNode]] : []),
    ...(props.perkInterest ? [['Perk interest', props.perkInterest] as [string, React.ReactNode]] : []),
  ];

  return (
    <Layout preview={`New venue intake — ${props.businessName}`}>
      <Section32>
        <Heading2>New venue intake</Heading2>
        <Body14>Submitted from the public /start page.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      {props.notes ? <Quote>{props.notes}</Quote> : null}
      <Section32>
        <Muted12>Claim ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.claimId}</code></Muted12>
        <Body14>Review in <em>Admin → Onboarding → Venue claims</em>.</Body14>
      </Section32>
    </Layout>
  );
}

VenueIntakeAdmin.PreviewProps = {
  businessName: 'The Bow Wow Bistro',
  category: 'Restaurant',
  city: 'Miami',
  address: '123 Coconut Grove Dr, Miami, FL',
  website: 'https://bowwowbistro.com',
  instagram: '@bowwowbistro',
  contactPerson: 'Sam Rivera',
  contactRole: 'Owner',
  email: 'sam@bowwowbistro.com',
  phone: '+1 305 555 0142',
  petFriendlyStatus: 'Indoors',
  perkInterest: 'Yes',
  notes: 'We already have a dog water station and a pup-cup menu. Happy to host a Hey Lola meetup.',
  claimId: 'claim_abc123',
} satisfies VenueIntakeAdminProps;
