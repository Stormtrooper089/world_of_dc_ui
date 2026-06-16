export type WasteCategory =
  | "HOUSEHOLD_WASTE_NOT_COLLECTED"
  | "BULK_WASTE"
  | "CONSTRUCTION_DEMOLITION_WASTE"
  | "DEAD_ANIMAL"
  | "DRAIN_SILT_GARBAGE"
  | "MARKET_WASTE"
  | "FESTIVAL_EVENT_WASTE"
  | "OTHER";

export type WasteQuantityEstimate = "SMALL" | "MEDIUM" | "LARGE" | "TRUCK_REQUIRED";

export type WasteUrgency = "NORMAL" | "URGENT" | "PUBLIC_HEALTH_RISK";

export type WastePickupStatus =
  | "SUBMITTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "PICKUP_SCHEDULED"
  | "IN_PROGRESS"
  | "PICKED_UP"
  | "CLOSED"
  | "REJECTED"
  | "REOPENED";

export interface WastePickupAuditTrail {
  action: string;
  previousStatus?: WastePickupStatus;
  newStatus?: WastePickupStatus;
  remarks?: string;
  actorId?: string;
  actorRole?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}

export interface WastePickupRequest {
  id: string;
  trackingId: string;
  citizenName: string;
  citizenMobile: string;
  wardNumber?: number;
  locality?: string;
  landmark?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  wasteCategory: WasteCategory;
  estimatedQuantity: WasteQuantityEstimate;
  urgency: WasteUrgency;
  description?: string;
  beforePhotos?: string[];
  preferredPickupSlot?: string;
  vehicleAccessAvailable?: boolean;
  sensitiveNearbyLocation?: string;
  status: WastePickupStatus;
  assignedOfficerId?: string;
  assignedSanitationStaffId?: string;
  assignedVehicleNumber?: string;
  sanitationTeamName?: string;
  submittedAt: string;
  verifiedAt?: string;
  assignedAt?: string;
  scheduledAt?: string;
  pickedUpAt?: string;
  closedAt?: string;
  actualWasteQuantity?: WasteQuantityEstimate;
  afterPhotos?: string[];
  closureLatitude?: number;
  closureLongitude?: number;
  closureRemarks?: string;
  siteFullyCleaned?: boolean;
  citizenRating?: number;
  citizenFeedback?: string;
  reopenedReason?: string;
  escalationLevel?: number;
  slaHours?: number;
  slaBreached?: boolean;
  auditTrail?: WastePickupAuditTrail[];
}

export interface WastePickupDashboard {
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  pickedUpRequests: number;
  closedRequests: number;
  reopenedRequests: number;
  slaBreachedRequests: number;
  averagePickupTimeHours: number;
  wardWiseData: Record<string, number>;
  categoryWiseData: Record<string, number>;
  urgencyWiseData: Record<string, number>;
  officerWisePendency: Record<string, number>;
  repeatHotspots: Array<Record<string, any>>;
  oldestPendingRequests: WastePickupRequest[];
}

export const wasteCategoryLabels: Record<WasteCategory, string> = {
  HOUSEHOLD_WASTE_NOT_COLLECTED: "Household waste not collected",
  BULK_WASTE: "Bulk waste",
  CONSTRUCTION_DEMOLITION_WASTE: "Construction and demolition waste",
  DEAD_ANIMAL: "Dead animal",
  DRAIN_SILT_GARBAGE: "Drain silt / garbage",
  MARKET_WASTE: "Market waste",
  FESTIVAL_EVENT_WASTE: "Festival/event waste",
  OTHER: "Other",
};

export const wasteQuantityLabels: Record<WasteQuantityEstimate, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  TRUCK_REQUIRED: "Truck required",
};

export const wasteUrgencyLabels: Record<WasteUrgency, string> = {
  NORMAL: "Normal",
  URGENT: "Urgent",
  PUBLIC_HEALTH_RISK: "Public health risk",
};

export const wasteStatusLabels: Record<WastePickupStatus, string> = {
  SUBMITTED: "Submitted",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  IN_PROGRESS: "In Progress",
  PICKED_UP: "Picked Up",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  REOPENED: "Reopened",
};
