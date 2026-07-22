import { InputHTMLAttributes } from "react";

export default function Input({
  label,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`bg-surface border border-border rounded-md px-3 py-2 text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors min-h-[48px] ${className}`}
      />
    </div>
  );
}
