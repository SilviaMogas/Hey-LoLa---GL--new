import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Muted12 } from './_components/Layout.js';

export interface SignupAdminProps {
  firstName: string;
  lastName?: string;
  email: string;
  username?: string;
  userType?: string;
  signupMethod: 'email' | 'google';
  emailVerified?: boolean;
  referredBy?: string;
  userId: string;
}

/** Internal alert sent to the team inbox when a new account is created. */
export default function SignupAdmin(props: SignupAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Name', [props.firstName, props.lastName].filter(Boolean).join(' ') || '—'],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
    ['Method', props.signupMethod === 'google' ? 'Google OAuth' : 'Email + password'],
    ['Verified', props.emailVerified ? 'Yes' : 'Pending'],
  ];
  if (props.username) rows.push(['Username', `@${props.username}`]);
  if (props.userType) rows.push(['User type', props.userType]);
  if (props.referredBy) rows.push(['Referred by', props.referredBy]);

  return (
    <Layout preview={`New signup — ${props.firstName}${props.lastName ? ` ${props.lastName}` : ''}`}>
      <Section32>
        <Heading2>New Hey Lola account</Heading2>
        <Body14>A new user just finished signup. They land in the onboarding flow next.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      <Section32>
        <Muted12>User ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.userId}</code></Muted12>
        <Body14>Review in <em>Admin → CRM → Members</em>.</Body14>
      </Section32>
    </Layout>
  );
}

SignupAdmin.PreviewProps = {
  firstName: 'Lola',
  lastName: 'Martinez',
  email: 'lola@example.com',
  username: 'lola.miami',
  userType: 'Dog Owner',
  signupMethod: 'email',
  emailVerified: false,
  referredBy: 'COCO2025',
  userId: 'uid_abc123',
} satisfies SignupAdminProps;
