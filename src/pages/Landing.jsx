import React from 'react';
import Seo from '@/components/Seo';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import AGTBand from '@/components/landing/AGTBand';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoBand from '@/components/landing/DemoBand';
import IRPSBand from '@/components/landing/IRPSBand';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Trust from '@/components/landing/Trust';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="O teu dinheiro, em dia."
        description="Junta as tuas faturas, paga por Multicaixa Express e prepara o teu IRPS. Gestão financeira feita para Angola."
        path="/"
      />
      <ScrollProgressBar />
      <Navbar />
      <main>
        <Hero />
        <AGTBand />
        <Problem />
        <HowItWorks />
        <DemoBand />
        <IRPSBand />
        <Features />
        <Pricing />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}