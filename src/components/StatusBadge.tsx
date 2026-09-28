import { AlertTriangle, CheckCircle2, Clock3, Wrench } from "lucide-react";

type Status = keyof typeof config;

type StatusConfig = {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
};

const config = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    color: "bg-campus-100 text-campus-700",
  },
  "checked-out": {
    label: "Checked out",
    icon: Clock3,
    color: "bg-amber-100 text-amber-800",
  },
  repair: {
    label: "Needs repair",
    icon: Wrench,
    color: "bg-red-100 text-red-700",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
  },
  returned: {
    label: "Returned",
    icon: CheckCircle2,
    color: "bg-campus-100 text-campus-700",
  },
} satisfies Record<string, StatusConfig>;

type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const item = config[status as Status] ?? {
    label: status,
    icon: CheckCircle2,
    color: "bg-slate-100 text-slate-700",
  };

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-xs font-extrabold ${item.color}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
  );
}
