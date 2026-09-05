import { apiFetch } from '@/lib/api';

import type {
  CancelTeamInvitationResponse,
  CreateTeamInvitationInput,
  CreateTeamInvitationResponse,
  ResendTeamInvitationResponse,
  TeamMemberMutationResponse,
  TeamSummary,
  UpdateTeamMemberRoleInput,
} from '@/types/team';

export function getTeam() {
  return apiFetch<TeamSummary>('/team');
}

export function createTeamInvitation(
  input: CreateTeamInvitationInput,
) {
  return apiFetch<CreateTeamInvitationResponse>(
    '/team/invitations',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function resendTeamInvitation(
  invitationId: string,
) {
  return apiFetch<ResendTeamInvitationResponse>(
    `/team/invitations/${encodeURIComponent(invitationId)}/resend`,
    {
      method: 'POST',
    },
  );
}

export function cancelTeamInvitation(
  invitationId: string,
) {
  return apiFetch<CancelTeamInvitationResponse>(
    `/team/invitations/${encodeURIComponent(invitationId)}`,
    {
      method: 'DELETE',
    },
  );
}

export function updateTeamMemberRole(
  membershipId: string,
  input: UpdateTeamMemberRoleInput,
) {
  return apiFetch<TeamMemberMutationResponse>(
    `/team/members/${encodeURIComponent(membershipId)}/role`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export function deactivateTeamMember(membershipId: string) {
  return apiFetch<TeamMemberMutationResponse>(
    `/team/members/${encodeURIComponent(membershipId)}/deactivate`,
    {
      method: 'POST',
    },
  );
}

export function reactivateTeamMember(membershipId: string) {
  return apiFetch<TeamMemberMutationResponse>(
    `/team/members/${encodeURIComponent(membershipId)}/reactivate`,
    {
      method: 'POST',
    },
  );
}
