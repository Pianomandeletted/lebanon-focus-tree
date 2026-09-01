import type { FocusStatus } from "@/types/focus";

export const STATUS_META: Record<
  FocusStatus,
  { label: string; ring: string; fill: string; text: string; dot: string }
> = {
  COMPLETE: {
    label: "Complete",
    ring: "ring-2 ring-status-complete/70",
    fill: "bg-status-complete/15",
    text: "text-status-complete",
    dot: "bg-status-complete"
  },
  COMPLETING: {
    label: "Completing",
    ring: "ring-2 ring-status-completing/70",
    fill: "bg-status-completing/15",
    text: "text-status-completing",
    dot: "bg-status-completing"
  },
  INCOMPLETE: {
    label: "Incomplete",
    ring: "ring-1 ring-ink-500/40",
    fill: "bg-cedar-800/60",
    text: "text-ink-300",
    dot: "bg-ink-500"
  },
  IMPOSSIBLE: {
    label: "Impossible",
    ring: "ring-2 ring-status-impossible/70",
    fill: "bg-status-impossible/10",
    text: "text-status-impossible",
    dot: "bg-status-impossible"
  }
};
