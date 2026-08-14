import type {
  Customer,
} from "@/types/customer";

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

      <select
        required
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="qufo-input"
      >
        <option value="">
          Select customer
        </option>

        {customers.map(
          (customer) => (
            <option
              key={
                customer.id
              }
              value={
                customer.id
              }
            >
              {customer.companyName
                ? `${customer.companyName} — ${customer.name}`
                : customer.name}
            </option>
          ),
        )}
      </select>
    </div>
  );
}