import {
  PlatformAdminAccessGate,
} from "@/components/platform-admin/platform-admin-access-gate";

import {
  PlatformAdminShell,
} from "@/components/platform-admin/platform-admin-shell";

export default function PlatformAdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <PlatformAdminAccessGate>
      <PlatformAdminShell>
        {children}
      </PlatformAdminShell>
    </PlatformAdminAccessGate>
  );
}