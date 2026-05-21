import * as React from 'react';
import { Layout, Section32, Body14, CtaButton } from './_components/Layout';

export interface GroupJoinConfirmationProps {
  firstName: string;
  groupName: string;
  groupUrl: string;
}

/** Welcome email when a member joins a community group room. */
export default function GroupJoinConfirmation({ firstName, groupName, groupUrl }: GroupJoinConfirmationProps) {
  return (
    <Layout preview={`Welcome to ${groupName}`}>
      <Section32>
        <Body14>Hi <strong>{firstName}</strong>,</Body14>
        <Body14>You're in — welcome to <strong>{groupName}</strong>.</Body14>
        <Body14>Drop in to introduce yourself, share a spot, or just lurk:</Body14>
      </Section32>
      <CtaButton href={groupUrl}>Open {groupName}</CtaButton>
      <Section32>
        <Body14>See you in the pack,<br />The Hey Lola Team</Body14>
      </Section32>
    </Layout>
  );
}

GroupJoinConfirmation.PreviewProps = {
  firstName: 'Lola',
  groupName: 'Crew in Miami',
  groupUrl: 'https://heylola.co/community/crew-in-miami',
} satisfies GroupJoinConfirmationProps;
