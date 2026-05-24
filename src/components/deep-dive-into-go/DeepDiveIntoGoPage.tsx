'use client';

import { useState, useEffect } from 'react';
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

export interface ProductData {
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  discountLabel: string;
  ctaPrimary: string;
  ctaSecondary: string;
  title: string;
  subtitle: string;
}

const PRODUCT_SLUG = 'deep-dive-into-go';

// Fallback values shown while product data loads — matches the seeded product
const FALLBACK_PRODUCT: ProductData = {
  currentPrice: 149,
  originalPrice: 999,
  discountPercent: 85,
  discountLabel: 'Launch Price',
  ctaPrimary: 'Buy Now',
  ctaSecondary: 'Preview Book',
  title: 'Deep Dive Into Go',
  subtitle: 'Building Production-Ready Systems',
};

export default function DeepDiveIntoGoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState<ProductData>(FALLBACK_PRODUCT);

  useEffect(() => {
    fetch(`/api/products/${PRODUCT_SLUG}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.product) {
          setProduct({
            currentPrice: data.product.currentPrice,
            originalPrice: data.product.originalPrice,
            discountPercent: data.product.discountPercent,
            discountLabel: data.product.discountLabel,
            ctaPrimary: data.product.ctaPrimary,
            ctaSecondary: data.product.ctaSecondary,
            title: data.product.title,
            subtitle: data.product.subtitle,
          });
        }
      })
      .catch(() => { /* fallback values remain */ });
  }, []);

  const handleBuyClick = () => setModalOpen(true);
  const handlePreviewClick = () => {
    window.open('/api/sample-download', '_blank');
  };

  return (
    <>
      <main>
        <HeroSection
          onBuyClick={handleBuyClick}
          onPreviewClick={handlePreviewClick}
          product={product}
        />
        <EbookPreview />
        <EbookFeatures />
        <AudienceSection />
        <PDFPreview onPreviewClick={handlePreviewClick} />
        <PricingCard onBuyClick={handleBuyClick} product={product} />
        <Testimonials />
        <FAQAccordion />
        <CTASection onBuyClick={handleBuyClick} product={product} />
      </main>
      <Footer />
      <PurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} product={product} />
    </>
  );
}
