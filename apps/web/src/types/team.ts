import type {
  OrganizationRole,
} from '@/types/auth';

export type TeamInvitableRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF';

export type TeamSeatUsage = {
  limited: boolean;
  appSumoTier:
    | 'TIER_1'
    | 'TIER_2'
    | 'TIER_3'
    | null;
  limit: number | null;
  activeMembers: number;
  pendingInvitations: number;
  usedSeats: number;
  remainingSeats: number | null;
};

export type TeamMember = {
  id: string;
  role: OrganizationRole;
  canManage: boolean;
  isActive: boolean;
  deactivatedAt: string | null;
  seatLimitSuspendedAt: string | null;
  joinedAt: string;
  suspensionReason:
    | 'SEAT_LIMIT'
    | 'MANUAL'
    | null;

  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    lastLoginAt: string | null;
  };
};

export type TeamInvitation = {
  id: string;
  email: string;
  role: TeamInvitableRole;
  status: 'PENDING';
  expiresAt: string;
  lastSentAt: string;
  resendCount: number;
  createdAt: string;

  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type TeamSummary = {
  seats: TeamSeatUsage;

  permissions: {
    canManageTeam: boolean;
    canInviteAdmins: boolean;
  };

  members: TeamMember[];
  invitations: TeamInvitation[];
};

export type CreateTeamInvitationInput = {
  email: string;
  role: TeamInvitableRole;
};

export type CreateTeamInvitationResponse = {
  message: string;
  invitation: TeamInvitation;
  seats: TeamSeatUsage;
};

export type ResendTeamInvitationResponse = {
  message: string;
  invitation: TeamInvitation;
  seats: TeamSeatUsage;
};

export type CancelTeamInvitationResponse = {
  message: string;
  invitationId: string;
  seats: TeamSeatUsage;
};

export type UpdateTeamMemberRoleInput = {
  role: TeamInvitableRole;
};

export type TeamMemberMutationResponse = {
  message: string;
  member: TeamMember;
  seats: TeamSeatUsage;
};
