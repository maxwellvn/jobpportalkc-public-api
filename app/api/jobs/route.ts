import { NextRequest, NextResponse } from "next/server";

import { withCorsHeaders } from "@/lib/cors";
import { listPublicJobs } from "@/lib/jobs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: withCorsHeaders(),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: withCorsHeaders(),
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const result = await listPublicJobs({
      q: searchParams.get("q") ?? undefined,
      department: searchParams.get("department") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      remote: searchParams.get("remote") ?? undefined,
      featured: searchParams.get("featured") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
    });

    return json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch public jobs.";
    return json({ error: message }, 500);
  }
}
