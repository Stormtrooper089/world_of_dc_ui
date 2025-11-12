import { ComplaintStatus } from "../types";

const transitions: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.CREATED]: [
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.REJECTED,
  ],
  [ComplaintStatus.ASSIGNED]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.BLOCKED,
  ],
  [ComplaintStatus.IN_PROGRESS]: [
    ComplaintStatus.RESOLVED,
    ComplaintStatus.BLOCKED,
  ],
  [ComplaintStatus.BLOCKED]: [ComplaintStatus.IN_PROGRESS],
  [ComplaintStatus.RESOLVED]: [ComplaintStatus.CLOSED],
  [ComplaintStatus.CLOSED]: [],
  [ComplaintStatus.REJECTED]: [],
  [ComplaintStatus.DUPLICATE]: [ComplaintStatus.ASSIGNED],
};

export function getAllowedNextStatuses(
  current: ComplaintStatus
): ComplaintStatus[] {
  const next = transitions[current] || [];
  // Allow idempotent set to same status
  return [current, ...next];
}

export function statusDisplay(status: ComplaintStatus): string {
  return status.replace(/_/g, " ");
}
