export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

/** Opens the shared confirmation dialog. Resolves true if the visitor confirms. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const dialog = document.querySelector<HTMLDialogElement>("#confirm-dialog");
  if (!dialog) return Promise.resolve(window.confirm(options.message ?? options.title));
  if (dialog.open) return Promise.resolve(false);

  const el = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;
  const danger = options.tone === "danger";

  el("[data-confirm-title]").textContent = options.title;
  const message = el("[data-confirm-message]");
  message.textContent = options.message ?? "";
  message.hidden = !options.message;

  el("[data-confirm-cancel]").textContent = options.cancelLabel ?? "Cancel";
  const ok = el("[data-confirm-ok]");
  const bad = el("[data-confirm-danger]");
  ok.hidden = danger;
  bad.hidden = !danger;
  (danger ? bad : ok).textContent = options.confirmLabel ?? (danger ? "Delete" : "Confirm");
  el("[data-confirm-icon-default]").hidden = danger;
  el("[data-confirm-icon-danger]").hidden = !danger;

  dialog.returnValue = "";

  return new Promise((resolve) => {
    const onClose = () => {
      dialog.removeEventListener("close", onClose);
      document.documentElement.classList.remove("overflow-hidden");
      resolve(dialog.returnValue === "confirm");
    };
    dialog.addEventListener("close", onClose);
    dialog.showModal();
    document.documentElement.classList.add("overflow-hidden");
  });
}