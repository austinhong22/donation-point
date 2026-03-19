# API Overview

Base URL: `http://localhost:8080`

Mock auth header for actor-scoped APIs:

- `X-Actor-Id: 101` donor
- `X-Actor-Id: 201` charity manager
- `X-Actor-Id: 301` admin

## Demo / Shared Read APIs

- `GET /api/v1/demo/actors`
- `GET /api/v1/charities`
- `GET /api/v1/partner-products`
- `GET /api/v1/allocations/{allocationId}/detail`

## Donor APIs

- `GET /api/v1/donor/me/dashboard`
- `GET /api/v1/donor/me/payments`
- `POST /api/v1/donor/payments`
- `POST /api/v1/donor/payments/{paymentId}/convert`
- `GET /api/v1/donor/me/allocations`
- `POST /api/v1/donor/allocations`

## Charity Manager APIs

- `GET /api/v1/charity/me/allocations`
- `GET /api/v1/charity/me/orders`
- `POST /api/v1/charity/orders`

## Admin APIs

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/{orderId}/complete`

## Error Shape

All structured API errors return:

- `timestamp`
- `status`
- `errorCode`
- `message`
- `path`
- `fieldErrors`

Common error codes:

- `RESOURCE_NOT_FOUND`
- `AUTHENTICATION_REQUIRED`
- `ACCESS_DENIED`
- `INVALID_REQUEST`
- `VALIDATION_FAILED`
- `INTERNAL_ERROR`
