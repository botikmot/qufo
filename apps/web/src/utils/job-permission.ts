export function canCancelJob(
  role?: string | null,
) {
  return (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MANAGER" ||
    role === "STAFF"
  );
}

export function canReopenJob(
  role?: string | null,
) {
  return (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MANAGER"
  );
}