import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  error,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>

      {children}

      {error ? (
        <span className="mt-1 block text-xs leading-4 text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs leading-4 text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
