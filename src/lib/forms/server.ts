import type { APIContext, APIRoute } from "astro";
import type { z } from "zod";
import { siteConfig } from "@/config/site";
import { verifyCaptcha } from "@/lib/captcha/verify";
import { clientIp, guardJsonRequest, json } from "@/lib/http";

/**
 * Builds a POST endpoint: same-origin check → honeypot → validation →
 * captcha → your handler. Validation messages come from the Zod schema.
 */
export function formEndpoint<S extends z.ZodType>(
  schema: S,
  handle: (data: z.infer<S>, context: APIContext) => Promise<void>,
): APIRoute {
  return async (context) => {
    const blocked = guardJsonRequest(context.request);
    if (blocked) return blocked;

    let body: Record<string, unknown>;
    try {
      const raw = await context.request.json();
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("bad body");
      body = raw as Record<string, unknown>;
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }

    // Honeypot: only bots fill it. Pretend it worked so they learn nothing.
    if (typeof body.hpField === "string" && body.hpField !== "") return json({ ok: true });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] ??= issue.message;
      }
      return json({ ok: false, error: "Please check the highlighted fields.", errors }, 422);
    }

    const captcha = await verifyCaptcha(body.captchaToken, clientIp(context));
    if (!captcha.ok) {
      if (captcha.reason === "unavailable") {
        return json({ ok: false, error: "Verification is temporarily unavailable. Please try again shortly." }, 503);
      }
      return json(
        {
          ok: false,
          error: "Verification failed. Please try again.",
          errors: { captchaToken: "Please complete the verification again." },
        },
        400,
      );
    }

    try {
      await handle(parsed.data, context);
      return json({ ok: true });
    } catch (error) {
      console.error("[FORM_ERROR]", error);
      return json(
        { ok: false, error: `We couldn't send your message. Please try again or email ${siteConfig.contact.email}.` },
        500,
      );
    }
  };
}