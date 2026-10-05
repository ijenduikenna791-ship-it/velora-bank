"use client";

import TransferForm from "@/components/dashboard/TransferForm";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function TransferPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t("transfer.title")}</h1>
        <p className="text-sm text-muted">{t("transfer.demoNote")}</p>
      </div>
      <TransferForm scope="own" backHref="/dashboard" />
    </div>
  );
}
