'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  cancelTeamInvitation,
  createTeamInvitation,
  deactivateTeamMember,
  getTeam,
  reactivateTeamMember,
  resendTeamInvitation,
  updateTeamMemberRole,
} from '@/services/team.service';

import type {
  CreateTeamInvitationInput,
  TeamInvitableRole,
  TeamSummary,
} from '@/types/team';

export function useTeamSettings(enabled: boolean) {
  const [team, setTeam] = useState<TeamSummary | null>(null);

  const [loading, setLoading] = useState(enabled);

  const [inviting, setInviting] = useState(false);

  const [resendingInvitationId, setResendingInvitationId] =
    useState<string | null>(null);

  const [cancellingInvitationId, setCancellingInvitationId] =
    useState<string | null>(null);

  const [updatingMemberId, setUpdatingMemberId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getTeam();

      setTeam(response);

      return response;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to load team members.',
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    void getTeam()
      .then((response) => {
        if (!active) {
          return;
        }

        setTeam(response);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!active) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load team members.',
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  const invite = useCallback(
    async (input: CreateTeamInvitationInput) => {
      setInviting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await createTeamInvitation(input);

        setTeam((current) =>
          current
            ? {
                ...current,
                seats: response.seats,
                invitations: [
                  response.invitation,
                  ...current.invitations.filter(
                    (invitation) =>
                      invitation.id !== response.invitation.id,
                  ),
                ],
              }
            : current,
        );

        setSuccess(response.message);

        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to send the team invitation.',
        );

        return false;
      } finally {
        setInviting(false);
      }
    },
    [],
  );

  const resendInvitation = useCallback(async (invitationId: string) => {
    setResendingInvitationId(invitationId);
    setError(null);
    setSuccess(null);

    try {
      const response = await resendTeamInvitation(invitationId);

      setTeam((current) =>
        current
          ? {
              ...current,
              seats: response.seats,
              invitations: current.invitations.map((invitation) =>
                invitation.id === response.invitation.id
                  ? response.invitation
                  : invitation,
              ),
            }
          : current,
      );

      setSuccess(response.message);

      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to resend the team invitation.',
      );

      return false;
    } finally {
      setResendingInvitationId(null);
    }
  }, []);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    setCancellingInvitationId(invitationId);
    setError(null);
    setSuccess(null);

    try {
      const response = await cancelTeamInvitation(invitationId);

      setTeam((current) =>
        current
          ? {
              ...current,
              seats: response.seats,
              invitations: current.invitations.filter(
                (invitation) => invitation.id !== response.invitationId,
              ),
            }
          : current,
      );

      setSuccess(response.message);

      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to cancel the team invitation.',
      );

      return false;
    } finally {
      setCancellingInvitationId(null);
    }
  }, []);

  const updateMemberRole = useCallback(
    async (membershipId: string, role: TeamInvitableRole) => {
      setUpdatingMemberId(membershipId);
      setError(null);
      setSuccess(null);

      try {
        const response = await updateTeamMemberRole(membershipId, {
          role,
        });

        setTeam((current) =>
          current
            ? {
                ...current,
                seats: response.seats,
                members: current.members.map((member) =>
                  member.id === response.member.id
                    ? response.member
                    : member,
                ),
              }
            : current,
        );

        setSuccess(response.message);

        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to update the team member role.',
        );

        return false;
      } finally {
        setUpdatingMemberId(null);
      }
    },
    [],
  );

  const deactivateMember = useCallback(async (membershipId: string) => {
    setUpdatingMemberId(membershipId);
    setError(null);
    setSuccess(null);

    try {
      const response = await deactivateTeamMember(membershipId);

      setTeam((current) =>
        current
          ? {
              ...current,
              seats: response.seats,
              members: current.members.map((member) =>
                member.id === response.member.id
                  ? response.member
                  : member,
              ),
            }
          : current,
      );

      setSuccess(response.message);

      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to deactivate the team member.',
      );

      return false;
    } finally {
      setUpdatingMemberId(null);
    }
  }, []);

  const reactivateMember = useCallback(async (membershipId: string) => {
    setUpdatingMemberId(membershipId);
    setError(null);
    setSuccess(null);

    try {
      const response = await reactivateTeamMember(membershipId);

      setTeam((current) =>
        current
          ? {
              ...current,
              seats: response.seats,
              members: current.members.map((member) =>
                member.id === response.member.id
                  ? response.member
                  : member,
              ),
            }
          : current,
      );

      setSuccess(response.message);

      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to reactivate the team member.',
      );

      return false;
    } finally {
      setUpdatingMemberId(null);
    }
  }, []);

  return {
    team,
    loading:
      enabled &&
      (loading ||
        (team === null && error === null)),
    inviting,
    resendingInvitationId,
    cancellingInvitationId,
    updatingMemberId,
    error,
    success,
    refresh,
    invite,
    resendInvitation,
    cancelInvitation,
    updateMemberRole,
    deactivateMember,
    reactivateMember,
  };
}
