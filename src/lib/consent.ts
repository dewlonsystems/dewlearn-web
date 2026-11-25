export const CONSENT_KEY = "dewlon-cookie-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "cookie-consent";

export type ConsentCategory = "functional" | "analytics" | "marketing";
export type ConsentChoices = Record<ConsentCategory, boolean>;

export interface StoredConsent extends ConsentChoices {
  necessary: true;
  version: number;
  updatedAt: string;
}

export const ACCEPT_ALL: ConsentChoices = { functional: true, analytics: true, marketing: true };
export const REJECT_ALL: ConsentChoices = { functional: false, analytics: false, marketing: false };

function build(choices: ConsentChoices): StoredConsent {
  return {
    necessary: true,
    functional: choices.functional,
    analytics: choices.analytics,
    marketing: choices.marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function getConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;

    // Values saved by the first version of the banner
    if (raw === "all") return build(ACCEPT_ALL);
    if (raw === "essential") return build(REJECT_ALL);

    const parsed = JSON.parse(raw);
    if (parsed?.version !== CONSENT_VERSION) return null;

    return build({
      functional: parsed.functional === true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    });
  } catch {
    return null;
  }
}

export function saveConsent(choices: ConsentChoices): StoredConsent {
  const stored = build(choices);
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {
    /* storage blocked: the choice only lasts for this page view */
  }
  window.dispatchEvent(new CustomEvent<StoredConsent>(CONSENT_EVENT, { detail: stored }));
  return stored;
}

export function hasConsent(category: ConsentCategory): boolean {
  return getConsent()?.[category] === true;
}

/** Runs the callback once, as soon as the visitor has allowed this category (now or later). */
export function onConsent(category: ConsentCategory, callback: () => void): void {
  let fired = false;
  const run = () => {
    if (fired || !hasConsent(category)) return;
    fired = true;
    callback();
  };
  run();
  window.addEventListener(CONSENT_EVENT, run);
}