import type { PostStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckIcon, ClockIcon, XIcon, AlertIcon } from "./Icons";

const MAP: Record<
  PostStatus,
  { label: string; cls: string; icon: typeof CheckIcon }
> = {
  pending: {
    label: "Pending review",
    cls: "text-[var(--color-pending)] bg-[var(--color-pending-bg)]",
    icon: ClockIcon,
  },
  approved: {
    label: "Approved",
    cls: "text-[var(--color-approved)] bg-[var(--color-approved-bg)]",
    icon: CheckIcon,
  },
  rejected: {
    label: "Rejected",
    cls: "text-[var(--color-rejected)] bg-[var(--color-rejected-bg)]",
    icon: XIcon,
  },
  changes_requested: {
    label: "Changes requested",
    cls: "text-[var(--color-changes)] bg-[var(--color-changes-bg)]",
    icon: AlertIcon,
  },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: PostStatus;
  size?: "sm" | "md";
}) {
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "chip font-medium",
        m.cls,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon size={size === "sm" ? 12 : 13} />
      {m.label}
    </span>
  );
}