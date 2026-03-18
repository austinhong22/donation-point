# Project Overview

Local-only PoC for a fair donation point system.

## Goal

Show this full flow clearly:
1. donor mock payment/remittance
2. convert payment to donation points
3. allocate points to a selected charity
4. charity manager uses those points to buy partner goods
5. admin marks fulfillment complete
6. UI shows balances, history, and timeline

## Scope

- single Spring Boot backend
- single React frontend
- MySQL
- mock auth
- mock payment and mock partner integration
- local execution only

## Non-goals

- real PG integration
- real bank transfer integration
- production auth
- deployment
- settlement/accounting
- tax receipt features

## Architecture rules

- Use simple layered architecture.
- Do not introduce microservices or message brokers.
- Point movement must be append-only through ledger entries.
- Keep DonationAllocation as a separate entity so donor allocation can be traced to partner order usage.
- No direct balance mutation without a ledger record.
- Validate every state transition.
- Add seed demo data for donor, charity manager, admin, charities, and partner products.
- Prefer readable implementation over generic abstraction.

## Verification

- backend: tests + app boot
- frontend: build
- main demo path must work end-to-end locally

## Working Agreements

- Keep this repository local-only and demo-first.
- Use a single Spring Boot backend and a single React frontend.
- Prefer simple layered architecture over generic frameworks or abstractions.
- Keep mock integrations explicit and easy to replace later.
- Preserve clear state transitions and append-only ledger thinking in backend design.

## Roles

- `DONOR`
- `CHARITY_MANAGER`
- `ADMIN`

## Repo Conventions

- Backend lives in `backend/` and uses Gradle.
- Frontend lives in `frontend/` and uses React + TypeScript + Vite.
- MySQL runs through `docker-compose.yml`.
- Seed/demo data is expected so the main demo path is always runnable locally.

## Skill Routing

- Use `.agents/skills/backend-poc-feature/` for backend domain, API, DB, validation, transaction, and test work.
- Use `.agents/skills/frontend-poc-flow/` for frontend pages, routing, API client, UX flow, and timeline work.
- Use `.agents/skills/poc-reviewer/` for correctness, integrity, validation, missing tests, and demo-readiness reviews.
