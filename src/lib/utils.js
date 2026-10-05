// Utility helpers shared across the app.

export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function formatDate(value, locale = "en-US") {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value, locale = "en-US") {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maskAccount(num) {
  if (!num) return "••••";
  const s = String(num);
  return "•••• " + s.slice(-4);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Channel metadata for the Send Money tabs.
export const CHANNELS = [
  { id: "local",   label: "Local transfer" },
  { id: "wire",    label: "Wire" },
  { id: "paypal",  label: "PayPal" },
  { id: "bitcoin", label: "Bitcoin" },
  { id: "skrill",  label: "Skrill" },
  { id: "cashapp", label: "Cash App" },
  { id: "zelle",   label: "Zelle" },
  { id: "revolut", label: "Revolut" },
  { id: "venmo",   label: "Venmo" },
];
