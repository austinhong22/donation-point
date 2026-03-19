# Known Limitations

This PoC intentionally leaves out the following items.

## Product / Architecture

- Local execution only. There is no deployment, distributed coordination, or production-grade operational hardening.
- Mock auth uses `X-Actor-Id` and seeded demo users. It is suitable for local role switching only.
- No real PG, bank transfer, or partner integration exists. Payment, conversion, ordering, and fulfillment are all local mock flows.
- Settlement, accounting reconciliation, tax receipts, and production reporting are out of scope.

## Demo / Data

- Demo walkthroughs assume a clean local database seeded by Flyway. If the demo has already been exercised, newly created resource ids in `docs/smoke-check.http` can differ from the example ids.
- The donor wallet lock added in the backend reduces same-donor allocation race risk for this single-node PoC. It is not a substitute for production-grade concurrency controls across multiple app instances.
- Frontend verification is build-based in this repository. There is no browser automation suite yet, so final demo readiness still depends on a quick local click-through before presenting.
