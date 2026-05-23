import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Disposable email domain blocklist — common temp mail providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'spam4.me', 'trashmail.com', 'trashmail.me',
  'trashmail.net', 'trashmail.at', 'trashmail.io', 'trashmail.xyz',
  'dispostable.com', 'maildrop.cc', 'mailnull.com', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamhereplease.com', 'mytemp.email',
  'fakeinbox.com', 'temp-mail.org', 'tempinbox.com', 'getnada.com',
  'mailtemp.net', '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'mailexpire.com', 'minutemail.com', 'discard.email', 'tempr.email',
  'throwam.com', 'crapmail.org', 'binkmail.com', 'bobmail.info',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

export const checkoutSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens and apostrophes allowed'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens and apostrophes allowed'),
  email: z
    .string()
    .email('Enter a valid email address')
    .max(254, 'Email too long')
    .refine((e) => !isDisposableEmail(e), 'Temporary email addresses are not allowed — please use your real email to receive the eBook'),
  phone: z
    .string()
    .min(5, 'Enter a valid phone number')
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      'Enter a valid phone number including country code'
    ),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
