import { confirmAction, type ConfirmOptions } from "@/lib/ui/confirm";
import { syncPhone } from "./phone";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type CaptchaElement = HTMLElement & { token?: string; reset?: () => void };
interface ApiResult {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string>;
}

const CONTROLS = "input:not([type=hidden]), select:not([data-phone-country]), textarea";
const NETWORK_ERROR = "We couldn't reach the server. Please check your connection and try again.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

const controlsOf = (field: Element) => Array.from(field.querySelectorAll<Control>(CONTROLS));

function messageFor(control: Control): string {
  const { validity } = control;
  if (validity.customError) return control.validationMessage;

  if (validity.valueMissing) {
    if (control instanceof HTMLInputElement && control.type === "checkbox") return "Please tick this box to continue.";
    if (control instanceof HTMLSelectElement) return "Please choose an option.";
    return "This field is required.";
  }
  if (validity.typeMismatch) {
    return control instanceof HTMLInputElement && control.type === "url"
      ? "Enter a valid web address, including https://"
      : "Enter a valid email address.";
  }
  if (validity.tooShort && "minLength" in control) return `Please use at least ${control.minLength} characters.`;
  if (validity.tooLong && "maxLength" in control) return `Please use no more than ${control.maxLength} characters.`;
  if (validity.patternMismatch) return control.title || "Please match the requested format.";
  return control.validationMessage || "Please check this field.";
}

function setFieldError(field: Element | null | undefined, message: string | null): void {
  if (!field) return;
  controlsOf(field).forEach((control) =>
    message ? control.setAttribute("aria-invalid", "true") : control.removeAttribute("aria-invalid"),
  );
  const error = field.querySelector<HTMLElement>("[data-error]");
  if (error) {
    error.textContent = message ?? "";
    error.hidden = !message;
  }
}

function initForm(form: HTMLFormElement): void {
  const endpoint = form.dataset.endpoint;
  if (!endpoint || form.dataset.ready) return;
  form.dataset.ready = "true";

  const el = <T extends HTMLElement>(selector: string) => {
    const found = form.querySelector<T>(selector);
    if (!found) throw new Error(`Form: missing ${selector}`);
    return found;
  };

  const body = el("[data-form-body]");
  const status = el("[data-form-status]");
  const success = el("[data-form-success]");
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]");
  const label = submit?.querySelector<HTMLElement>("[data-label]") ?? null;
  const originalLabel = label?.textContent ?? "";
  const captcha = form.querySelector<CaptchaElement>("dewlon-captcha");

  let confirmOptions: ConfirmOptions | null = null;
  try {
    confirmOptions = form.dataset.confirmOptions ? (JSON.parse(form.dataset.confirmOptions) as ConfirmOptions) : null;
  } catch {
    /* ignore a malformed option string */
  }

  let busy = false;

  const showStatus = (message: string | null) => {
    status.textContent = message ?? "";
    status.hidden = !message;
    if (message) status.scrollIntoView({ block: "nearest" });
  };

  const setBusy = (value: boolean) => {
    busy = value;
    form.setAttribute("aria-busy", String(value));
    if (!submit) return;
    submit.disabled = value;
    submit.querySelector("[data-spinner]")?.classList.toggle("hidden", !value);
    if (label) label.textContent = value ? (submit.dataset.loadingLabel ?? "Sending…") : originalLabel;
  };

  const syncDerived = () => {
    form.querySelectorAll<HTMLElement>("[data-phone]").forEach(syncPhone);
    form.querySelectorAll<HTMLElement>("[data-count-for]").forEach((counter) => {
      const textarea = form.querySelector<HTMLTextAreaElement>(`#${CSS.escape(counter.dataset.countFor ?? "")}`);
      counter.textContent = String(textarea?.value.length ?? 0);
    });
  };

  const focusField = (field: HTMLElement) => {
    const control = field.querySelector<Control>(CONTROLS);
    if (control) control.focus();
    else field.scrollIntoView({ block: "center" });
  };

  const validate = (): HTMLElement | null => {
    let first: HTMLElement | null = null;

    form.querySelectorAll<HTMLElement>("[data-field]").forEach((field) => {
      const invalid = controlsOf(field).find((control) => !control.checkValidity());
      setFieldError(field, invalid ? messageFor(invalid) : null);
      if (invalid && !first) first = field;
    });

    if (captcha && !captcha.token) {
      const field = captcha.closest<HTMLElement>("[data-field]");
      setFieldError(field, "Please complete the verification.");
      if (field && !first) first = field;
    }
    return first;
  };

  const applyServerErrors = (errors: Record<string, string>) => {
    let first: HTMLElement | null = null;
    for (const [name, message] of Object.entries(errors)) {
      const field = form.querySelector(`[name="${CSS.escape(name)}"]`)?.closest<HTMLElement>("[data-field]");
      if (!field) continue;
      setFieldError(field, message);
      first ??= field;
    }
    if (first) focusField(first);
  };

  const send = async () => {
    setBusy(true);
    showStatus(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(30_000),
      });
      const data = (await response.json().catch(() => null)) as ApiResult | null;

      if (response.ok && data?.ok) {
        form.reset();
        syncDerived();
        body.hidden = true;
        success.hidden = false;
        success.focus();
      } else {
        if (data?.errors) applyServerErrors(data.errors);
        showStatus(data?.error ?? GENERIC_ERROR);
      }
    } catch {
      showStatus(NETWORK_ERROR);
    } finally {
      setBusy(false);
      captcha?.reset?.(); // tokens are single-use
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    showStatus(null);

    const firstInvalid = validate();
    if (firstInvalid) return focusField(firstInvalid);

    if (confirmOptions && !(await confirmAction(confirmOptions))) return;
    await send();
  });

  const onEdit = (event: Event) => {
    syncDerived();
    const field = (event.target as HTMLElement).closest<HTMLElement>("[data-field]");
    if (field?.querySelector("[data-error]:not([hidden])")) setFieldError(field, null);
  };
  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);

  el("[data-form-again]").addEventListener("click", () => {
    success.hidden = true;
    body.hidden = false;
    form.querySelector<Control>(CONTROLS)?.focus();
  });

  syncDerived();
}

export function initForms(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>("form[data-form]").forEach(initForm);
}