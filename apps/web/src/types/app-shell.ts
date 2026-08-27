export type AppShellUser = {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export type AppShellOrganization = {
  name: string;
  role?: string | null;
};