import type { APIContext } from "astro";

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function clientIp(context: APIContext): string {
  try {
    return context.clientAddress;
  } catch {
    return context.request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  }
}

/** Returns an error response unless this is a same-origin JSON POST of a sane size. */
export function guardJsonRequest(request: Request, maxBytes = 40_000): Response | null {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, error: "Forbidden." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Unsupported request." }, 415);
  }
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) {
    return json({ ok: false, error: "Request too large." }, 413);
  }
  return null;
}