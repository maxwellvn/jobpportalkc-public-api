import { NextRequest } from "next/server";

import { handleListJobs, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  return handleListJobs(request);
}
