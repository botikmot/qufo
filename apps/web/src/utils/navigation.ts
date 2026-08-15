export function isNavigationActive(
  pathname: string,
  href: string,
) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}