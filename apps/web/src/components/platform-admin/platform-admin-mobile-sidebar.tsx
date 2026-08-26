"use client";

import {
  X,
} from "lucide-react";

import {
  PlatformAdminSidebar,
} from "@/components/platform-admin/platform-admin-sidebar";

type PlatformAdminMobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function PlatformAdminMobileSidebar({
  open,
  onClose,
}: PlatformAdminMobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[150] lg:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div
        className="
          relative
          h-dvh
          w-[290px]
          max-w-[85vw]
          border-r
          border-[var(--qufo-border)]
          shadow-2xl
        "
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            size-9
            items-center
            justify-center
            rounded-xl
            text-slate-500
            transition
            hover:bg-white/[0.05]
            hover:text-white
          "
        >
          <X size={18} />
        </button>

        <PlatformAdminSidebar
          variant="mobile"
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}