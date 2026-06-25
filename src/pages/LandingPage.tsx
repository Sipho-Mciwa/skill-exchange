import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ProblemStrip } from '../components/landing/ProblemStrip';
import { HowItWorks } from '../components/landing/HowItWorks';
import { SkillCategories } from '../components/landing/SkillCategories';
import { Testimonials } from '../components/landing/Testimonials';
import { CTABanner } from '../components/landing/CTABanner';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <>
      <Navbar />
      {/* pt-16 to offset fixed navbar height */}
      <main className="pt-16">
        <Hero />
        <ProblemStrip />
        <HowItWorks />
        <SkillCategories />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
