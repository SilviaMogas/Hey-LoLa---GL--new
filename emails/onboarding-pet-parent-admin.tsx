import * as React from 'react';
import { Layout, Section32, Heading2, Body14, KeyValueTable, Muted12 } from './_components/Layout';

export interface OnboardingPetParentAdminProps {
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  instagram?: string;
  petName?: string;
  petType?: string;
  foundingClubInterest?: string;
  submissionId: string;
}

export default function OnboardingPetParentAdmin(props: OnboardingPetParentAdminProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Name', [props.firstName, props.lastName].filter(Boolean).join(' ') || '—'],
    ['Email', <a href={`mailto:${props.email}`} style={{ color: '#1a1a1a' }}>{props.email}</a>],
    ['City', props.city || '—'],
  ];
  if (props.instagram) rows.push(['Instagram', props.instagram]);
  if (props.petName) rows.push(['Pet', `${props.petName}${props.petType ? ` (${props.petType})` : ''}`]);
  if (props.foundingClubInterest) rows.push(['Founding Club', props.foundingClubInterest]);

  return (
    <Layout preview={`New Pet Parent signup — ${props.firstName}`}>
      <Section32>
        <Heading2>New Pet Parent signup</Heading2>
        <Body14>Submitted from the public /start page.</Body14>
      </Section32>
      <KeyValueTable rows={rows} />
      <Section32>
        <Muted12>Submission ID: <code style={{ fontFamily: 'ui-monospace, monospace' }}>{props.submissionId}</code></Muted12>
      </Section32>
    </Layout>
  );
}

OnboardingPetParentAdmin.PreviewProps = {
  firstName: 'Lola',
  lastName: 'Martinez',
  email: 'lola@example.com',
  city: 'Miami',
  instagram: '@lola.and.coco',
  petName: 'Coco',
  petType: 'Dog',
  foundingClubInterest: 'Yes',
  submissionId: 'sub_abc123',
} satisfies OnboardingPetParentAdminProps;
