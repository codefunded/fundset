import CallToAction from '@/components/call-to-action';
import Features from '@/components/features-1';
import FooterSection from '@/components/footer';
import HeroSection from '@/components/hero-section';
import IntegrationsSection from '@/components/integrations-1';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Features />
      <IntegrationsSection />
      <CallToAction />
      <FooterSection />
    </>
  );
}
