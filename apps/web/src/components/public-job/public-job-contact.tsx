import type {
  PublicJob,
} from "@/types/job";

type PublicJobContactProps = {
  organization:
    PublicJob["organization"];
};

export function PublicJobContact({
  organization,
}: PublicJobContactProps) {
  const hasContact =
    Boolean(
      organization.phone ||
        organization.email ||
        organization.address,
    );

  if (!hasContact) {
    return null;
  }

  return (
    <section className="qufo-surface-soft mt-5 rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
        Need help?
      </p>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
        {organization.phone && (
          <span>
            {
              organization.phone
            }
          </span>
        )}

        {organization.email && (
          <span>
            {
              organization.email
            }
          </span>
        )}

        {organization.address && (
          <span>
            {
              organization.address
            }
          </span>
        )}
      </div>
    </section>
  );
}