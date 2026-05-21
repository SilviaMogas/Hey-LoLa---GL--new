import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable } from './_components/Layout.js';

export interface GroupJoinAdminProps {
  memberName: string;
  memberEmail: string;
  groupName: string;
  groupUrl: string;
}

export default function GroupJoinAdmin(props: GroupJoinAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Group', <strong>{props.groupName}</strong>],
    ['Member', <>{props.memberName || '—'} &lt;<a href={`mailto:${props.memberEmail}`} style={{ color: '#1a1a1a' }}>{props.memberEmail}</a>&gt;</>],
    ['Room', <a href={props.groupUrl} style={{ color: '#1a1a1a' }}>{props.groupUrl}</a>],
  ];
  return (
    <Layout preview={`New group join — ${props.groupName}`}>
      <Section32>
        <Heading2>New community group join</Heading2>
        <Body14>Someone just joined a group room.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
    </Layout>
  );
}

GroupJoinAdmin.PreviewProps = {
  memberName: 'Lola Martinez',
  memberEmail: 'lola@example.com',
  groupName: 'Crew in Miami',
  groupUrl: 'https://heylola.co/community/crew-in-miami',
} satisfies GroupJoinAdminProps;
