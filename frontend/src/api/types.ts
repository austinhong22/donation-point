export type ActorRole = 'DONOR' | 'CHARITY_MANAGER' | 'ADMIN';

export interface DemoActor {
  id: number;
  displayName: string;
  email: string;
  role: ActorRole;
  managedCharityId: number | null;
  pointBalance: number;
}

export interface Charity {
  id: number;
  code: string;
  name: string;
  description: string;
  pointBalance: number;
}

export interface PartnerProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  pointCost: number;
}

export interface CharityAllocationSummary {
  allocationId: number;
  donorId: number;
  donorName: string;
  allocatedPoints: number;
  remainingPoints: number;
  status: string;
  createdAt: string;
}

export interface CharityOrder {
  orderId: number;
  allocationId: number;
  charityId: number;
  charityName: string;
  partnerProductId: number;
  partnerProductName: string;
  quantity: number;
  totalPoints: number;
  status: string;
  createdAt: string;
  fulfilledAt: string | null;
}

export interface AdminDashboard {
  requestedOrders: number;
  fulfilledOrders: number;
  activeAllocations: number;
  totalRequestedPoints: number;
  totalFulfilledPoints: number;
}

export interface AdminOrder {
  orderId: number;
  allocationId: number;
  charityId: number;
  charityName: string;
  charityManagerUserId: number;
  charityManagerName: string;
  partnerProductId: number;
  partnerProductName: string;
  quantity: number;
  totalPoints: number;
  status: string;
  createdAt: string;
  fulfilledAt: string | null;
}

export interface AllocationOrderTrace {
  orderId: number;
  partnerProductId: number;
  partnerProductName: string;
  quantity: number;
  totalPoints: number;
  status: string;
  createdAt: string;
  fulfilledAt: string | null;
}

export interface AllocationAuditEvent {
  createdAt: string;
  action: string;
  targetType: string;
  targetId: number;
  actorUserId: number | null;
  actorDisplayName: string | null;
  eventData: string | null;
}

export interface AllocationDetail {
  allocationId: number;
  donorId: number;
  donorName: string;
  charityId: number;
  charityName: string;
  convertedPoints: number;
  allocatedPoints: number;
  remainingPoints: number;
  status: string;
  relatedPartnerOrders: AllocationOrderTrace[];
  auditEvents: AllocationAuditEvent[];
}

export interface ApiErrorField {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  timestamp: string;
  status: number;
  errorCode: string;
  message: string;
  path: string;
  fieldErrors: ApiErrorField[];
}

export interface CreateCharityOrderInput {
  allocationId: number;
  partnerProductId: number;
  quantity: number;
}
