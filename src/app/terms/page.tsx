import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Bluezoid',
  description: 'Terms and conditions for purchasing and using Bluezoid digital products.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="1 June 2025"
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: 'By purchasing or accessing any digital product from Bluezoid, you agree to be bound by these Terms of Service. If you do not agree, please do not complete the purchase.',
        },
        {
          heading: '2. Products and Delivery',
          body: [
            'All products sold on deepdiveintogo.in are digital goods (eBooks in PDF format).',
            'Upon successful payment, a one-time download link valid for 10 minutes is sent to the email address provided at checkout.',
            'It is your responsibility to provide a valid, accessible email address.',
            'If the link expires before use, contact support@bluezoid.in with your order ID for assistance.',
          ],
        },
        {
          heading: '3. License',
          body: [
            'Purchasing a product grants you a personal, non-exclusive, non-transferable license to access and read the content.',
            'You may not redistribute, resell, reproduce, share publicly, or create derivative works from any purchased content.',
            'The content is for your individual use only.',
          ],
        },
        {
          heading: '4. Pricing',
          body: 'All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Prices are subject to change without notice. The price displayed at the time of checkout is the price you will be charged.',
        },
        {
          heading: '5. Payments',
          body: 'Payments are processed securely by Cashfree Payments. We do not store your payment credentials. By completing a purchase, you also agree to Cashfree\'s terms of service.',
        },
        {
          heading: '6. Refunds and Cancellations',
          body: 'Please refer to our Refund & Cancellation Policy for full details on eligibility and the refund process.',
        },
        {
          heading: '7. Intellectual Property',
          body: 'All content, including text, code examples, graphics, and structure within our eBooks, is the intellectual property of Bluezoid. Unauthorized copying or distribution is a violation of copyright law.',
        },
        {
          heading: '8. Disclaimer of Warranties',
          body: 'Products are provided "as is". While we strive for accuracy and quality, Bluezoid makes no warranties regarding completeness, accuracy, or fitness for a particular purpose. Programming outcomes depend on your individual implementation and environment.',
        },
        {
          heading: '9. Limitation of Liability',
          body: 'Bluezoid\'s liability is limited to the purchase price of the product. We are not liable for any indirect, incidental, or consequential damages arising from the use of our products.',
        },
        {
          heading: '10. Governing Law',
          body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.',
        },
        {
          heading: '11. Contact',
          body: 'Bluezoid · support@bluezoid.in · India',
        },
      ]}
    />
  );
}
