import { PageHeader } from "@/components/app/page-header";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Monitor collections, balances, and payment history."
      />

      <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-sm text-zinc-500">
        Payment management coming next.
      </div>
    </>
  );
}