# Domain Model

## Core Actors

- `User`
  - roles: `DONOR`, `CHARITY_MANAGER`, `ADMIN`
  - a charity manager may be linked to one managed charity
- `Charity`
  - receives donor allocations
  - spends allocated points through partner orders

## Donation Point Flow

1. `Payment`
   - mock donor payment record
   - starts as `RECEIVED`
   - can later move to `CONVERTED`
2. `PointConversion`
   - created from exactly one payment
   - credits donor wallet points
3. `PointAccount`
   - logical wallet for a donor or charity
   - balances are derived from ledger entries, not mutated directly
4. `PointLedgerEntry`
   - append-only source of truth for point movements
   - examples: conversion credit, allocation debit, allocation credit, order debit
5. `DonationAllocation`
   - donor allocates points to a charity
   - keeps `allocatedPoints` and `remainingPoints`
   - remains traceable when later consumed by partner orders
6. `PartnerOrder`
   - charity manager spends from one allocation
   - order total = product point cost × quantity
   - admin can mark the order fulfilled
7. `AuditEvent`
   - chronological timeline of payment, conversion, allocation, and order events

## Key Relationships

- one `Payment` -> one optional `PointConversion`
- one donor `PointAccount` -> many `PointLedgerEntry`
- one charity `PointAccount` -> many `PointLedgerEntry`
- one `DonationAllocation` -> many `PartnerOrder`
- one `DonationAllocation` -> many related `AuditEvent` entries by trace

## Rules

- every point movement must have a `PointLedgerEntry`
- no direct balance mutation without a ledger record
- `DonationAllocation` stays separate from `PartnerOrder`
- one charity order spends from one allocation only in this PoC
- state transitions are validated in the backend service layer
