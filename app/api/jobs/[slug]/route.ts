import { NextResponse } from "next/server";

import { withCorsHeaders } from "@/lib/cors";
import { getPublicJob } from "@/lib/jobs";

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const job = await getPublicJob(slug);

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
