import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Privacy Policy — Velora Bank",
  description: "How Velora Bank handles your information.",
};

const SECTIONS = [
  {
    h: "1. Introduction",
    p: "This Privacy Policy explains how Velora Bank handles information when you use our demonstration banking platform. Because this is a demo, we collect only what is needed to run your demo account.",
  },
  {
    h: "2. Information we collect",
    p: "When you create an account we collect your name, email address, phone number, and country. As you use the Service we store your demo account activity, such as transfers and requests, so we can display them back to you.",
  },
  {
    h: "3. How we use your information",
    p: "We use your information to create and secure your account, show your demo activity, send account-related notifications, and operate and improve the Service. We do not sell your information.",
  },
  {
    h: "4. Data storage and security",
    p: "Your data is stored with our hosting and database provider (Supabase) and protected with access controls and encrypted connections. Passwords and your transaction PIN are stored as secure hashes, never in plain text.",
  },
  {
    h: "5. Third-party services",
    p: "We use a small number of third-party services to run the Service, including Supabase (database and authentication), Resend (email notifications), and Tawk.to (live chat). These providers process data only as needed to deliver their function.",
  },
  {
    h: "6. Cookies",
    p: "We use essential cookies and local storage to keep you signed in and to remember preferences such as your theme and language. We do not use advertising trackers.",
  },
  {
    h: "7. Your rights",
    p: "You can view and update your profile information at any time from your settings, and you may request deletion of your demo account by contacting us through the live chat.",
  },
  {
    h: "8. Changes to this policy",
    p: "We may update this policy from time to time. Any changes will be posted on this page with a new “last updated” date.",
  },
  {
    h: "9. Contact",
    p: "Questions about your privacy? Reach us through the live chat on our site.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="container-px flex h-16 items-center justify-between border-b border-line">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink">
          <ArrowLeftIcon size={15} /> Back to home
        </Link>
      </header>

      <article className="container-px mx-auto max-w-3xl py-12 sm:py-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: October 5, 2026</p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-ink">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
          See also our{" "}
          <Link href="/terms" className="text-brand underline underline-offset-2 hover:no-underline">
            Terms of Service
          </Link>
          .
        </div>
      </article>
    </main>
  );
}
