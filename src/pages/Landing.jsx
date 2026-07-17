import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import AGTBand from '@/components/landing/AGTBand';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import IRPSBand from '@/components/landing/IRPSBand';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Trust from '@/components/landing/Trust';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <AGTBand />
        <Problem />
        <HowItWorks />
        <IRPSBand />
        <Features />
        <Pricing />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}