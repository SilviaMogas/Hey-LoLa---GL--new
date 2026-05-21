import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Quote, Muted12 } from './_components/Layout';

export interface BusinessLeadAdminProps {
  businessName: string;
  email: string;
  contactRole?: string;
  location?: string;
  reason?: string;
  leadId: string;
}

export default function BusinessLeadAdmin(props: BusinessLeadAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Business', <strong>{props.businessName}</strong>],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
  ];
  if (props.contactRole) rows.push(['Role', props.contactRole]);
  if (props.location) rows.push(['Location', props.location]);

  return (
    <Layout preview={`New B2B inquiry — ${props.businessName}`}>
      <Section32>
        <Heading2>New B2B inquiry</Heading2>
        <Body14>Submitted from the Business branch of /signup.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      {props.reason ? <Quote><strong>Reason:</strong><br />{props.reason}</Quote> : null}
      <Section32>
        <Muted12>Lead ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.leadId}</code></Muted12>
        <Body14>Review in <em>Admin → CRM → Inbound</em>.</Body14>
      </Section32>
    </Layout>
  );
}

BusinessLeadAdmin.PreviewProps = {
  businessName: 'Acme Pet Co.',
  email: 'partnerships@acmepet.com',
  contactRole: 'Head of Brand',
  location: 'New York, NY',
  reason: 'We sell premium dog food and would love to explore a perks partnership with Hey Lola members in Miami and NYC.',
  leadId: 'lead_xyz789',
} satisfies BusinessLeadAdminProps;
