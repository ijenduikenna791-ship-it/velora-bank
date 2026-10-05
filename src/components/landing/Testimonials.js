"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";

const QUOTES = [
  {
    name: "Amara Okafor",
    role: "Freelance designer",
    quote: "Velora makes moving money feel effortless. The dashboard is the cleanest I've used — everything is one tap away.",
  },
  {
    name: "Daniel Reyes",
    role: "Small business owner",
    quote: "Sending across different methods used to be a headache. With Velora it's one screen, and the confirmation is instant.",
  },
  {
    name: "Mei Lin",
    role: "Product manager",
    quote: "Beautiful, fast and genuinely simple. Switching themes and languages on the fly is a lovely touch.",
  },
];

function avatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C3AED&color=fff&bold=true&size=96`;
}

export default function Testimonials() {
  return (
    <section className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">Loved by members</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            People enjoy banking with Velora
          </h2>
          <p className="mt-3 text-muted">A few words from our community.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card flex flex-col p-6"
            >
              <div className="mb-3 text-3xl leading-none text-brand">&ldquo;</div>
              <blockquote className="flex-1 text-sm text-ink">{q.quote}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <SmartImage
                  src={avatar(q.name)}
                  alt={q.name}
                  className="h-10 w-10 rounded-full object-cover"
                  fallbackClassName="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="text-sm font-semibold text-ink">{q.name}</div>
                  <div className="text-xs text-muted">{q.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
