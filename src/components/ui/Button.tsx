import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "money";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-[var(--brand)] text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--ink)]",
  secondary:
    "bg-[var(--paper)] text-[var(--ink)] border-2 border-[var(--ink)] hover:bg-[var(--sand)]",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-black/5",
  danger:
    "bg-[var(--alert)] text-white shadow-[4px_4px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px]",
  money:
    "bg-[var(--pix)] text-white shadow-[4px_4px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--ink)]",
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-[family-name:var(--font-display)] tracking-wide transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
