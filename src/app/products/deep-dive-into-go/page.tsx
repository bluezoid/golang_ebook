import type { Metadata } from 'next';
import Script from 'next/script';
import DeepDiveIntoGoPage from '@/components/deep-dive-into-go/DeepDiveIntoGoPage';

const BASE_URL = 'https://bluezoid.in';
const PAGE_URL = `${BASE_URL}/products/deep-dive-into-go`;
const TITLE = 'Deep Dive Into Go — Production-Ready Systems | Bluezoid';
const DESCRIPTION =
  '102 chapters, 10 capstone projects, 315 runnable programs. The complete Golang engineering handbook from fundamentals to production-grade distributed systems. Go 1.22+ · First Edition 2025.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Golang ebook', 'Go programming book', 'backend development Go',
    'Golang concurrency', 'Go microservices', 'Go REST API', 'Golang tutorial',
    'Go production engineering', 'Golang interview', 'Go 1.22',
    'goroutines', 'channels Go', 'Go generics', 'Bluezoid',
    'Deep Dive Into Go', 'Go capstone projects', 'clean architecture Go',
  ],
  authors: [{ name: 'Bluezoid', url: BASE_URL }],
  creator: 'Bluezoid',
  publisher: 'Bluezoid',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Bluezoid',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/og/deep-dive-into-go.png`,
        width: 1200,
        height: 630,
        alt: 'Deep Dive Into Go — Production Golang Ebook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@bluezoid',
    images: [`${BASE_URL}/og/deep-dive-into-go.png`],
  },
  alternates: {
    canonical: PAGE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': `${PAGE_URL}#product`,
      name: 'Deep Dive Into Go: Building Production-Ready Systems',
      description: DESCRIPTION,
      url: PAGE_URL,
      brand: { '@type': 'Brand', name: 'Bluezoid' },
      publisher: {
        '@type': 'Organization',
        name: 'Bluezoid',
        url: BASE_URL,
        email: 'support@bluezoid.in',
      },
      offers: {
        '@type': 'Offer',
        url: PAGE_URL,
        priceCurrency: 'INR',
        price: '149',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        deliveryLeadTime: {
          '@type': 'QuantitativeValue',
          value: 0,
          unitCode: 'MIN',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '6',
        bestRating: '5',
        worstRating: '1',
      },
      numberOfPages: '300+',
      bookEdition: 'First Edition 2025',
      bookFormat: 'https://schema.org/EBook',
      inLanguage: 'en',
      genre: 'Computer Science',
      about: 'Go programming language, backend engineering, distributed systems',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/products` },
        { '@type': 'ListItem', position: 3, name: 'Deep Dive Into Go', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this ebook beginner friendly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. It starts from Go fundamentals and progressively covers advanced topics. No prior Go knowledge required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I receive the ebook?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The PDF is delivered instantly to your registered email address after payment is confirmed.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many chapters does the book have?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '102 chapters across 7 structured parts, with 10 capstone projects and 315 runnable Go programs.',
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <Script
        id="json-ld-deep-dive-go"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DeepDiveIntoGoPage />
    </>
  );
}
