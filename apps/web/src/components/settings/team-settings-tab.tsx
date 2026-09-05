'use client';

import { TeamSettingsCard } from '@/components/settings/team-settings-card';

import { useTeamSettings } from '@/hooks/use-team-settings';

export function TeamSettingsTab() {
  const team = useTeamSettings(true);

  if (team.loading && !team.team) {
    return (
      <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
        Loading team members...
      </div>
    );
  }

  if (!team.team) {
    return (
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
        {team.error ?? 'Unable to load team members.'}
      </div>
    );
  }

  return (
    <TeamSettingsCard
      team={team.team}
      inviting={team.inviting}
      refreshing={team.loading}
      resendingInvitationId={team.resendingInvitationId}
      cancellingInvitationId={team.cancellingInvitationId}
      updatingMemberId={team.updatingMemberId}
      error={team.error}
      success={team.success}
      onInvite={team.invite}
      onRefresh={team.refresh}
      onResendInvitation={team.resendInvitation}
      onCancelInvitation={team.cancelInvitation}
      onUpdateMemberRole={team.updateMemberRole}
      onDeactivateMember={team.deactivateMember}
      onReactivateMember={team.reactivateMember}
    />
  );
}
