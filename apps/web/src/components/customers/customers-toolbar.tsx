"use client";

import type {
  FormEvent,
} from "react";

import {
  Search,
} from "lucide-react";

type CustomersToolbarProps = {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  onSearch: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

export function CustomersToolbar({
  search,
  onSearchChange,
  onSearch,
}: CustomersToolbarProps) {
  return (
    <div className="qufo-surface mb-5 rounded-2xl p-4">
      <form
        onSubmit={onSearch}
        className="relative w-full max-w-sm"
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
        />

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          className="qufo-input !pl-10"
          placeholder="Search customer..."
        />
      </form>
    </div>
  );
}