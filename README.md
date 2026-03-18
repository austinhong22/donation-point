# fair-donation-point-poc

Local-only PoC monorepo for a fair donation point system.

## What This Repo Contains

- `backend/`: Spring Boot service for domain, API, validation, and persistence
- `frontend/`: React + TypeScript + Vite app for the donor/manager/admin demo flow
- `docker-compose.yml`: local MySQL for the PoC
- `.agents/skills/`: repo-local Codex skills for backend work, frontend work, and reviews

## Demo Flow

1. donor mock payment/remittance
2. convert payment to donation points
3. allocate points to a selected charity
4. charity manager uses allocated points to buy partner goods
5. admin marks partner order fulfilled
6. UI shows balances, histories, and timeline

## Tech Stack

- Backend: Java 17, Spring Boot, Gradle, Spring Web, Validation, JPA
- Frontend: React 18, TypeScript, Vite, React Router
- Database: MySQL 8

## Run Locally

1. Prepare local env:

```bash
cp .env.example .env
```

2. Start MySQL:

```bash
docker compose up -d mysql
```

3. Run backend:

```bash
cd backend
./gradlew bootRun
```

4. Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend defaults to `http://localhost:5173` and backend defaults to `http://localhost:8080`.
Docker Compose reads DB settings from root `.env`.
Backend `bootRun` also reads root `.env`, so DB credentials are no longer hardcoded in tracked config files.

## Verification

```bash
docker compose up -d mysql
cd backend && ./gradlew test
cd frontend && npm install && npm run build
```
