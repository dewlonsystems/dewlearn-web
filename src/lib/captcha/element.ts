type Provider = "turnstile" | "recaptcha";

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id?: string): void;
  remove(id?: string): void;
}
interface RecaptchaApi {
  ready(callback: () => void): void;
  render(el: HTMLElement, options: Record<string, unknown>): number;
  reset(id?: number): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
    grecaptcha?: RecaptchaApi;
  }
}

const SCRIPT_URL: Record<Provider, string> = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  recaptcha: "https://www.google.com/recaptcha/api.js?render=explicit",
};

const loading = new Map<Provider, Promise<void>>();

function loadScript(provider: Provider): Promise<void> {
  let promise = loading.get(provider);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL[provider];
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (provider === "recaptcha" && window.grecaptcha) window.grecaptcha.ready(resolve);
        else resolve();
      };
      script.onerror = () => {
        loading.delete(provider); // allow a retry
        reject(new Error(`Could not load ${provider}`));
      };
      document.head.append(script);
    });
    loading.set(provider, promise);
  }
  return promise;
}

class DewlonCaptcha extends HTMLElement {
  private widgetId: string | number | null = null;
  private observer: IntersectionObserver | null = null;

  get token(): string {
    return this.querySelector<HTMLInputElement>('input[name="captchaToken"]')?.value ?? "";
  }

  connectedCallback(): void {
    if (this.observer || this.widgetId !== null) return;
    // Load the third-party script only when the widget is about to be seen
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer?.disconnect();
        void this.mount();
      },
      { rootMargin: "400px" },
    );
    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.widgetId !== null && this.dataset.provider === "turnstile") {
      window.turnstile?.remove(String(this.widgetId));
    }
    this.widgetId = null;
  }

  /** Clears the token and restarts the challenge. Tokens are single-use. */
  reset(): void {
    this.setToken("");
    if (this.widgetId === null) return;
    if (this.dataset.provider === "turnstile") window.turnstile?.reset(String(this.widgetId));
    else window.grecaptcha?.reset(Number(this.widgetId));
  }

  private setToken(value: string): void {
    const input = this.querySelector<HTMLInputElement>('input[name="captchaToken"]');
    if (input) input.value = value;
  }

  private async mount(): Promise<void> {
    const provider = this.dataset.provider as Provider | undefined;
    const sitekey = this.dataset.sitekey;
    const target = this.querySelector<HTMLElement>("[data-captcha-mount]");
    if (!provider || !sitekey || !target) return;

    try {
      await loadScript(provider);
    } catch {
      target.className = "text-sm text-danger";
      target.textContent = "The verification could not load. Please refresh the page and try again.";
      return;
    }

    const callbacks = {
      callback: (token: string) => this.setToken(token),
      "expired-callback": () => this.setToken(""),
      "error-callback": () => this.setToken(""),
    };

    if (provider === "turnstile" && window.turnstile) {
      this.widgetId = window.turnstile.render(target, { sitekey, theme: "auto", size: "flexible", ...callbacks });
    } else if (provider === "recaptcha" && window.grecaptcha) {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.widgetId = window.grecaptcha.render(target, {
        sitekey,
        theme: dark ? "dark" : "light",
        size: window.innerWidth < 380 ? "compact" : "normal",
        ...callbacks,
      });
    }
  }
}

if (!customElements.get("dewlon-captcha")) customElements.define("dewlon-captcha", DewlonCaptcha);
export {};