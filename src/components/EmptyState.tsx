import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded border border-slate-200 bg-white p-9 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded bg-campus-50 text-campus-600">
        <PackageOpen size={24} />
      </div>

      <h3 className="mb-1 text-sm font-extrabold">{title}</h3>

      <p className="mb-4 max-w-sm text-xs text-slate-500">{message}</p>

      {action}
    </div>
  );
}
