# Next.js Public Jobs API

This is a standalone Next.js backend for exposing public jobs to third-party websites and apps.

## What it does

- connects directly to the same MySQL database as the portal
- exposes unauthenticated JSON endpoints
- supports CORS for browser-based integrations
- returns only open public jobs
- excludes internal-only jobs

## Endpoints

- `GET /api/jobs`
- `GET /api/jobs/:slug`

## Query params for `GET /api/jobs`

- `q`
- `department`
- `type`
- `remote`
- `featured`
- `page`
- `limit`

## Setup

1. Copy `.env.example` to `.env.local`
2. Set your database credentials
3. Set `PORTAL_BASE_URL` to the main portal domain
4. Install dependencies with `npm install`
5. Run `npm run dev`

## Example

```ts
const res = await fetch("https://api.example.com/api/jobs?featured=true");
const jobs = await res.json();
```
