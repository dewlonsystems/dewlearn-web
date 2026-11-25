const E164 = /^\+[1-9]\d{6,14}$/;

/** "0712 345 678" + "+254" → "+254712345678". Also accepts "+254…", "00254…" and "254…". */
export function composePhone(dial: string, raw: string): string {
  const text = raw.trim();
  let digits = text.replace(/\D/g, "");
  if (!digits) return "";

  if (text.startsWith("+")) return `+${digits}`;
  if (text.startsWith("00")) return `+${digits.slice(2)}`;

  const dialDigits = dial.slice(1);
  digits = digits.replace(/^0+/, "");
  if (digits.startsWith(dialDigits) && digits.length >= dialDigits.length + 8) return `+${digits}`;
  return `${dial}${digits}`;
}

export function syncPhone(wrapper: HTMLElement): void {
  const country = wrapper.querySelector<HTMLSelectElement>("[data-phone-country]");
  const number = wrapper.querySelector<HTMLInputElement>("[data-phone-number]");
  const hidden = wrapper.querySelector<HTMLInputElement>("[data-phone-value]");
  if (!country || !number || !hidden) return;

  const value = composePhone(country.value, number.value);
  hidden.value = value;
  number.setCustomValidity(value && !E164.test(value) ? "Enter a valid phone number." : "");
}