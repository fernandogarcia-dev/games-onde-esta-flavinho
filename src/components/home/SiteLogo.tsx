import Link from "next/link";

/** Logo + nome — link pra home. */
export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-w-0 shrink-0 items-center gap-2 no-underline"
      aria-label="Cadê Flavinho? — início"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
        decoding="async"
      />
      {!compact ? (
        <span className="hidden min-w-0 truncate font-[family-name:var(--font-display)] text-base leading-none text-[var(--ink)] sm:block sm:text-lg">
          Cadê Flavinho?
        </span>
      ) : null}
    </Link>
  );
}
