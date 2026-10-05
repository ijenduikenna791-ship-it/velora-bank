import { maskAccount } from "@/lib/utils";

// Per-channel field definitions for the Send Money tabs.
// `labelFrom(values)` produces the human-readable recipient label stored
// on the transaction (e.g. a masked IBAN, a PayPal email, a wallet).
export const FIELDS = {
  local: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe", required: true },
      { name: "accountNumber", label: "Account number", placeholder: "0123456789", required: true },
      { name: "bankName", label: "Bank name", placeholder: "First National Bank", required: true },
    ],
    labelFrom: (v) => maskAccount(v.accountNumber),
  },
  wire: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe", required: true },
      { name: "iban", label: "IBAN / Account", placeholder: "DE89 3704 0044 0532 0130 00", required: true },
      { name: "swift", label: "SWIFT / BIC", placeholder: "DEUTDEFF", required: true },
      { name: "bankName", label: "Bank name", placeholder: "Deutsche Bank", required: true },
    ],
    labelFrom: (v) => `${v.swift} · ${maskAccount(v.iban)}`,
  },
  paypal: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe" },
      { name: "email", label: "PayPal email", placeholder: "jane@example.com", type: "email", required: true },
    ],
    labelFrom: (v) => v.email,
  },
  bitcoin: {
    fields: [
      { name: "wallet", label: "Bitcoin wallet address", placeholder: "bc1q…", required: true },
      { name: "network", label: "Network", placeholder: "Bitcoin (BTC)", required: true },
    ],
    labelFrom: (v) => maskAccount(v.wallet),
  },
  skrill: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe" },
      { name: "email", label: "Skrill email", placeholder: "jane@example.com", type: "email", required: true },
    ],
    labelFrom: (v) => v.email,
  },
  cashapp: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe" },
      { name: "cashtag", label: "$Cashtag", placeholder: "$janedoe", required: true },
    ],
    labelFrom: (v) => v.cashtag,
  },
  zelle: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe", required: true },
      { name: "handle", label: "Email or phone", placeholder: "jane@example.com / +1…", required: true },
    ],
    labelFrom: (v) => v.handle,
  },
  revolut: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe" },
      { name: "revtag", label: "Revtag or phone", placeholder: "@janedoe", required: true },
    ],
    labelFrom: (v) => v.revtag,
  },
  venmo: {
    fields: [
      { name: "recipientName", label: "Recipient name", placeholder: "Jane Doe" },
      { name: "username", label: "Venmo @username", placeholder: "@jane-doe", required: true },
    ],
    labelFrom: (v) => v.username,
  },
};
