import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '@/lib/validators';

const VALID = {
  firstName: 'Arjun',
  lastName: 'Sharma',
  email: 'arjun.sharma@gmail.com',
  phone: '+919876543210',
};

describe('checkoutSchema — happy path', () => {
  it('accepts a fully valid payload', () => {
    const result = checkoutSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('accepts names with hyphens and apostrophes', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: "O'Brien", lastName: 'Smith-Jones' });
    expect(r.success).toBe(true);
  });

  it('accepts emails with plus addressing', () => {
    const r = checkoutSchema.safeParse({ ...VALID, email: 'user+tag@outlook.com' });
    expect(r.success).toBe(true);
  });

  it('accepts international phones beyond India', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '+14155550123' });
    expect(r.success).toBe(true);
  });
});

describe('checkoutSchema — firstName validation', () => {
  it('rejects firstName shorter than 2 chars', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: 'A' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.firstName).toBeDefined();
  });

  it('rejects firstName longer than 50 chars', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: 'A'.repeat(51) });
    expect(r.success).toBe(false);
  });

  it('rejects firstName with digits', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: 'Arjun1' });
    expect(r.success).toBe(false);
  });

  it('rejects firstName with special characters', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: 'Arjun@' });
    expect(r.success).toBe(false);
  });

  it('rejects empty firstName', () => {
    const r = checkoutSchema.safeParse({ ...VALID, firstName: '' });
    expect(r.success).toBe(false);
  });
});

describe('checkoutSchema — lastName validation', () => {
  it('rejects lastName shorter than 2 chars', () => {
    const r = checkoutSchema.safeParse({ ...VALID, lastName: 'S' });
    expect(r.success).toBe(false);
  });

  it('rejects lastName longer than 50 chars', () => {
    const r = checkoutSchema.safeParse({ ...VALID, lastName: 'B'.repeat(51) });
    expect(r.success).toBe(false);
  });

  it('rejects lastName with numbers', () => {
    const r = checkoutSchema.safeParse({ ...VALID, lastName: 'Sharma2' });
    expect(r.success).toBe(false);
  });
});

describe('checkoutSchema — email validation', () => {
  it('rejects malformed email (no @)', () => {
    const r = checkoutSchema.safeParse({ ...VALID, email: 'notanemail' });
    expect(r.success).toBe(false);
  });

  it('rejects malformed email (no TLD)', () => {
    const r = checkoutSchema.safeParse({ ...VALID, email: 'user@nodomain' });
    expect(r.success).toBe(false);
  });

  it('rejects email longer than 254 chars', () => {
    // 245 a's + '@gmail.com' = 255 chars — exceeds the 254 max
    const long = 'a'.repeat(245) + '@gmail.com';
    const r = checkoutSchema.safeParse({ ...VALID, email: long });
    expect(r.success).toBe(false);
  });

  it('rejects empty email', () => {
    const r = checkoutSchema.safeParse({ ...VALID, email: '' });
    expect(r.success).toBe(false);
  });

  // Disposable domain tests
  const disposableDomains = [
    'mailinator.com',
    'guerrillamail.com',
    'yopmail.com',
    '10minutemail.com',
    'tempmail.com',
    'trashmail.com',
    'maildrop.cc',
    'fakeinbox.com',
  ];

  disposableDomains.forEach((domain) => {
    it(`rejects disposable domain: ${domain}`, () => {
      const r = checkoutSchema.safeParse({ ...VALID, email: `user@${domain}` });
      expect(r.success).toBe(false);
      if (!r.success) {
        const msg = r.error.flatten().fieldErrors.email?.[0] ?? '';
        expect(msg).toMatch(/temporary email/i);
      }
    });
  });
});

describe('checkoutSchema — phone validation', () => {
  it('rejects too-short phone', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '123' });
    expect(r.success).toBe(false);
  });

  it('rejects phone without country code', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '9876543210' });
    expect(r.success).toBe(false);
  });

  it('rejects phone with invalid country code', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '+00000000000' });
    expect(r.success).toBe(false);
  });

  it('rejects empty phone', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '' });
    expect(r.success).toBe(false);
  });

  it('rejects phone with letters', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '+91abcdefghij' });
    expect(r.success).toBe(false);
  });
});

describe('checkoutSchema — type inference', () => {
  it('inferred type has all four fields', () => {
    const result = checkoutSchema.safeParse(VALID);
    if (result.success) {
      const data = result.data;
      expect(data).toHaveProperty('firstName');
      expect(data).toHaveProperty('lastName');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('phone');
    }
  });
});
