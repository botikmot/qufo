export function canVoidPayment(
  role?: string | null,
) {
  return (
    role === "OWNER" ||
    role === "ADMIN"
  );
}