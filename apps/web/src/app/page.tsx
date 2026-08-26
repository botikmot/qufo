import { DemoSection } from "@/components/marketing/demo-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { LandingNavbar } from "@/components/marketing/landing-navbar";
import { ReportsSection } from "@/components/marketing/reports-section";
import { TrackingSection } from "@/components/marketing/tracking-section";
import { TrialCtaSection } from "@/components/marketing/trial-cta-section";
import { WorkflowSection } from "@/components/marketing/workflow-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ContactSection } from "@/components/marketing/contact-section";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QUFO — Run Your Entire Workflow Without the Chaos",

  description:
    "Manage customers, quotations, approvals, jobs, payments, and customer tracking in one connected workspace.",

  alternates: {
    canonical: "https://qufo.im",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#050d18] text-slate-100">
      <LandingNavbar />

      <HeroSection />
      <WorkflowSection />
      <DemoSection />
      <FeaturesSection />
      <TrackingSection />
      <ReportsSection />
      <TrialCtaSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter />
    </main>
  );
}