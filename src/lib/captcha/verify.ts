import { CAPTCHA_PROVIDER } from "astro:env/client";
import { RECAPTCHA_SECRET_KEY, TURNSTILE_SECRET_KEY } from "astro:env/server";

const ENDPOINTS = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  recaptcha: "https://www.google.com/recaptcha/api/siteverify",
} as const;

export type CaptchaResult = { ok: true } | { ok: false; reason: "missing" | "failed" | "unavailable" };

export async function verifyCaptcha(token: unknown, ip?: string): Promise<CaptchaResult> {
  const provider = CAPTCHA_PROVIDER;
  if (provider === "none") return { ok: true };

  if (typeof token !== "string" || token.length === 0 || token.length > 4096) {
    return { ok: false, reason: "missing" };
  }

  const secret = provider === "turnstile" ? TURNSTILE_SECRET_KEY : RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error(`[CAPTCHA] ${provider} secret key is not configured`);
    return { ok: false, reason: "unavailable" };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch(ENDPOINTS[provider], { method: "POST", body, signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return { ok: false, reason: "unavailable" };

    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? { ok: true } : { ok: false, reason: "failed" };
  } catch (error) {
    console.error("[CAPTCHA] verification request failed", error);
    return { ok: false, reason: "unavailable" };
  }
}