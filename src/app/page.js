"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import AppShowcase from "@/components/landing/AppShowcase";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CardsShowcase from "@/components/landing/CardsShowcase";
import Converter from "@/components/landing/Converter";
import Comparison from "@/components/landing/Comparison";
import Security from "@/components/landing/Security";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import { CTA, Footer } from "@/components/landing/CTA";

export default function HomePage() {
  // The intro animation plays on every load, then reveals the landing page.
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Preloader onDone={() => setLoading(false)} />}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.6, delay: loading ? 0 : 0.1 }}
        className="relative min-h-screen"
      >
        <Navbar />
        <Hero />
        <TrustStrip />
        <AppShowcase />
        <Features />
        <HowItWorks />
        <Converter />
        <CardsShowcase />
        <Comparison />
        <Security />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </motion.main>
    </>
  );
}
