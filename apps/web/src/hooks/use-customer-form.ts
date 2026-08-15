"use client";

import {
  type FormEvent,
  useState,
} from "react";

import type {
  Customer,
} from "@/types/customer";

import type {
  CustomerFormData,
} from "@/types/customer-form";

type UseCustomerFormProps = {
  customer?: Customer | null;

  onSubmit: (
    data: CustomerFormData,
  ) => Promise<void>;
};

export function useCustomerForm({
  customer,
  onSubmit,
}: UseCustomerFormProps) {
  const [name, setName] =
    useState(
      customer?.name ?? "",
    );

  const [email, setEmail] =
    useState(
      customer?.email ?? "",
    );

  const [phone, setPhone] =
    useState(
      customer?.phone ?? "",
    );

  const [address, setAddress] =
    useState(
      customer?.address ?? "",
    );

  const [
    companyName,
    setCompanyName,
  ] = useState(
    customer?.companyName ?? "",
  );

  const [notes, setNotes] =
    useState(
      customer?.notes ?? "",
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError(
        "Customer name is required.",
      );

      return;
    }

    try {
      await onSubmit({
        name: name.trim(),

        email:
          email.trim()
            ? email
                .trim()
                .toLowerCase()
            : undefined,

        phone:
          phone.trim() ||
          undefined,

        address:
          address.trim() ||
          undefined,

        companyName:
          companyName.trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save customer.",
      );
    }
  }

  return {
    name,
    email,
    phone,
    address,
    companyName,
    notes,

    error,

    setName,
    setEmail,
    setPhone,
    setAddress,
    setCompanyName,
    setNotes,

    handleSubmit,
  };
}