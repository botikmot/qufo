type CustomerFormFieldsProps = {
  name: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  notes: string;

  onNameChange: (
    value: string,
  ) => void;

  onEmailChange: (
    value: string,
  ) => void;

  onPhoneChange: (
    value: string,
  ) => void;

  onAddressChange: (
    value: string,
  ) => void;

  onCompanyNameChange: (
    value: string,
  ) => void;

  onNotesChange: (
    value: string,
  ) => void;
};

export function CustomerFormFields({
  name,
  email,
  phone,
  address,
  companyName,
  notes,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  onCompanyNameChange,
  onNotesChange,
}: CustomerFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Customer name
          </label>

          <input
            required
            value={name}
            onChange={(event) =>
              onNameChange(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Company name
          </label>

          <input
            value={companyName}
            onChange={(event) =>
              onCompanyNameChange(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              onEmailChange(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder="customer@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Phone
          </label>

          <input
            value={phone}
            onChange={(event) =>
              onPhoneChange(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder="09xxxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Address
        </label>

        <input
          value={address}
          onChange={(event) =>
            onAddressChange(
              event.target.value,
            )
          }
          className="qufo-input"
          placeholder="Customer address"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Notes
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(event) =>
            onNotesChange(
              event.target.value,
            )
          }
          className="qufo-input resize-none"
          placeholder="Optional internal notes..."
        />
      </div>
    </div>
  );
}