import { NextRequest, NextResponse } from "next/server";

import { withCorsHeaders } from "@/lib/cors";
import { getPublicJob, listPublicJobs } from "@/lib/jobs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: withCorsHeaders(),
  });
}

function normalizeString(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const normalized = value.trim();
  if (
    normalized === "" ||
    normalized.toLowerCase() === "all" ||
    normalized.toLowerCase() === "null" ||
    normalized.toLowerCase() === "undefined"
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeNumber(value: string | null, fallback: number): number {
  const normalized = normalizeString(value);
  if (!normalized) {
    return fallback;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeFeatured(value: string | null): string | undefined {
  const normalized = normalizeString(value)?.toLowerCase();
  if (normalized === "true" || normalized === "false") {
    return normalized;
  }

  return undefined;
}

function normalizeDepartment(value: string | null): string | undefined {
  const normalized = normalizeString(value);
  if (!normalized || !/^\d+$/.test(normalized)) {
    return undefined;
  }

  return normalized;
}

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: withCorsHeaders(),
  });
}

export async function handleListJobs(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const result = await listPublicJobs({
      q: normalizeString(searchParams.get("q")),
      department: normalizeDepartment(searchParams.get("department")),
      type: normalizeString(searchParams.get("type"))?.toLowerCase(),
      remote: normalizeString(searchParams.get("remote"))?.toLowerCase(),
      featured: normalizeFeatured(searchParams.get("featured")),
      page: normalizeNumber(searchParams.get("page"), 1),
      limit: normalizeNumber(searchParams.get("limit"), 20),
    });

    return json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch public jobs.";
    return json({ error: message }, 500);
  }
}

export async function handleGetJob(slug: string) {
  try {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return json({ error: "Job not found." }, 404);
    }

    const job = await getPublicJob(normalizedSlug);

    if (!job) {
      return json({ error: "Job not found." }, 404);
    }

    return json({ data: job });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch public job.";
    return json({ error: message }, 500);
  }
}
