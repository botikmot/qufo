export function FazierBadge() {
  return (
    <a
      href="https://fazier.com/launches/qufo.im"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="QUFO launched on Fazier"
      className="inline-flex items-center transition-opacity hover:opacity-80"
    >
      <img
        src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark"
        width={120}
        height={40}
        alt="Launched on Fazier"
        className="h-auto w-[120px]"
      />
    </a>
  );
}