---
name: backend-poc-feature
description: Use when asked to implement or update backend domain logic, API endpoints, database mappings, transactions, validation, seed data, or tests for the fair-donation-point-poc Spring Boot service.
---

# Backend PoC Feature

Use this skill for backend work in `backend/`.

## Focus

- Keep a single Spring Boot service.
- Prefer simple layered architecture: controller, service, repository, domain.
- Treat point movement as append-only through ledger records.
- Keep `DonationAllocation` separate from partner order usage.
- Validate all state transitions explicitly.
- Favor readable code over reusable abstraction.

## Working Rules

- Do not add real PG, bank transfer, or partner integrations.
- Use mock auth and mock external integrations only.
- Preserve traceability for donor allocation, charity usage, and admin fulfillment.
- Add or update tests when behavior changes.
- Seed demo users for `DONOR`, `CHARITY_MANAGER`, and `ADMIN` when needed.

## Expected Outputs

- Clear API contracts and validation paths
- Transaction boundaries around write flows
- MySQL-friendly persistence design
- Tests for main happy path and critical invalid transitions

## Verify

- Run backend tests.
- Boot the app against local MySQL when backend config changes materially.
