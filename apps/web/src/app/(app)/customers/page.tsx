"use client";

import {
  Plus,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/app/page-header";

import {
  CustomerDetailModal,
} from "@/components/customers/customer-detail-modal";

import {
  CustomerFormModal,
} from "@/components/customers/customer-form-modal";

import {
  CustomersTable,
} from "@/components/customers/customers-table";

import {
  CustomersToolbar,
} from "@/components/customers/customers-toolbar";

import {
  useCustomers,
} from "@/hooks/use-customers";

import {
  useWorkspaceAccess,
} from "@/hooks/use-workspace-access";

export default function CustomersPage() {
  const customers =
    useCustomers();

  const {
    readOnly,
  } = useWorkspaceAccess();

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage customer information used across quotations, jobs, and payments."
        action={
          <button
            type="button"
            onClick={
              customers.openCreateForm
            }
            disabled={readOnly}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={17} />

            New customer
          </button>
        }
      />

      <CustomersToolbar
        search={
          customers.search
        }
        onSearchChange={
          customers.setSearch
        }
        onSearch={
          customers.handleSearch
        }
      />

      {customers.error && (
        <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {customers.error}
        </div>
      )}

      <CustomersTable
        customers={
          customers.customers
        }
        loading={
          customers.loading
        }
        page={
          customers.page
        }
        pages={
          customers.pages
        }
        total={
          customers.total
        }
        archivingId={
          customers.archivingId
        }
        onOpen={(customer) =>
          void customers.openCustomer(
            customer,
          )
        }
        onArchive={(customer) => {
          if (readOnly) {
            return;
          }

          void customers.archiveCustomer(
            customer,
          );
        }}
        onPrevious={() =>
          void customers.previousPage()
        }
        onNext={() =>
          void customers.nextPage()
        }
      />

      {customers.selectedCustomer && (
        <CustomerDetailModal
          customer={
            customers.selectedCustomer
          }
          archiving={
            customers.archivingId ===
            customers.selectedCustomer.id
          }
          onClose={
            customers.closeCustomer
          }
          onEdit={() => {
            if (readOnly) {
              return;
            }

            void customers.openEditForm();
          }}
          onArchive={() => {
            if (readOnly) {
              return;
            }

            void customers.archiveCustomer(
              customers.selectedCustomer!,
            );
          }}
        />
      )}

      {customers.showForm && (
        <CustomerFormModal
          key={
            customers.editingCustomer
              ?.id ??
            "new-customer"
          }
          customer={
            customers.editingCustomer
          }
          loading={
            customers.saving
          }
          onClose={
            customers.closeForm
          }
          onSubmit={
            customers.saveCustomer
          }
        />
      )}
    </>
  );
}