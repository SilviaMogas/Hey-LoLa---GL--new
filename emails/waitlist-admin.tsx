import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Quote, Muted12 } from './_components/Layout.js';

export interface WaitlistAdminProps {
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  plan?: string;
  dogName?: string;
  dogType?: string;
  perks?: string;
  entryId: string;
}

export default function WaitlistAdmin(props: WaitlistAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Name', [props.firstName, props.lastName].filter(Boolean).join(' ') || '—'],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
    ['City', props.city || '—'],
  ];
  if (props.plan) rows.push(['Plan', props.plan]);
  if (props.dogName) rows.push(['Dog', `${props.dogName}${props.dogType ? ` (${props.dogType})` : ''}`]);

  return (
    <Layout preview={`New waitlist signup — ${props.firstName}`}>
      <Section32>
        <Heading2>New waitlist signup</Heading2>
        <Body14>Submitted from the WaitlistModal on heylola.co.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      {props.perks ? <Quote><strong>Perks of interest:</strong><br />{props.perks}</Quote> : null}
      <Section32>
        <Muted12>Entry ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.entryId}</code></Muted12>
      </Section32>
    </Layout>
  );
}

WaitlistAdmin.PreviewProps = {
  firstName: 'Lola',
  lastName: 'Martinez',
  email: 'lola@example.com',
  city: 'Miami',
  plan: 'Travel / Plus',
  dogName: 'Coco',
  dogType: 'French Bulldog',
  perks: 'Pet-friendly hotels, grooming discounts, vet partner network.',
  entryId: 'wl_abc123',
} satisfies WaitlistAdminProps;
