'use client';

import {
  useEffect,
  useState,
} from 'react';

import type {
  FormEvent,
  ReactNode,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Building2,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogIn,
  Mail,
  UserPlus,
  Users,
} from 'lucide-react';

import { apiFetch } from '@/lib/api';

import {
  clearAuthSession,
  saveLoginSession,
  setActiveOrganization,
  useAuthSession,
} from '@/lib/auth-storage';

import { acceptTeamInvitation, resolveTeamInvitation } from '@/services/team-invitations.service';

import type { LoginResponse } from '@/types/auth';

import type { InvitationRegisterResponse, TeamInvitationDetails, TeamInvitationFailureReason } from '@/types/team-invitation';

type JoinTeamCardProps = {
  token: string;
};

type FormMode = 'SIGN_IN' | 'REGISTER';

type InvitationState =
  | {
      status: 'LOADING';
    }
  | {
      status: 'INVALID';
      reason: TeamInvitationFailureReason;
    }
  | {
      status: 'READY';
      invitation: TeamInvitationDetails;
    };

export function JoinTeamCard({ token }: JoinTeamCardProps) {
  const router = useRouter();

  const session = useAuthSession();

  const [invitationState, setInvitationState] =
    useState<InvitationState>(
      token
        ? {
            status: 'LOADING',
          }
        : {
            status: 'INVALID',
            reason: 'INVALID',
          },
    );

  const [mode, setMode] = useState<FormMode>('SIGN_IN');

  const [name, setName] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    void resolveTeamInvitation(token)
      .then((response) => {
        if (!active) {
          return;
        }

        if (!response.valid || !response.invitation) {
          setInvitationState({
            status: 'INVALID',
            reason: response.reason ?? 'UNAVAILABLE',
          });

          return;
        }

        setInvitationState({
          status: 'READY',
          invitation: response.invitation,
        });
      })
      .catch(() => {
        if (active) {
          setInvitationState({
            status: 'INVALID',
            reason: 'UNAVAILABLE',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  function getErrorMessage(caught: unknown, fallback: string) {
    return caught instanceof Error ? caught.message : fallback;
  }

  async function acceptWithCurrentSession() {
    if (invitationState.status !== 'READY') {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const accepted = await acceptTeamInvitation(token);

      setActiveOrganization(accepted.organization);

      router.replace('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(
        getErrorMessage(caught, 'Unable to accept the invitation.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (invitationState.status !== 'READY') {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const loginResponse = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        requireAuth: false,

        body: JSON.stringify({
          email: invitationState.invitation.email,
          password,
        }),
      });

      const currentOrganization = loginResponse.organizations[0];

      if (!currentOrganization) {
        throw new Error(
          'Your account does not currently belong to a workspace.',
        );
      }

      /*
       * The accept endpoint requires authentication but not tenant
       * membership, so any existing organization can temporarily be
       * selected while the invitation is accepted.
       */
      saveLoginSession(loginResponse, currentOrganization);

      const accepted = await acceptTeamInvitation(token);

      setActiveOrganization(accepted.organization);

      router.replace('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to sign in.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (invitationState.status !== 'READY') {
      return;
    }

    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError(
        'Please agree to the Terms of Service and acknowledge the Privacy Policy.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const registration =
        await apiFetch<InvitationRegisterResponse>('/auth/register', {
          method: 'POST',
          requireAuth: false,

          body: JSON.stringify({
            name,
            email: invitationState.invitation.email,
            password,
            acceptedTerms,
            invitationToken: token,
          }),
        });

      const loginResponse = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        requireAuth: false,

        body: JSON.stringify({
          email: invitationState.invitation.email,
          password,
        }),
      });

      const joinedOrganization = loginResponse.organizations.find(
        (organization) => organization.id === registration.organization.id,
      );

      if (!joinedOrganization) {
        throw new Error(
          'Your account was created, but the invited workspace was not found.',
        );
      }

      saveLoginSession(loginResponse, joinedOrganization);

      router.replace('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(
        getErrorMessage(caught, 'Unable to create your account.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function useAnotherAccount() {
    clearAuthSession();
    setMode('SIGN_IN');
    setError(null);
  }

  if (invitationState.status === 'LOADING') {
    return (
      <PageShell>
        <div className="flex flex-col items-center py-12 text-center">
          <LoaderCircle className="size-7 animate-spin text-emerald-300" />

          <p className="mt-4 text-sm text-slate-400">
            Checking your invitation...
          </p>
        </div>
      </PageShell>
    );
  }

  if (invitationState.status === 'INVALID') {
    return (
      <PageShell>
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/[0.08] text-red-300">
            <KeyRound size={20} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-100">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {invitationFailureMessage(invitationState.reason)}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Go to sign in
          </Link>
        </div>
      </PageShell>
    );
  }

  const invitation = invitationState.invitation;

  const sessionMatchesInvitation =
    session?.user.email.trim().toLowerCase() ===
    invitation.email.trim().toLowerCase();

  return (
    <PageShell>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/[0.09] text-emerald-300">
          <Users size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400">
            Team invitation
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-slate-100">
            Join {invitation.organization.name}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {invitation.invitedByName
              ? `${invitation.invitedByName} invited you`
              : 'You were invited'}{' '}
            to join this QUFO workspace as {formatRole(invitation.role)}.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InvitationDetail
          icon={<Building2 size={15} />}
          label="Workspace"
          value={invitation.organization.name}
        />

        <InvitationDetail
          icon={<Mail size={15} />}
          label="Invited email"
          value={invitation.email}
        />
      </div>

      {session && sessionMatchesInvitation ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />

            <div>
              <div className="text-sm font-medium text-slate-200">
                Signed in as {session.user.name}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {session.user.email}
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            type="button"
            disabled={submitting}
            onClick={() => void acceptWithCurrentSession()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}

            {submitting ? 'Joining workspace...' : 'Accept invitation'}
          </button>
        </div>
      ) : session ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
            <p className="text-sm leading-6 text-amber-200/80">
              You are signed in as {session.user.email}. This invitation was
              sent to {invitation.email}.
            </p>
          </div>

          <button
            type="button"
            onClick={useAnotherAccount}
            className="mt-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
          >
            Sign in with the invited email
          </button>
        </div>
      ) : (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="grid grid-cols-2 rounded-xl bg-slate-950/40 p-1">
            <ModeButton
              active={mode === 'SIGN_IN'}
              onClick={() => {
                setMode('SIGN_IN');
                setError(null);
              }}
            >
              Sign in
            </ModeButton>

            <ModeButton
              active={mode === 'REGISTER'}
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
            >
              Create account
            </ModeButton>
          </div>

          {mode === 'SIGN_IN' ? (
            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <ReadOnlyEmail email={invitation.email} />

              <PasswordField
                id="join-password"
                label="Password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={submitting || password.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}

                {submitting ? 'Signing in...' : 'Sign in and join'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="join-name"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Your name
                </label>

                <input
                  id="join-name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="qufo-input"
                  placeholder="John Doe"
                />
              </div>

              <ReadOnlyEmail email={invitation.email} />

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="join-new-password"
                  label="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                />

                <PasswordField
                  id="join-confirm-password"
                  label="Confirm password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setAcceptedTerms(event.target.checked)
                    }
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-emerald-400"
                  />

                  <span className="text-xs leading-6 text-slate-500">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-300 underline underline-offset-4"
                    >
                      Terms of Service
                    </Link>{' '}
                    and acknowledge the{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-300 underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !name.trim() ||
                  password.length < 8 ||
                  !acceptedTerms
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}

                {submitting ? 'Creating account...' : 'Create account and join'}
              </button>
            </form>
          )}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-5 py-12 text-white">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Image
              src="/images/qufo_logo_variant2.png"
              alt="QUFO"
              width={60}
              height={60}
              priority
            />
          </Link>
        </div>

        <section className="qufo-surface rounded-3xl p-6 sm:p-8">
          {children}
        </section>

        <p className="mt-5 text-center text-xs text-slate-600">
          QUFO · Move work forward.
        </p>
      </div>
    </main>
  );
}

function InvitationDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-slate-950/20 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {icon}
        {label}
      </div>

      <div className="mt-2 truncate text-sm font-medium text-slate-200">
        {value}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-2.5 text-sm font-medium transition',
        active
          ? 'bg-white/[0.08] text-slate-100'
          : 'text-slate-500 hover:text-slate-300',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ReadOnlyEmail({ email }: { email: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        Invited email
      </label>

      <div className="qufo-input cursor-not-allowed text-slate-500">
        {email}
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        id={id}
        type="password"
        required
        minLength={8}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="qufo-input"
        placeholder="••••••••"
      />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function invitationFailureMessage(reason: TeamInvitationFailureReason) {
  switch (reason) {
    case 'EXPIRED':
      return 'This invitation has expired. Ask the workspace administrator to send a new invitation.';

    case 'ACCEPTED':
      return 'This invitation has already been accepted.';

    case 'CANCELLED':
      return 'This invitation was cancelled by the workspace administrator.';

    case 'INVALID':
      return 'This invitation link is invalid. Check that you opened the complete link from the email.';

    default:
      return 'This invitation is no longer available. Ask the workspace administrator to send a new one.';
  }
}