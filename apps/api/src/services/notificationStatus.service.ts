/**
 * Normalized internal status enum.
 * Each courier provider maps their status codes to these.
 */
export type NormalizedStatus =
  | "pending"
  | "picked"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | "failed";

/**
 * Map raw courier provider statuses to our normalized enum.
 */
export function normalizeCourierStatus(
  provider: string,
  rawStatus: string
): NormalizedStatus {
  const p = provider.toLowerCase();
  const s = rawStatus.toLowerCase().trim();

  if (p.includes("steadfast")) {
    return normalizeSteadfastStatus(s);
  } else if (p.includes("pathao")) {
    return normalizePathaoStatus(s);
  }
  return normalizeGenericStatus(s);
}

function normalizeSteadfastStatus(s: string): NormalizedStatus {
  const map: Record<string, NormalizedStatus> = {
    pending: "pending",
    "pick up": "picked",
    picked: "picked",
    "in transit": "in_transit",
    transit: "in_transit",
    "out for delivery": "out_for_delivery",
    delivered: "delivered",
    returned: "returned",
    cancel: "cancelled",
    cancelled: "cancelled",
    "delivery fail": "failed",
    "failed": "failed"
  };
  return map[s] || "pending";
}

function normalizePathaoStatus(s: string): NormalizedStatus {
  const map: Record<string, NormalizedStatus> = {
    pending: "pending",
    picked: "picked",
    "in transit": "in_transit",
    transit: "in_transit",
    "out for delivery": "out_for_delivery",
    delivered: "delivered",
    returned: "returned",
    cancelled: "cancelled",
    canceled: "cancelled",
    failed: "failed"
  };
  return map[s] || "pending";
}

function normalizeGenericStatus(s: string): NormalizedStatus {
  const map: Record<string, NormalizedStatus> = {
    pending: "pending",
    picked: "picked",
    "picked up": "picked",
    "in transit": "in_transit",
    transit: "in_transit",
    "out for delivery": "out_for_delivery",
    delivered: "delivered",
    returned: "returned",
    cancelled: "cancelled",
    canceled: "cancelled",
    failed: "failed"
  };
  return map[s] || "pending";
}

/**
 * User-friendly labels for normalized statuses.
 */
export const STATUS_LABELS: Record<NormalizedStatus, string> = {
  pending: "Pending",
  picked: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  failed: "Delivery Failed"
};

/**
 * Which statuses should trigger notifications by default.
 */
export const DEFAULT_NOTIFY_STATUSES: NormalizedStatus[] = [
  "picked",
  "out_for_delivery",
  "delivered",
  "returned",
  "failed"
];
