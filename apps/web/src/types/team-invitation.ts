import type {
  LoginOrganization,
  OrganizationRole,
} from '@/types/auth';

export type TeamInvitationFailureReason =
  | 'INVALID'
  | 'EXPIRED'
  | 'ACCEPTED'
  | 'CANCELLED'
  | 'UNAVAILABLE';

export type TeamInvitationDetails = {
  email: string;
  role: Exclude<OrganizationRole, 'OWNER'>;
  expiresAt: string;

  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };

  invitedByName: string | null;
};

export type ResolveTeamInvitationResponse = {
  valid: boolean;
  reason: TeamInvitationFailureReason | null;
  invitation: TeamInvitationDetails | null;
};

export type AcceptTeamInvitationResponse = {
  message: string;
  alreadyAccepted: boolean;
  organization: LoginOrganization;

  membership: {
    id: string;
    role: OrganizationRole;
    isActive: boolean;
    joinedAt: string;
  };

  seats: {
    limited: boolean;
    limit: number | null;
    activeMembers: number;
    pendingInvitations: number;
    usedSeats: number;
    remainingSeats: number | null;
  };
};

export type InvitationRegisterResponse = {
  message: string;
  joinedViaInvitation: true;

  organization: {
    id: string;
  };
};
