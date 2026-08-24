import {
  PlatformAdminSidebar,
} from "@/components/platform-admin/platform-admin-sidebar";

export default function PlatformAdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <div className="qufo-background flex min-h-dvh bg-[var(--qufo-bg)]">
      <PlatformAdminSidebar />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}