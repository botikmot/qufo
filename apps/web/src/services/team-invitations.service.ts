import { apiFetch } from '@/lib/api';

import type { AcceptTeamInvitationResponse, ResolveTeamInvitationResponse } from '@/types/team-invitation';

export function resolveTeamInvitation(token: string) {
  return apiFetch<ResolveTeamInvitationResponse>(
    '/team-invitations/resolve',
    {
      method: 'POST',
      requireAuth: false,

      body: JSON.stringify({
        token,
      }),
    },
  );
}

export function acceptTeamInvitation(token: string) {
  return apiFetch<AcceptTeamInvitationResponse>(
    '/team-invitations/accept',
    {
      method: 'POST',

      body: JSON.stringify({
        token,
      }),
    },
  );
}
