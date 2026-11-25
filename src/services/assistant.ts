import { createHash } from "node:crypto";
import { z } from "zod";
import { GROQ_API_KEY } from "astro:env/server";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "@/lib/assistant-prompt";

export const CONFIG = {
  RATE_LIMIT: 30,
  RATE_WINDOW_MS: 60_000,
  MAX_HISTORY_MESSAGES: 8,
  MAX_CONTENT_LENGTH: 800,
  MAX_BODY_BYTES: 20_000,
  GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
  MODEL: "openai/gpt-oss-120b",
  MAX_TOKENS: 400,
  TEMPERATURE: 0.3,
  MAX_CONSECUTIVE_FAILURES: 3,
  FAILURE_RESET_MS: 300_000,
  LOG_SECURITY_EVENTS: true,
  CLEANUP_INTERVAL_MS: 600_000,
} as const;

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
});

export type AssistantMessage = z.infer<typeof messageSchema>;

type RateEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateEntry>();
const failureCountMap = new Map<string, { count: number; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
  for (const [ip, entry] of failureCountMap) {
    if (now > entry.expiresAt) failureCountMap.delete(ip);
  }
}, CONFIG.CLEANUP_INTERVAL_MS).unref?.();

const INJECTION_PATTERNS = [
  /(?:reveal|show|print|output|return|give|tell|share)\s*(?:your\s*)?(?:system\s*)?(?:prompt|instruction|rule|config|settings|directive)/i,
  /(?:ignore|bypass|skip|override|disregard|forget)\s*(?:all\s*)?(?:previous|prior|above|these)?\s*(?:instructions|rules|prompts|guidelines)/i,
  /(?:developer|debug|admin|root|sudo|god)\s*(?:mode|access|command|privilege)/i,
  /(?:what\s*(?:are|is)\s*(?:your|the)\s*(?:instructions|rules|prompt|system))/i,
  /(?:start\s*with|begin\s*with|output\s*the\s*text\s*that\s*says)/i,
  /(?:base64|hex|unicode|rot13|encode|decode)\s*(?:prompt|instruction)/i,
  /(?:repeat\s*after\s*me|say\s*the\s*following|copy\s*this)/i,
  /(?:###\s*(?:instruction|system|user)|\[SYSTEM\]|<\|im_end\|>)/i,
  /(?:act\s*as|pretend\s*to\s*be|you\s*are\s*now|switch\s*role)/i,
];

function detectInjectionAttempt(text: string): { detected: boolean; pattern?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) return { detected: true, pattern: pattern.toString() };
  }
  return { detected: false };
}

const SENSITIVE_OUTPUT_PATTERNS = [
  /(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36,}|AIza[a-zA-Z0-9]{35})/,
  /(?:\/internal\/|\/admin\/|\/api\/private|localhost:\d{4})/,
];

function validateOutput(
  output: string,
  systemPrompt: string,
  metadata: { ipHash: string }
): { safe: boolean; sanitized: string; reason?: string } {
  for (const pattern of SENSITIVE_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      if (CONFIG.LOG_SECURITY_EVENTS) {
        console.warn(`[OUTPUT_BLOCKED] credential/path pattern | IP_HASH: ${metadata.ipHash}`);
      }
      return {
        safe: false,
        sanitized: "I can't share that. How can I help with your request?",
        reason: "sensitive_pattern",
      };
    }
  }

  const promptFragment = systemPrompt.slice(0, 40).toLowerCase();
  if (systemPrompt && output.toLowerCase().includes(promptFragment)) {
    if (CONFIG.LOG_SECURITY_EVENTS) {
      console.warn(`[OUTPUT_BLOCKED] system prompt fragment | IP_HASH: ${metadata.ipHash}`);
    }
    return {
      safe: false,
      sanitized: "I'm not able to share my internal setup. What would you like to know?",
      reason: "prompt_fragment_detected",
    };
  }

  const maxChars = CONFIG.MAX_TOKENS * 4;
  if (output.length > maxChars) {
    return {
      safe: true,
      sanitized: output.slice(0, maxChars * 0.75) + " [...truncated]",
      reason: "length_truncated",
    };
  }

  return { safe: true, sanitized: output };
}

