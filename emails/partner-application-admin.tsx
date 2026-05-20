import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Muted12 } from './_components/Layout';

export interface PartnerApplicationAdminProps {
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  city?: string;
  applicationId: string;
}

/** Internal alert fired to the team inbox after a new partner application. */
export default function PartnerApplicationAdmin(props: PartnerApplicationAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Business', <strong>{props.businessName}</strong>],
    ['Contact', `${props.contactName}${props.contactRole ? ` (${props.contactRole})` : ''}`],
    ['Email', <a href={`mailto:${props.contactEmail}`} style={{ color: '#1a1a1a' }}>{props.contactEmail}</a>],
  ];
  if (props.city) rows.push(['City', props.city]);

  return (
    <Layout preview={`New partner application — ${props.businessName}`}>
      <Section32>
        <Heading2>New partner application</Heading2>
        <Body14>A new application is waiting in the back office.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      <Section32>
        <Muted12>App ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.applicationId}</code></Muted12>
        <Body14>Open <em>Admin → Partner Apps</em> to review.</Body14>
      </Section32>
    </Layout>
  );
}

PartnerApplicationAdmin.PreviewProps = {
  businessName: 'The Bow Wow Bistro',
  contactName: 'Sam Rivera',
  contactEmail: 'sam@bowwowbistro.com',
  contactRole: 'Owner',
  city: 'Miami',
  applicationId: 'app_abc123',
} satisfies PartnerApplicationAdminProps;
