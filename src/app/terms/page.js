import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Terms of Service — Velora Bank",
  description: "The terms that govern your use of Velora Bank.",
};

const SECTIONS = [
  {
    h: "1. Acceptance of terms",
    p: "By creating an account or using Velora Bank (the “Service”), you agree to these Terms of Service. If you do not agree, please do not use the Service.",
  },
  {
    h: "2. About the Service",
    p: "Velora Bank is a demonstration banking platform. It is provided for illustration and testing purposes only. No real money is ever held, moved, or transferred, and balances shown are demo values with no monetary worth.",
  },
  {
    h: "3. Your account",
    p: "You are responsible for providing accurate information when you register and for keeping your login credentials and transaction PIN confidential. You are responsible for all activity that occurs under your account.",
  },
  {
    h: "4. Acceptable use",
    p: "You agree not to misuse the Service, attempt to disrupt it, access other users’ data without authorization, or use it for any unlawful purpose. We may suspend or remove accounts that violate these terms.",
  },
  {
    h: "5. Intellectual property",
    p: "The Velora name, branding, and the Service’s design and code are the property of their respective owners. You may not copy or redistribute them without permission.",
  },
  {
    h: "6. Disclaimer",
    p: "The Service is provided “as is,” without warranties of any kind. Because this is a demonstration platform, we make no guarantees about availability, accuracy, or fitness for any particular purpose.",
  },
  {
    h: "7. Limitation of liability",
    p: "To the fullest extent permitted by law, Velora Bank and its creators are not liable for any damages arising from your use of this demonstration Service.",
  },
  {
    h: "8. Changes to these terms",
    p: "We may update these terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.",
  },
  {
    h: "9. Contact",
    p: "Questions about these terms? Reach us through the live chat on our site.",
  },
];

export default function TermsPage() {
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
          Terms of Service
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
          <Link href="/privacy" className="text-brand underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </Link>
          .
        </div>
      </article>
    </main>
  );
}
