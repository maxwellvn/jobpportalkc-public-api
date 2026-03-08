import { NextResponse } from "next/server";

import { withCorsHeaders } from "@/lib/cors";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "jobpportalkc-public-api",
      timestamp: new Date().toISOString(),
    },
    {
      headers: withCorsHeaders(),
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: withCorsHeaders(),
  });
}
