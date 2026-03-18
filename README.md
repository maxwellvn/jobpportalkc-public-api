# Rhapsody of Realities Public Jobs API

This service is the public-facing API for job listings on Rhapsody of Realities Opportunities Hub.

It is designed for third-party websites, mobile apps, and internal frontend projects that need to display available opportunities without connecting directly to the main portal codebase.

The live API is available at:

- `https://api.roropportunitieshub.org`

The main portal is available at:

- `https://roropportunitieshub.org`

## What this API returns

The API exposes public opportunities only.

That means:

- only jobs with an `open` status are returned
- internal-only opportunities are excluded
- no authentication is required
- responses are returned as JSON
- browser clients can connect directly because CORS is enabled

Each job record includes:

- the opportunity title and slug
- a short summary
- the full description
- requirements
- responsibilities
- department information
- job type and remote policy
- experience range
- application count
- required skills
- a direct public job link
- a direct application link

## Endpoints

### List jobs

`GET /api/jobs`

Example:

```txt
https://api.roropportunitieshub.org/api/jobs
```

### Get a single job

`GET /api/jobs/:slug`

Example:

```txt
https://api.roropportunitieshub.org/api/jobs/graphic-designer
```

## Supported query parameters

The jobs listing endpoint supports the following optional parameters:

- `q` for keyword search
- `department` for department ID
- `type` for engagement type such as `full-time`
- `remote` for remote policy such as `remote`, `hybrid`, or `onsite`
- `featured` with `true` or `false`
- `page` for pagination
- `limit` for page size

Example:

```txt
https://api.roropportunitieshub.org/api/jobs?featured=true&limit=10
```

## Example response

This is the shape returned by the live API:

```json
{
  "data": {
    "id": 4,
    "slug": "graphic-designer",
    "title": "Graphic Designer",
    "summary": "We are looking for a creative Graphic Designer to join our Media & Communications team...",
    "description": "We are looking for a creative Graphic Designer to join our Media & Communications team. You will create visual content for print, digital, and social media platforms.",
    "requirements": "- 2+ years of graphic design experience",
    "responsibilities": "- Create graphics for social media, websites, and print materials",
    "department": {
      "id": 4,
      "name": "Media",
      "code": "MEDIA"
    },
    "engagement_type": "full-time",
    "location": "Lagos, Nigeria",
    "remote_policy": "remote",
    "experience_min_years": 2,
    "experience_max_years": 6,
    "openings_count": 2,
    "applications_count": 13,
    "deadline": "2026-02-10T00:00:00.000Z",
    "is_featured": true,
    "published_at": "2026-01-02T11:00:00.000Z",
    "created_at": "2026-01-02T11:00:00.000Z",
    "updated_at": "2026-03-08T09:31:50.000Z",
    "skills_required": [
      {
        "id": 5,
        "name": "Graphic Design",
        "category": "Creative"
      }
    ],
    "urls": {
      "detail": "https://roropportunitieshub.org/jobs/graphic-designer",
      "apply": "https://roropportunitieshub.org/jobs/graphic-designer/apply"
    }
  }
}
```

## How third-party websites should use it

The typical integration flow is straightforward:

1. Fetch the list of jobs from `https://api.roropportunitieshub.org/api/jobs`
2. Display the returned records on your site or app
3. Use `urls.detail` when a user wants to read the full opportunity
4. Use `urls.apply` when a user wants to apply on the main portal

If you only need a single opportunity, call the detail endpoint directly with the job slug.

## Example fetch

```ts
const response = await fetch(
  "https://api.roropportunitieshub.org/api/jobs?limit=10"
);

const jobs = await response.json();
```

## Local development

1. Copy `.env.example` to `.env.local`
2. Set the database credentials
3. Set `PORTAL_BASE_URL=https://roropportunitieshub.org`
4. Run `npm install`
5. Run `npm run dev`

## Deployment

This project is deployed as a standalone Next.js service.

For Coolify:

- build method: `Dockerfile`
- exposed port: `3000`
- public API domain: `https://api.roropportunitieshub.org`

The repository includes a production Dockerfile and is ready for Docker-based deployment.
