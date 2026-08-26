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
      <LandingFooter />
    </main>
  );
}