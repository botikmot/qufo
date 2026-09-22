"use client";

import { useState } from "react";

import type { FormEvent } from "react";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MailPlus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  CreateTeamInvitationInput,
  TeamInvitableRole,
  TeamMember,
  TeamSummary,
} from "@/types/team";

type TeamSettingsCardProps = {
  team: TeamSummary;

  inviting: boolean;

  refreshing: boolean;

  resendingInvitationId: string | null;

  cancellingInvitationId: string | null;

  updatingMemberId: string | null;

  error: string | null;

  success: string | null;

  onInvite: (input: CreateTeamInvitationInput) => Promise<boolean>;

  onRefresh: () => Promise<TeamSummary | null>;

  onResendInvitation: (invitationId: string) => Promise<boolean>;

  onCancelInvitation: (invitationId: string) => Promise<boolean>;

  onUpdateMemberRole: (
    membershipId: string,
    role: TeamInvitableRole,
  ) => Promise<boolean>;

  onDeactivateMember: (membershipId: string) => Promise<boolean>;

  onReactivateMember: (membershipId: string) => Promise<boolean>;
};

export function TeamSettingsCard({
  team,
  inviting,
  refreshing,
  resendingInvitationId,
  cancellingInvitationId,
  updatingMemberId,
  error,
  success,
  onInvite,
  onRefresh,
  onResendInvitation,
  onCancelInvitation,
  onUpdateMemberRole,
  onDeactivateMember,
  onReactivateMember,
}: TeamSettingsCardProps) {
  const [email, setEmail] = useState("");

  const [role, setRole] = useState<TeamInvitableRole>("STAFF");

  const [cancelConfirmationId, setCancelConfirmationId] = useState<
    string | null
  >(null);

  const availableRoles: TeamInvitableRole[] = team.permissions.canInviteAdmins
    ? ["ADMIN", "MANAGER", "STAFF"]
    : ["MANAGER", "STAFF"];

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sent = await onInvite({
      email: email.trim(),
      role,
    });

    if (sent) {
      setEmail("");
      setRole("STAFF");
    }
  }

  const seatPercentage =
    team.seats.limit && team.seats.limit > 0
      ? Math.min(100, (team.seats.usedSeats / team.seats.limit) * 100)
      : 0;

  return (
    <div className="qufo-surface min-w-0 overflow-hidden rounded-2xl">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-center justify-between gap-4 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <Users size={18} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">Team members</h2>

            <p className="mt-1 text-xs text-slate-500">
              Invite people and manage access to this workspace.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={() => void onRefresh()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : undefined}
          />
          Refresh
        </button>
      </div>

      {/* =========================================================
          MAIN GRID
      ========================================================= */}

      <div className="grid min-w-0 gap-5 p-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:p-6">
        {/* =======================================================
            LEFT COLUMN
        ======================================================= */}

        <div className="min-w-0 space-y-5">
          {/* -----------------------------------------------------
              SEATS
          ----------------------------------------------------- */}

          <section className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                  Workspace seats
                </div>

                <div className="mt-1.5 text-2xl font-semibold text-white">
                  {team.seats.usedSeats}

                  <span className="ml-1 text-sm font-normal text-slate-500">
                    / {team.seats.limit ?? "Unlimited"}
                  </span>
                </div>
              </div>

              {team.seats.appSumoTier && (
                <span className="shrink-0 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                  {formatTier(team.seats.appSumoTier)}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {team.seats.activeMembers} active member
              {team.seats.activeMembers === 1 ? "" : "s"} and{" "}
              {team.seats.pendingInvitations} pending invitation
              {team.seats.pendingInvitations === 1 ? "" : "s"}.
            </p>

            {team.seats.limit !== null && (
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-950/60">
                <div
                  className={[
                    "h-full rounded-full transition-[width]",
                    seatPercentage >= 100
                      ? "bg-red-400"
                      : seatPercentage >= 80
                        ? "bg-amber-400"
                        : "bg-cyan-400",
                  ].join(" ")}
                  style={{
                    width: `${seatPercentage}%`,
                  }}
                />
              </div>
            )}

            <div className="mt-2 text-[11px] text-slate-600">
              {team.seats.remainingSeats === null
                ? "No member limit."
                : `${team.seats.remainingSeats} seat${
                    team.seats.remainingSeats === 1 ? "" : "s"
                  } remaining.`}
            </div>
          </section>

          {/* -----------------------------------------------------
              INVITE
          ----------------------------------------------------- */}

          {team.permissions.canManageTeam && (
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
                  <MailPlus size={16} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-slate-200">
                    Invite a team member
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Invitation reserves one workspace seat until accepted,
                    cancelled, or expired.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  maxLength={320}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="qufo-input w-full"
                  placeholder="member@example.com"
                />

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      if (value) {
                        setRole(value as TeamInvitableRole);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableRoles.map((availableRole) => (
                        <SelectItem key={availableRole} value={availableRole}>
                          {formatRole(availableRole)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    type="submit"
                    disabled={inviting || !email.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inviting ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <MailPlus size={16} />
                    )}

                    {inviting ? "Sending..." : "Send invite"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* -----------------------------------------------------
              STATUS
          ----------------------------------------------------- */}

          {(success || error) && (
            <div className="space-y-3">
              {success && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

                  {success}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =======================================================
            RIGHT COLUMN
        ======================================================= */}

        <div className="min-w-0 space-y-5">
          {/* -----------------------------------------------------
              MEMBERS
          ----------------------------------------------------- */}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-200">Members</h3>

              <span className="text-xs text-slate-600">
                {team.members.length} total
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
              {team.members.map((member, index) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  withBorder={index > 0}
                  canAssignAdmin={team.permissions.canInviteAdmins}
                  updating={updatingMemberId === member.id}
                  onUpdateRole={onUpdateMemberRole}
                  onDeactivate={onDeactivateMember}
                  onReactivate={onReactivateMember}
                />
              ))}
            </div>
          </section>

          {/* -----------------------------------------------------
              PENDING INVITATIONS
          ----------------------------------------------------- */}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-200">
                Pending invitations
              </h3>

              <span className="text-xs text-slate-600">
                {team.invitations.length} pending
              </span>
            </div>

            {team.invitations.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                {team.invitations.map((invitation, index) => (
                  <div
                    key={invitation.id}
                    className={[
                      "flex flex-col gap-3 bg-slate-950/15 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
                      index > 0 ? "border-t border-white/[0.06]" : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-300">
                        {invitation.email}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                        <span>{formatRole(invitation.role)}</span>

                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} />
                          Expires {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end sm:self-auto">
                      <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2.5 py-1 text-[10px] font-medium text-amber-300">
                        Pending
                      </span>

                      {invitation.resendCount > 0 && (
                        <span className="text-[11px] text-slate-600">
                          Resent {invitation.resendCount}{" "}
                          {invitation.resendCount === 1 ? "time" : "times"}
                        </span>
                      )}

                      {(team.permissions.canInviteAdmins ||
                        invitation.role !== "ADMIN") &&
                        cancelConfirmationId !== invitation.id && (
                          <>
                            <button
                              type="button"
                              disabled={
                                resendingInvitationId !== null ||
                                cancellingInvitationId !== null
                              }
                              onClick={() =>
                                void onResendInvitation(invitation.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {resendingInvitationId === invitation.id ? (
                                <LoaderCircle
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <RefreshCw size={13} />
                              )}

                              {resendingInvitationId === invitation.id
                                ? "Sending..."
                                : "Resend"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                resendingInvitationId !== null ||
                                cancellingInvitationId !== null
                              }
                              onClick={() =>
                                setCancelConfirmationId(invitation.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/10 bg-red-400/[0.035] px-2.5 py-1.5 text-[11px] text-red-300/80 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              Cancel
                            </button>
                          </>
                        )}

                      {cancelConfirmationId === invitation.id && (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.04] p-2">
                          <span className="px-1 text-xs text-red-200">
                            Cancel this invitation?
                          </span>

                          <button
                            type="button"
                            disabled={cancellingInvitationId !== null}
                            onClick={() => setCancelConfirmationId(null)}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
                          >
                            Keep
                          </button>

                          <button
                            type="button"
                            disabled={cancellingInvitationId !== null}
                            onClick={() => {
                              void onCancelInvitation(invitation.id).then(
                                (cancelled) => {
                                  if (cancelled) {
                                    setCancelConfirmationId(null);
                                  }
                                },
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-400 px-2.5 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingInvitationId === invitation.id && (
                              <LoaderCircle
                                size={13}
                                className="animate-spin"
                              />
                            )}

                            {cancellingInvitationId === invitation.id
                              ? "Cancelling..."
                              : "Yes, cancel"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.07] px-5 py-8 text-center text-sm text-slate-600">
                No pending invitations.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  withBorder,
  canAssignAdmin,
  updating,
  onUpdateRole,
  onDeactivate,
  onReactivate,
}: {
  member: TeamMember;

  withBorder: boolean;

  canAssignAdmin: boolean;

  updating: boolean;

  onUpdateRole: (
    membershipId: string,
    role: TeamInvitableRole,
  ) => Promise<boolean>;

  onDeactivate: (membershipId: string) => Promise<boolean>;

  onReactivate: (membershipId: string) => Promise<boolean>;
}) {
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  const availableRoles: TeamInvitableRole[] = canAssignAdmin
    ? ["ADMIN", "MANAGER", "STAFF"]
    : ["MANAGER", "STAFF"];

  return (
    <div
      className={[
        "flex flex-col gap-3 bg-slate-950/15 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        withBorder ? "border-t border-white/[0.06]" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05] text-slate-400">
          {member.user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.user.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound size={16} />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-200">
              {member.user.name}
            </span>

            {member.role === "OWNER" && (
              <ShieldCheck size={13} className="text-emerald-300" />
            )}
          </div>

          <div className="mt-0.5 truncate text-[11px] text-slate-600">
            {member.user.email}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end sm:self-auto">
        {member.canManage ? (
          <Select
            value={member.role}
            disabled={updating}
            onValueChange={(value) => {
              if (value && value !== member.role) {
                void onUpdateRole(member.id, value as TeamInvitableRole);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[120px] rounded-lg text-xs">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>

            <SelectContent>
              {availableRoles.map((availableRole) => (
                <SelectItem key={availableRole} value={availableRole}>
                  {formatRole(availableRole)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[11px] text-slate-400">
            {formatRole(member.role)}
          </span>
        )}

        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
            member.isActive
              ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
              : "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",
          ].join(" ")}
        >
          {member.isActive
            ? "Active"
            : member.suspensionReason === "SEAT_LIMIT"
              ? "Seat suspended"
              : "Inactive"}
        </span>

        {member.canManage && !confirmingDeactivate && (
          <button
            type="button"
            disabled={updating}
            onClick={() => {
              if (member.isActive) {
                setConfirmingDeactivate(true);

                return;
              }

              void onReactivate(member.id);
            }}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-50",
              member.isActive
                ? "border-red-400/10 bg-red-400/[0.035] text-red-300/80 hover:bg-red-400/[0.07] hover:text-red-300"
                : "border-emerald-400/10 bg-emerald-400/[0.035] text-emerald-300/80 hover:bg-emerald-400/[0.07] hover:text-emerald-300",
            ].join(" ")}
          >
            {updating ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : member.isActive ? (
              <UserX size={13} />
            ) : (
              <UserCheck size={13} />
            )}

            {updating
              ? "Updating..."
              : member.isActive
                ? "Deactivate"
                : "Reactivate"}
          </button>
        )}

        {member.canManage && confirmingDeactivate && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.04] p-2">
            <span className="px-1 text-xs text-red-200">
              Deactivate this member?
            </span>

            <button
              type="button"
              disabled={updating}
              onClick={() => setConfirmingDeactivate(false)}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
            >
              Keep active
            </button>

            <button
              type="button"
              disabled={updating}
              onClick={() => {
                void onDeactivate(member.id).then((deactivated) => {
                  if (deactivated) {
                    setConfirmingDeactivate(false);
                  }
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-400 px-2.5 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating && <LoaderCircle size={13} className="animate-spin" />}

              {updating ? "Deactivating..." : "Yes, deactivate"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatTier(tier: string) {
  return tier.replace("TIER_", "AppSumo Tier ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
