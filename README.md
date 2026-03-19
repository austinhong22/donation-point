# fair-donation-point-poc

Local-only PoC monorepo for a fair donation point system.

## Repo Layout

- `backend/`: Spring Boot API, validation, persistence, Flyway, and demo seed data
- `frontend/`: React + TypeScript + Vite demo UI for donor, charity manager, and admin
- `docker-compose.yml`: local MySQL for the PoC
- `docs/`: domain, API, smoke checks, and demo walkthrough
- `.agents/skills/`: repo-local Codex skills for backend work, frontend work, and PoC review

## Main Demo Flow

1. donor creates a mock payment
2. donor converts payment into donation points
3. donor allocates points to a charity
4. charity manager creates a partner order funded by that allocation
5. admin marks the partner order fulfilled
6. UI shows balances, histories, and the end-to-end audit timeline

## Local Requirements

- Java 17
- Node.js 18+
- Docker Desktop or compatible Docker runtime

## Local Startup Order

1. Create local env file:

```bash
cp .env.example .env
```

2. Start MySQL:

```bash
docker compose up -d mysql
docker compose ps mysql
```

Wait until MySQL shows `healthy`.

3. Start the backend in a dedicated terminal:

```bash
cd backend
./gradlew bootRun
```

Backend listens on `http://localhost:8080`.

4. Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend listens on `http://localhost:5173`.

5. Open the browser:

- `http://localhost:5173`
- Use the seeded actor switcher for `DONOR`, `CHARITY_MANAGER`, and `ADMIN`

## Local Configuration Notes

- Docker MySQL port defaults to `3307` to avoid clashing with an existing local MySQL on `3306`
- Backend datasource and CORS values come from `.env`
- Vite proxies `/api` requests to `http://localhost:8080`, so the UI works without manual CORS setup in normal local dev
- Direct browser/API access from `localhost:5173`, `127.0.0.1:5173`, `localhost:4173`, and `127.0.0.1:4173` is allowed by default

## Demo Data

Seed data includes:

- 1 donor
- 1 charity manager
- 1 admin
- 2 charities
- 3 partner products
- initial payment, conversion, allocation, and partner order records

## Verification

Backend tests:

```bash
cd backend
./gradlew test --no-daemon
```

Frontend build:

```bash
cd frontend
npm run build
```

Optional API smoke check once backend is running:

```bash
curl -H "X-Actor-Id: 101" http://localhost:8080/api/v1/donor/me/dashboard
```

## Demo Docs

- `docs/domain-model.md`
- `docs/api-overview.md`
- `docs/demo-script.md`
- `docs/smoke-check.http`

## Shutdown

Stop frontend and backend with `Ctrl+C`.

Stop MySQL:

```bash
docker compose down
```
