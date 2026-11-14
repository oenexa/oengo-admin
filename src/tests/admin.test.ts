import { describe, it, expect, beforeEach } from 'vitest';
import { CommerceAdminService } from '../service/CommerceAdminService';

describe('OENGO Admin & Governance Service', () => {
  let adminService: CommerceAdminService;

  beforeEach(() => {
    adminService = new CommerceAdminService();
  });

  it('submits and reviews merchant KYB application', () => {
    const kyb = adminService.submitKYBApplication(
      'mch-999',
      'Artisan Gelato SRL',
      'IT12345678901',
      'IT'
    );

    expect(kyb.status).toBe('PENDING');

    const approved = adminService.reviewKYBApplication('mch-999', 'APPROVED', 'compliance-officer-01');
    expect(approved.status).toBe('APPROVED');
    expect(approved.reviewedBy).toBe('compliance-officer-01');

    const outbox = adminService.getOutbox();
    expect(outbox.length).toBe(1);
    expect(outbox[0].type).toBe('oengo.admin.merchant.reviewed');
  });

  it('files disputes and arbitrates resolutions', () => {
    const dispute = adminService.fileDispute(
      'ord-404',
      'CUSTOMER',
      'Items missing and package damaged during transport',
      35.5,
      ['https://cdn.oengo.delivery/evidence/dsp1.jpg']
    );

    expect(dispute.status).toBe('OPEN');
    expect(dispute.claimedAmount).toBe(35.5);

    const arbitrated = adminService.arbitrateDispute(
      dispute.disputeId,
      'REFUNDED_TO_CUSTOMER',
      'Merchant failed to supply photos of sealed tamper-evident bag.'
    );

    expect(arbitrated.status).toBe('REFUNDED_TO_CUSTOMER');
    expect(arbitrated.resolvedAt).toBeDefined();

    const outbox = adminService.getOutbox();
    expect(outbox.some((e) => e.type === 'oengo.admin.dispute.arbitrated')).toBe(true);
  });

  it('aggregates regional quick-commerce volume and computes 2% protocol fee', () => {
    adminService.recordRegionalOrder('EU-WEST', 100.0);
    adminService.recordRegionalOrder('EU-WEST', 250.0);
    const summary = adminService.recordRegionalOrder('EU-WEST', 150.0);

    expect(summary.totalOrders).toBe(3);
    expect(summary.grossMerchandiseValue).toBe(500.0);
    expect(summary.platformRevenue).toBe(10.0); // 2% of 500
  });
});
