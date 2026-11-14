# OENGO Admin & Regional Governance Engine

Sovereign administrative, dispute mediation, compliance moderation, and platform revenue allocation service for the OENGO quick-commerce ecosystem.

## Core Capabilities
- **Merchant Onboarding & Compliance Vetting**: Tiered KYC/KYB reviews, operational license validations, and automated status transitions.
- **Dispute Mediation Engine**: Multi-party order contestation management (customer vs merchant vs courier), evidence review, and sovereign escrow refund/release arbitration.
- **Protocol Fee Analytics**: Aggregated real-time volume metrics, platform commission tracking, and regional liquidity health.

## Interface Standards
- Communicates via canonical CloudEvents v1.0 (`@oenexa/event-schemas`).
- Follows RFC 7807 Problem Details for all API failure contracts (`@oenexa/api-contracts`).
- Zero shared database dependencies.
