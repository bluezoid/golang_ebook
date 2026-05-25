import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Bluezoid',
  description: 'Bluezoid refund and cancellation policy for digital product purchases.',
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      effectiveDate="1 June 2025"
      sections={[
        {
          heading: '1. Digital Product Policy',
          body: 'All products sold on deepdiveintogo.in are digital goods delivered instantly via email. Due to the nature of digital products, we generally do not offer refunds once the download link has been accessed.',
        },
        {
          heading: '2. Eligible Refund Scenarios',
          body: [
            'Duplicate payment — you were charged more than once for the same order.',
            'Non-delivery — payment was deducted but you did not receive the download link within 30 minutes and support was unable to resolve the issue.',
            'Technical issue — the downloaded file is corrupt or inaccessible and we are unable to provide a working replacement.',
          ],
        },
        {
          heading: '3. Non-Refundable Scenarios',
          body: [
            'You changed your mind after accessing or downloading the content.',
            'You purchased the wrong product by mistake (please contact us before accessing the link).',
            'You did not read the product description or table of contents before purchasing.',
            'Technical issues on your device or email client that are outside our control.',
          ],
        },
        {
          heading: '4. How to Request a Refund',
          body: [
            'Email support@bluezoid.in within 7 days of purchase.',
            'Include your Order ID (found in the confirmation email or on the success page).',
            'Briefly describe the issue.',
            'We will respond within 2 business days.',
          ],
        },
        {
          heading: '5. Refund Processing',
          body: 'Approved refunds are processed back to the original payment method within 5–7 business days, depending on your bank or payment provider. Cashfree Payments processes the refund on our behalf.',
        },
        {
          heading: '6. Order Cancellation',
          body: 'If you initiated a payment but did not complete it, no charge is made. If you cancelled during the Cashfree checkout process, you will not be charged and no action is required. If a charge appeared, contact us immediately with your Order ID.',
        },
        {
          heading: '7. Contact',
          body: 'For any refund or cancellation queries: support@bluezoid.in · We aim to respond within 2 business days.',
        },
      ]}
    />
  );
}
