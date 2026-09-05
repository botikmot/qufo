'use client';

import { BusinessSettingsForm } from '@/components/settings/business-settings-form';

import { useBusinessSettings } from '@/hooks/use-business-settings';

export function BusinessSettingsTab() {
  const business = useBusinessSettings();

  if (business.loading) {
    return (
      <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
        Loading business settings...
      </div>
    );
  }

  if (!business.settings) {
    return (
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
        {business.error ?? 'Unable to load business settings.'}
      </div>
    );
  }

  return (
    <BusinessSettingsForm
      key={business.settings.updatedAt}
      settings={business.settings}
      saving={business.saving}
      uploadingLogo={business.uploadingLogo}
      removingLogo={business.removingLogo}
      error={business.error}
      success={business.success}
      onSave={business.update}
      onUploadLogo={business.uploadLogo}
      onRemoveLogo={business.removeLogo}
      uploadingSignature={business.uploadingSignature}
      removingSignature={business.removingSignature}
      savingSignature={business.savingSignature}
      onUploadSignature={business.uploadSignature}
      onRemoveSignature={business.removeSignature}
      onSaveSignature={business.updateSignature}
    />
  );
}
