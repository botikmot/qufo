"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Archive,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Plus,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  BusinessLogoUpload,
} from "./business-logo-upload";

import {
  useBusinessProfiles,
} from "@/hooks/use-business-profiles";

import type {
  BusinessProfile,
  CreateBusinessProfileData,
} from "@/types/business-profile";

type ProfileFormState = {
  label: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  quotationTerms: string;
  quotationFooterNote: string;
};

const EMPTY_FORM: ProfileFormState = {
  label: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  quotationTerms: "",
  quotationFooterNote: "",
};

export function BusinessProfilesSection() {
  const businessProfiles =
    useBusinessProfiles();

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selectedProfile,
    setSelectedProfile,
  ] =
    useState<BusinessProfile | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<ProfileFormState>(
      EMPTY_FORM,
    );

  const [
    archiveTarget,
    setArchiveTarget,
  ] =
    useState<BusinessProfile | null>(
      null,
    );

  function openCreate() {
    setSelectedProfile(null);

    setForm({
      ...EMPTY_FORM,
    });

    setModalOpen(true);
  }

  function openEdit(
    profile: BusinessProfile,
  ) {
    setSelectedProfile(profile);

    setForm({
      label:
        profile.label ?? "",

      name:
        profile.name ?? "",

      email:
        profile.email ?? "",

      phone:
        profile.phone ?? "",

      address:
        profile.address ?? "",

      quotationTerms:
        profile.quotationTerms ?? "",

      quotationFooterNote:
        profile.quotationFooterNote ??
        "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (businessProfiles.saving) {
      return;
    }

    setModalOpen(false);
    setSelectedProfile(null);
  }

  function updateField(
    field: keyof ProfileFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const data:
      CreateBusinessProfileData = {
      label:
        form.label.trim(),

      name:
        form.name.trim(),

      email:
        form.email.trim() ||
        null,

      phone:
        form.phone.trim() ||
        null,

      address:
        form.address.trim() ||
        null,

      quotationTerms:
        form.quotationTerms.trim() ||
        null,

      quotationFooterNote:
        form.quotationFooterNote.trim() ||
        null,
    };

    const success =
      selectedProfile
        ? await businessProfiles.update(
            selectedProfile.id,
            data,
          )
        : await businessProfiles.create(
            data,
          );

    if (success) {
      setModalOpen(false);
      setSelectedProfile(null);
    }
  }

  async function handleArchive() {
    if (!archiveTarget) {
      return;
    }

    const success =
      await businessProfiles.archive(
        archiveTarget.id,
      );

    if (success) {
      setArchiveTarget(null);
    }
  }

  if (businessProfiles.loading) {
    return (
      <div className="qufo-surface mt-6 rounded-3xl p-8 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <LoaderCircle
            size={18}
            className="animate-spin"
          />

          Loading business profiles...
        </div>
      </div>
    );
  }

  const mainBusiness =
    businessProfiles.mainBusiness;

  const profiles =
    businessProfiles.profiles;

  const liveSelectedProfile =
    selectedProfile
        ? profiles.find(
            (profile) =>
            profile.id ===
            selectedProfile.id,
        )
        : undefined;

  const defaultProfile =
    profiles.find(
      (profile) =>
        profile.isDefault,
    );

  const defaultBusinessName =
    defaultProfile?.name ??
    mainBusiness?.name ??
    "Main Business";

  return (
    <>
      <section className="qufo-surface mt-6 overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-[var(--qufo-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
              <Building2
                size={18}
              />
            </div>

            <div>
              <h2 className="font-medium text-white">
                Additional business profiles
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage stores, branches,
                or brands that use their
                own business identity on
                quotations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={16} />

            Add business profile
          </button>
        </div>

        <div className="space-y-5 p-6">
          {(businessProfiles.error ||
            businessProfiles.success) && (
            <div
              role={
                businessProfiles.error
                  ? "alert"
                  : "status"
              }
              className={[
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",

                businessProfiles.error
                  ? "border-red-400/15 bg-red-400/[0.05] text-red-300"
                  : "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300",
              ].join(" ")}
            >
              {businessProfiles.error ? (
                <TriangleAlert
                  size={16}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0"
                />
              )}

              <span>
                {businessProfiles.error ??
                  businessProfiles.success}
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                  Default business
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Star
                    size={15}
                    className="text-amber-300"
                  />

                  <span className="text-sm font-medium text-white">
                    {
                      defaultBusinessName
                    }
                  </span>
                </div>
              </div>

              {mainBusiness &&
                !mainBusiness.isDefault && (
                  <button
                    type="button"
                    disabled={
                      businessProfiles.saving
                    }
                    onClick={() => {
                      void businessProfiles
                        .useMainAsDefault();
                    }}
                    className="rounded-xl border border-[var(--qufo-border)] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                  >
                    Use Main Business as
                    default
                  </button>
                )}
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--qufo-border)] px-6 py-10 text-center">
              <Building2
                size={28}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No additional business
                profiles yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                Add a store, branch, or
                brand when you need a
                different name, logo,
                contact details, or
                quotation defaults.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {profiles.map(
                (profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--qufo-border)] bg-slate-950/40">
                        {profile.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              profile.logoUrl
                            }
                            alt=""
                            className="size-full object-contain"
                          />
                        ) : (
                          <Building2
                            size={20}
                            className="text-slate-600"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-white">
                            {profile.name}
                          </h3>

                          {profile.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2 py-1 text-[10px] font-medium text-amber-300">
                              <Star
                                size={10}
                              />

                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {profile.label}
                        </p>

                        {(profile.email ||
                          profile.phone) && (
                          <p className="mt-3 truncate text-xs text-slate-600">
                            {[
                              profile.email,
                              profile.phone,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        {profile.address && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                            {
                              profile.address
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--qufo-border)] pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            profile,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--qufo-border)] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.04]"
                      >
                        <Pencil
                          size={13}
                        />

                        Edit
                      </button>

                      {!profile.isDefault && (
                        <button
                          type="button"
                          disabled={
                            businessProfiles.saving
                          }
                          onClick={() => {
                            void businessProfiles
                              .setDefault(
                                profile.id,
                              );
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--qufo-border)] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                        >
                          <Star
                            size={13}
                          />

                          Set default
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          businessProfiles.saving
                        }
                        onClick={() =>
                          setArchiveTarget(
                            profile,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-red-400/10 px-3 py-2 text-xs text-red-300/80 transition hover:bg-red-400/[0.05] disabled:opacity-50"
                      >
                        <Archive
                          size={13}
                        />

                        Archive
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="qufo-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--qufo-border)] px-6 py-5">
              <div>
                <h2 className="font-medium text-white">
                  {selectedProfile
                    ? "Edit business profile"
                    : "Add business profile"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Separate identity used
                  when creating quotations.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
            >
              <div className="space-y-5 p-6">
                {selectedProfile && (
                  <BusinessLogoUpload
                    businessName={
                      form.name ||
                      selectedProfile.name
                    }
                    logoUrl={
                        liveSelectedProfile
                            ? liveSelectedProfile.logoUrl
                            : selectedProfile.logoUrl
                        }
                    uploading={
                      businessProfiles
                        .uploadingLogoId ===
                      selectedProfile.id
                    }
                    removing={
                      businessProfiles
                        .removingLogoId ===
                      selectedProfile.id
                    }
                    onUpload={(
                      file,
                    ) =>
                      businessProfiles.uploadLogo(
                        selectedProfile.id,
                        file,
                      )
                    }
                    onRemove={() =>
                      businessProfiles.removeLogo(
                        selectedProfile.id,
                      )
                    }
                  />
                )}

                {!selectedProfile && (
                  <div className="rounded-xl border border-sky-400/10 bg-sky-400/[0.04] px-4 py-3 text-xs leading-5 text-sky-200/70">
                    Save the profile first.
                    You can upload its logo
                    afterward by opening Edit.
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Profile label
                    </label>

                    <input
                      required
                      value={
                        form.label
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "label",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input"
                      placeholder="Downtown Branch"
                    />

                    <p className="mt-2 text-xs text-slate-600">
                      Internal label for
                      identifying this
                      profile.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Business name
                    </label>

                    <input
                      required
                      value={
                        form.name
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "name",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input"
                      placeholder="Pixel Print Downtown"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Business email
                    </label>

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "email",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input"
                      placeholder="downtown@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Phone
                    </label>

                    <input
                      value={
                        form.phone
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "phone",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input"
                      placeholder="+63..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Business address
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.address
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "address",
                        event.target
                          .value,
                      )
                    }
                    className="qufo-input resize-none"
                    placeholder="Branch address..."
                  />
                </div>

                <div className="border-t border-[var(--qufo-border)] pt-5">
                  <h3 className="text-sm font-medium text-white">
                    Quotation defaults
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Used when this business
                    profile is selected on a
                    quotation.
                  </p>
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Terms &amp;
                      Conditions
                    </label>

                    <textarea
                      rows={5}
                      maxLength={5000}
                      value={
                        form.quotationTerms
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "quotationTerms",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input resize-y"
                      placeholder="Quotation terms..."
                    />

                    <p className="mt-2 text-right text-xs text-slate-700">
                      {
                        form
                          .quotationTerms
                          .length
                      }
                      /5000
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Footer note
                    </label>

                    <textarea
                      rows={5}
                      maxLength={1000}
                      value={
                        form
                          .quotationFooterNote
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "quotationFooterNote",
                          event.target
                            .value,
                        )
                      }
                      className="qufo-input resize-y"
                      placeholder="Thank you for your business."
                    />

                    <p className="mt-2 text-right text-xs text-slate-700">
                      {
                        form
                          .quotationFooterNote
                          .length
                      }
                      /1000
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--qufo-border)] px-6 py-5">
                <button
                  type="button"
                  disabled={
                    businessProfiles.saving
                  }
                  onClick={closeModal}
                  className="rounded-xl border border-[var(--qufo-border)] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    businessProfiles.saving
                  }
                  className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                >
                  {businessProfiles.saving && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {businessProfiles.saving
                    ? "Saving..."
                    : selectedProfile
                      ? "Save changes"
                      : "Create profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveTarget && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            className="qufo-surface w-full max-w-md rounded-3xl p-6"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-400/[0.08] text-red-300">
              <Archive
                size={19}
              />
            </div>

            <h2 className="mt-5 font-medium text-white">
              Archive business profile?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-medium text-slate-300">
                {archiveTarget.name}
              </span>{" "}
              will no longer appear when
              creating new quotations.
              Existing historical
              quotations will keep their
              frozen business identity.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  businessProfiles.saving
                }
                onClick={() =>
                  setArchiveTarget(
                    null,
                  )
                }
                className="rounded-xl border border-[var(--qufo-border)] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  businessProfiles.saving
                }
                onClick={() => {
                  void handleArchive();
                }}
                className="flex items-center gap-2 rounded-xl bg-red-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-red-300 disabled:opacity-50"
              >
                {businessProfiles.saving && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}