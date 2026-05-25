import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Bluezoid',
  description: 'How Bluezoid collects, uses, and protects your personal information.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="1 June 2025"
      sections={[
        {
          heading: '1. Information We Collect',
          body: [
            'Name and email address — collected at checkout to deliver your purchase and send the download link.',
            'Phone number — collected at checkout as required by Cashfree payment gateway.',
            'IP address and browser user-agent — collected automatically for fraud prevention and security logging.',
            'Payment details — processed directly by Cashfree. We never see or store your card or UPI credentials.',
          ],
        },
        {
          heading: '2. How We Use Your Information',
          body: [
            'To deliver the purchased eBook to your email address.',
            'To generate and send a one-time secure download link.',
            'To communicate order confirmations and support responses.',
            'To detect and prevent fraud and abuse.',
            'We do not sell, rent, or share your personal data with third parties for marketing purposes.',
          ],
        },
        {
          heading: '3. Third-Party Services',
          body: [
            'Cashfree Payments — payment processing. Governed by Cashfree\'s privacy policy.',
            'Brevo (Sendinblue) — transactional email delivery.',
            'Cloudflare R2 — secure file storage for eBook delivery.',
            'MongoDB Atlas — database hosting on servers in the cloud.',
          ],
        },
        {
          heading: '4. Data Retention',
          body: 'We retain your order information (name, email, order ID) for accounting and support purposes for a minimum of 3 years as required under Indian tax law. You may request deletion of your personal data for non-transactional records by emailing support@bluezoid.in.',
        },
        {
          heading: '5. Cookies',
          body: 'We do not use tracking cookies or third-party analytics. The only cookies present are those set by Next.js for session management and Cashfree for payment flow.',
        },
        {
          heading: '6. Security',
          body: 'All data in transit is encrypted via TLS/HTTPS. Download links are one-time use, expire in 10 minutes, and are delivered only to the email provided at checkout. Payment webhooks are verified using HMAC-SHA256 signatures.',
        },
        {
          heading: '7. Your Rights',
          body: [
            'Access: Request a copy of the personal data we hold about you.',
            'Correction: Ask us to correct inaccurate data.',
            'Deletion: Request deletion of personal data not required for legal or accounting purposes.',
            'To exercise these rights, email support@bluezoid.in with your order ID.',
          ],
        },
        {
          heading: '8. Changes to This Policy',
          body: 'We may update this policy from time to time. The effective date at the top of this page will be updated. Continued use of our services after changes constitutes acceptance.',
        },
        {
          heading: '9. Contact',
          body: 'Bluezoid · support@bluezoid.in · India',
        },
      ]}
    />
  );
}
