import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your workspace and QUFO preferences."
      />

      <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-sm text-zinc-500">
        Workspace settings coming later.
      </div>
    </>
  );
}