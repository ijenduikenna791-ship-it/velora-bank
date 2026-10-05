"use client";

import TransferForm from "@/components/dashboard/TransferForm";

export default function AdminSendPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Send Money</h1>
        <p className="text-sm text-muted">
          Move money from any customer account across local, wire, PayPal, Bitcoin and more.
        </p>
      </div>
      <TransferForm scope="all" backHref="/admin" />
    </div>
  );
}
