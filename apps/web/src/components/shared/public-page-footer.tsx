type PublicPageFooterProps = {
  label: string;
};

export function PublicPageFooter({
  label,
}: PublicPageFooterProps) {
  return (
    <footer className="mt-8 flex flex-col gap-2 text-center text-xs text-slate-700 sm:flex-row sm:justify-between sm:text-left">
      <span>
        {label}
      </span>

      <span>
        Quick Flow · Move work
        forward.
      </span>
    </footer>
  );
}