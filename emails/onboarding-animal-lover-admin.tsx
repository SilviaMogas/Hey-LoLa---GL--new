import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Muted12 } from './_components/Layout';

export interface OnboardingAnimalLoverAdminProps {
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  instagram?: string;
  interests?: string[];
  submissionId: string;
}

export default function OnboardingAnimalLoverAdmin(props: OnboardingAnimalLoverAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Name', [props.firstName, props.lastName].filter(Boolean).join(' ') || '—'],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
    ['City', props.city || '—'],
  ];
  if (props.instagram) rows.push(['Instagram', props.instagram]);
  if (props.interests?.length) rows.push(['Interests', props.interests.join(', ')]);

  return (
    <Layout preview={`New Animal Lover signup — ${props.firstName}`}>
      <Section32>
        <Heading2>New Animal Lover signup</Heading2>
        <Body14>Submitted from the public /start page.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      <Section32>
        <Muted12>Submission ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.submissionId}</code></Muted12>
      </Section32>
    </Layout>
  );
}

OnboardingAnimalLoverAdmin.PreviewProps = {
  firstName: 'Alex',
  lastName: 'Martinez',
  email: 'alex@example.com',
  city: 'Miami',
  instagram: '@alexandfoster',
  interests: ['Volunteering', 'Adoption events', 'Foster network'],
  submissionId: 'sub_xyz789',
} satisfies OnboardingAnimalLoverAdminProps;
