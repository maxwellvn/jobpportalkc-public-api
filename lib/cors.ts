const allowOrigin = process.env.CORS_ALLOW_ORIGIN ?? "*";

export function withCorsHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set("Access-Control-Allow-Origin", allowOrigin);
  result.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  result.set("Access-Control-Allow-Headers", "Content-Type");
  result.set("Access-Control-Max-Age", "86400");
  return result;
}
