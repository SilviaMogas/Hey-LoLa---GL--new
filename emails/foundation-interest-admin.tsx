import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Quote, Muted12 } from './_components/Layout.js';

export interface FoundationInterestAdminProps {
  dogName: string;
  partnerName?: string;
  passportUrl: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  message?: string;
  interestId: string;
}

export default function FoundationInterestAdmin(props: FoundationInterestAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Dog', <><strong>{props.dogName}</strong>{props.partnerName ? <span style={{ color: '#888' }}> ({props.partnerName})</span> : null}</>],
    ['Passport', <a href={props.passportUrl} style={{ color: '#1a1a1a' }}>{props.passportUrl}</a>],
    ['From', <>{props.contactName || '—'} &lt;<a href={`mailto:${props.contactEmail}`} style={{ color: '#1a1a1a' }}>{props.contactEmail}</a>&gt;</>],
  ];
  if (props.contactPhone) rows.push(['Phone', props.contactPhone]);

  return (
    <Layout preview={`New interest — ${props.dogName}`} accent="orange">
      <Section32>
        <Heading2>New rescue passport interest</Heading2>
        <Body14>Someone just expressed interest in a Foundation dog.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      {props.message ? <Quote>{props.message}</Quote> : null}
      <Section32>
        <Muted12>Interest ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.interestId}</code></Muted12>
        <Body14>Open <em>Admin → Foundation → Interest inbox</em> to manage status.</Body14>
      </Section32>
    </Layout>
  );
}

FoundationInterestAdmin.PreviewProps = {
  dogName: 'Luna',
  partnerName: 'Pet Rescue Miami',
  passportUrl: 'https://heylola.co/foundation/dogs/luna-miami',
  contactName: 'Alex Martinez',
  contactEmail: 'alex@example.com',
  contactPhone: '+1 305 555 0142',
  message: 'I live in a dog-friendly apartment with my partner. We can offer Luna lots of love and walks every day.',
  interestId: 'int_xyz789',
} satisfies FoundationInterestAdminProps;
