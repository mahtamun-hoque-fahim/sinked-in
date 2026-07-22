import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "emergency";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:bg-accent-hover font-semibold min-h-[48px]",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-elevated min-h-[48px]",
  emergency:
    "bg-status-flooded text-white font-bold text-lg hover:opacity-90 min-h-[56px]",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`px-6 py-3 rounded-md transition-colors transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