function sanitizeMessages(messages: AssistantMessage[]) {
  return messages.slice(-CONFIG.MAX_HISTORY_MESSAGES).map((m) => ({
    role: m.role,
    content: m.content.slice(0, CONFIG.MAX_CONTENT_LENGTH).replace(/[\u0000-\u001F\u007F-\u009F]/g, ""),
  }));
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + CONFIG.RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= CONFIG.RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function checkCircuitBreaker(ip: string): boolean {
  const entry = failureCountMap.get(ip);
  return !!entry && entry.count >= CONFIG.MAX_CONSECUTIVE_FAILURES && Date.now() < entry.expiresAt;
}

function recordFailure(ip: string) {
  const existing = failureCountMap.get(ip);
  const count = (existing?.count ?? 0) + 1;
  failureCountMap.set(ip, { count, expiresAt: Date.now() + CONFIG.FAILURE_RESET_MS });
}

function recordSuccess(ip: string) {
  failureCountMap.delete(ip);
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
      if (res.status === 429 && i < retries) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err as Error;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError ?? new Error("Request failed after retries");
}

function logSecurityEvent(event: string, ipHash: string, reason?: string) {
  if (!CONFIG.LOG_SECURITY_EVENTS) return;
  console.log(`[SECURITY] ${event} | IP_HASH: ${ipHash} | ${reason ?? "no_reason"} | PROMPT_V: ${PROMPT_VERSION}`);
}

export type AssistantOutcome =
  | { ok: true; text: string }
  | { ok: false; error: string; retryAfter?: number };

/**
 * Core assistant logic: rate limiting, validation, the Groq call, and
 * output safety checks. Takes a plain client identifier (e.g. a hashed
 * IP) so it has no dependency on any specific request/response API —
 * callable from a Server Action, a Route Handler, a script, or a test.
 */
export async function runAssistant(
  clientId: string,
  rawMessages: unknown
): Promise<AssistantOutcome> {
  const ipHash = hashIp(clientId);

  try {
    if (isRateLimited(clientId)) {
      logSecurityEvent("RATE_LIMITED", ipHash);
      return { ok: false, error: "Too many requests. Please wait.", retryAfter: 60 };
    }

    if (checkCircuitBreaker(clientId)) {
      logSecurityEvent("CIRCUIT_BREAKER_OPEN", ipHash);
      return { ok: false, error: "Service temporarily unavailable. Please try again later." };
    }

    const bodySize = JSON.stringify(rawMessages ?? "").length;
    if (bodySize > CONFIG.MAX_BODY_BYTES) {
      return { ok: false, error: "Request too large." };
    }

    const parsed = requestSchema.safeParse({ messages: rawMessages });
    if (!parsed.success) {
      return { ok: false, error: "Invalid message format." };
    }

    const sanitised = sanitizeMessages(parsed.data.messages);

    const lastUserMessage = sanitised.filter((m) => m.role === "user").pop();
    if (lastUserMessage) {
      const injectionCheck = detectInjectionAttempt(lastUserMessage.content);
      if (injectionCheck.detected) {
        logSecurityEvent("INJECTION_ATTEMPT_DETECTED", ipHash, injectionCheck.pattern);
        return { ok: true, text: "I'm here to help! Could you try rephrasing your request?" };
      }
    }

    const response = await fetchWithRetry(CONFIG.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "User-Agent": "Dewlon-Assistant-Secure/1.0",
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        top_p: 0.9,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitised],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.error(`[GROQ_ERROR] Status: ${response.status} | Body: ${errorText.slice(0, 200)}`);
      recordFailure(clientId);

      if (response.status === 429) {
        return { ok: false, error: "AI service is busy. Please try again in a moment.", retryAfter: 30 };
      }
      if (response.status >= 500) {
        return { ok: false, error: "AI service temporarily unavailable." };
      }
      return { ok: false, error: "Request could not be processed." };
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      recordFailure(clientId);
      throw new Error("Malformed JSON from Groq");
    }

    const rawReply = data?.choices?.[0]?.message?.content;
    if (!rawReply || typeof rawReply !== "string") {
      recordFailure(clientId);
      throw new Error("Invalid response format from AI service");
    }

    const { safe, sanitized, reason } = validateOutput(rawReply, SYSTEM_PROMPT, { ipHash });
    if (!safe) logSecurityEvent("OUTPUT_BLOCKED", ipHash, reason);

    recordSuccess(clientId);
    return { ok: true, text: sanitized };
  } catch (err) {
    const error = err as Error;
    console.error(`[ASSISTANT_ERROR] ${error.message}`);
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}