import { PageHeader } from "@/components/app/page-header";

export default function JobsPage() {
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Track production from queue to completion."
      />

      <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-sm text-zinc-500">
        Job production board coming next.
      </div>
    </>
  );
}