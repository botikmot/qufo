export function StartupBaseBadge() {
  return (
    <a
      href="https://startupbase.io/products/qufo?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-dark"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="QUFO launched on StartupBase"
      className="inline-flex items-center transition-opacity hover:opacity-80"
    >
      <img
        src="https://statics.startupbase.io/site/badges/launched-on-sb-dark.svg"
        alt="Launched on StartupBase"
        height={55}
        className="h-[55px] w-auto"
      />
    </a>
  );
}