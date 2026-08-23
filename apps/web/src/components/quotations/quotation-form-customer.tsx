import type {
  Customer,
} from "@/types/customer";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuotationFormCustomerProps = {
  customers: Customer[];

  value: string;

  onChange: (
    customerId: string,
  ) => void;
};

export function QuotationFormCustomer({
  customers,
  value,
  onChange,
}: QuotationFormCustomerProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        Customer
      </label>

      <Select
        value={value || null}
        onValueChange={(selectedValue) => {
          if (!selectedValue) return;

          onChange(selectedValue);
        }}
      >
        <SelectTrigger className="qufo-input h-auto! w-full">
          <SelectValue>
            {value
              ? (() => {
                  const selectedCustomer =
                    customers.find(
                      (customer) =>
                        customer.id === value,
                    );

                  if (!selectedCustomer) {
                    return "Select customer";
                  }

                  return selectedCustomer.companyName
                    ? `${selectedCustomer.companyName} — ${selectedCustomer.name}`
                    : selectedCustomer.name;
                })()
              : "Select customer"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent align="start">
          {customers.map(
            (customer) => (
              <SelectItem
                key={customer.id}
                value={customer.id}
              >
                {customer.companyName
                  ? `${customer.companyName} — ${customer.name}`
                  : customer.name}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}