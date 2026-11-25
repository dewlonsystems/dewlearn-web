import type { APIRoute } from "astro";
import { runAssistant } from "@/services/assistant";
import { clientIp, guardJsonRequest, json } from "@/lib/http";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const blocked = guardJsonRequest(context.request);
  if (blocked) return blocked;

  let body: { messages?: unknown } | null = null;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const result = await runAssistant(clientIp(context), body?.messages);
  if (result.ok) return json(result);

  return json(
    result,
    result.retryAfter ? 429 : 400,
    result.retryAfter ? { "Retry-After": String(result.retryAfter) } : undefined,
  );
};