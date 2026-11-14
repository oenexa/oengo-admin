export type MerchantVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface MerchantKYBApplication {
  merchantId: string;
  businessName: string;
  taxIdentifier: string;
  jurisdiction: string;
  submittedAt: string;
  status: MerchantVerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type DisputeParty = 'CUSTOMER' | 'MERCHANT' | 'COURIER';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'REFUNDED_TO_CUSTOMER' | 'SETTLED_TO_MERCHANT' | 'SPLIT_ARBITRATION';

export interface CommerceDispute {
  disputeId: string;
  orderId: string;
  raisedBy: DisputeParty;
  reason: string;
  claimedAmount: number; // in ONXC
  status: DisputeStatus;
  evidenceUrls: string[];
  openedAt: string;
  resolvedAt?: string;
  arbitratorNotes?: string;
}

export interface RegionalVolumeSummary {
  regionCode: string; // e.g. "EU-CENTRAL", "US-EAST"
  totalOrders: number;
  grossMerchandiseValue: number; // GMV in ONXC
  platformRevenue: number; // 2% protocol fee
  activeMerchants: number;
  activeCouriers: number;
}
