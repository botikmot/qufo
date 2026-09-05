import type { Metadata } from 'next';

import { JoinTeamCard } from '@/components/team/join-team-card';

export const metadata: Metadata = {
  title: 'Join workspace | QUFO',
  description: 'Accept your invitation to join a QUFO workspace.',
};

type JoinPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function JoinPage({
  searchParams,
}: JoinPageProps) {
  const parameters = await searchParams;

  const tokenValue = parameters.token;

  const token = (
    Array.isArray(tokenValue)
      ? tokenValue[0]
      : tokenValue ?? ''
  ).trim();

  return <JoinTeamCard token={token} />;
}
