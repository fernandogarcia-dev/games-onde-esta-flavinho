import type { ReactNode } from "react";

type Props = {
  won: boolean;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/** Identidade visual compartilhada de acerto/erro (faixa colorida + card). */
export function ResultShell({
  won,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`animate-rise mx-auto max-w-xl overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] text-center shadow-[8px_8px_0_var(--ink)] ${
        won ? "bg-[#e8f6ef]" : "bg-[#fde8e4]"
      } ${className}`}
    >
      <div
        className={`border-b-[3px] border-[var(--ink)] px-4 py-4 ${
          won ? "bg-[#1f8a5b] text-white" : "bg-[#c2410c] text-white"
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/85">
          {eyebrow}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none sm:text-5xl">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-2 text-sm font-semibold text-white/95">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function ResultMark({ won }: { won: boolean }) {
  return (
    <span
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--ink)] font-[family-name:var(--font-display)] text-3xl text-white shadow-[4px_4px_0_var(--ink)] ${
        won ? "bg-[#1f8a5b]" : "bg-[#c2410c]"
      }`}
      aria-hidden
    >
      {won ? "✓" : "✕"}
    </span>
  );
}
