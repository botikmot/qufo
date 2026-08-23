import {
  Banknote,
  BriefcaseBusiness,
  FileText,
  ReceiptText,
  Users,
  WalletCards,
} from "lucide-react";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  ReportData,
} from "@/types/report";

type ReportsOverviewProps = {
  overview:
    ReportData["overview"];
};

export function ReportsOverview({
  overview,
}: ReportsOverviewProps) {
  const cards = [
    {
      label:
        "Job value",
      value:
        formatCurrency(
          Number(
            overview.totalJobValue,
          ),
        ),
      helper:
        "Jobs created in period",
      icon:
        BriefcaseBusiness,
    },

    {
      label:
        "Collections",
      value:
        formatCurrency(
          Number(
            overview.totalPaid,
          ),
        ),
      helper:
        `${overview.paymentCount} paid payments`,
      icon:
        Banknote,
    },

    {
      label:
        "Outstanding",
      value:
        formatCurrency(
          Number(
            overview.outstandingBalance,
          ),
        ),
      helper:
        "Period job value less collections",
      icon:
        WalletCards,
    },

    {
      label:
        "Quotations",
      value:
        overview.quotations.toLocaleString(),
      helper:
        "Created in period",
      icon:
        FileText,
    },

    {
      label:
        "Jobs",
      value:
        overview.jobs.toLocaleString(),
      helper:
        "Created in period",
      icon:
        ReceiptText,
    },

    {
      label:
        "New customers",
      value:
        overview.customers.toLocaleString(),
      helper:
        "Added in period",
      icon:
        Users,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(
        (card) => {
          const Icon =
            card.icon;

          return (
            <div
              key={
                card.label
              }
              className="qufo-surface rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {
                      card.label
                    }
                  </div>

                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    {
                      card.value
                    }
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    {
                      card.helper
                    }
                  </div>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-300">
                  <Icon
                    size={17}
                  />
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}