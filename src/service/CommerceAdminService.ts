import {
  MerchantKYBApplication,
  MerchantVerificationStatus,
  CommerceDispute,
  DisputeParty,
  DisputeStatus,
  RegionalVolumeSummary,
} from '../domain/types';
import { CloudEvent } from '@oenexa/event-schemas';

export class CommerceAdminService {
  private applications: Map<string, MerchantKYBApplication> = new Map();
  private disputes: Map<string, CommerceDispute> = new Map();
  private regionalMetrics: Map<string, RegionalVolumeSummary> = new Map();
  private eventOutbox: CloudEvent<any>[] = [];

  public submitKYBApplication(merchantId: string, businessName: string, taxIdentifier: string, jurisdiction: string): MerchantKYBApplication {
    const app: MerchantKYBApplication = {
      merchantId,
      businessName,
      taxIdentifier,
      jurisdiction,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    this.applications.set(merchantId, app);
    return app;
  }

  public reviewKYBApplication(merchantId: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reviewedBy: string, rejectionReason?: string): MerchantKYBApplication {
    const app = this.applications.get(merchantId);
    if (!app) throw new Error(`KYB application for merchant ${merchantId} not found`);

    app.status = status;
    app.reviewedBy = reviewedBy;
    app.reviewedAt = new Date().toISOString();
    if (rejectionReason) app.rejectionReason = rejectionReason;

    this.eventOutbox.push({
      specversion: '1.0',
      id: `evt-kyb-${Date.now()}`,
      source: 'urn:oenexa:oengo:admin',
      type: 'oengo.admin.merchant.reviewed',
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: { merchantId, status, reviewedBy },
    });

    return app;
  }

  public fileDispute(orderId: string, raisedBy: DisputeParty, reason: string, claimedAmount: number, evidenceUrls: string[] = []): CommerceDispute {
    const disputeId = `dsp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const dispute: CommerceDispute = {
      disputeId,
      orderId,
      raisedBy,
      reason,
      claimedAmount,
      status: 'OPEN',
      evidenceUrls,
      openedAt: new Date().toISOString(),
    };

    this.disputes.set(disputeId, dispute);
    return dispute;
  }

  public arbitrateDispute(disputeId: string, resolution: 'REFUNDED_TO_CUSTOMER' | 'SETTLED_TO_MERCHANT' | 'SPLIT_ARBITRATION', arbitratorNotes: string): CommerceDispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error(`Dispute ${disputeId} not found`);

    dispute.status = resolution;
    dispute.resolvedAt = new Date().toISOString();
    dispute.arbitratorNotes = arbitratorNotes;

    this.eventOutbox.push({
      specversion: '1.0',
      id: `evt-dsp-${Date.now()}`,
      source: 'urn:oenexa:oengo:admin',
      type: 'oengo.admin.dispute.arbitrated',
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: { disputeId, orderId: dispute.orderId, resolution, claimedAmount: dispute.claimedAmount },
    });

    return dispute;
  }

  public recordRegionalOrder(regionCode: string, orderAmountONXC: number): RegionalVolumeSummary {
    const existing = this.regionalMetrics.get(regionCode) || {
      regionCode,
      totalOrders: 0,
      grossMerchandiseValue: 0,
      platformRevenue: 0,
      activeMerchants: 1,
      activeCouriers: 1,
    };

    existing.totalOrders += 1;
    existing.grossMerchandiseValue += orderAmountONXC;
    existing.platformRevenue = Number((existing.grossMerchandiseValue * 0.02).toFixed(4)); // 2% protocol commission

    this.regionalMetrics.set(regionCode, existing);
    return existing;
  }

  public getRegionalSummary(regionCode: string): RegionalVolumeSummary | undefined {
    return this.regionalMetrics.get(regionCode);
  }

  public getDispute(disputeId: string): CommerceDispute | undefined {
    return this.disputes.get(disputeId);
  }

  public getOutbox(): CloudEvent<any>[] {
    return [...this.eventOutbox];
  }
}
