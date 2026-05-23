'use client';

import { useState } from 'react';
import HeroSection from './HeroSection';
import EbookPreview from './EbookPreview';
import EbookFeatures from './EbookFeatures';
import AudienceSection from './AudienceSection';
import PDFPreview from './PDFPreview';
import PricingCard from './PricingCard';
import Testimonials from './Testimonials';
import FAQAccordion from './FAQAccordion';
import CTASection from './CTASection';
import Footer from './Footer';
import PurchaseModal from './PurchaseModal';

export default function DeepDiveIntoGoPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleBuyClick = () => setModalOpen(true);
  const handlePreviewClick = () => {
    window.open('/api/sample-download', '_blank');
  };

  return (
    <>
      <main>
        <HeroSection onBuyClick={handleBuyClick} onPreviewClick={handlePreviewClick} />
        <EbookPreview />
        <EbookFeatures />
        <AudienceSection />
        <PDFPreview onPreviewClick={handlePreviewClick} />
        <PricingCard onBuyClick={handleBuyClick} />
        <Testimonials />
        <FAQAccordion />
        <CTASection onBuyClick={handleBuyClick} />
      </main>
      <Footer />
      <PurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
