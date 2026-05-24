import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './src/__tests__/msw/server';

// Start MSW before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test to avoid state leaking
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Stop server after all tests
afterAll(() => server.close());

// Set test environment variables
process.env.MONGODB_URI = 'mongodb+srv://test:test@cluster.test.mongodb.net/test';
process.env.CASHFREE_APP_ID = 'TEST_APP_ID';
process.env.CASHFREE_SECRET_KEY = 'TEST_SECRET_KEY';
process.env.CASHFREE_ENV = 'sandbox';
process.env.NEXT_PUBLIC_CASHFREE_ENV = 'sandbox';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.R2_ACCOUNT_ID = 'test-account-id';
process.env.R2_ACCESS_KEY_ID = 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.R2_BUCKET_NAME = 'test-bucket';
process.env.R2_ENDPOINT = 'https://test.r2.cloudflarestorage.com';
process.env.R2_FULL_PDF_KEY = 'ebooks/golang/v1/deep_dive_into_go.pdf';
process.env.R2_SAMPLE_PDF_KEY = 'ebooks/golang/v1/deep_dive_into_go_sample.pdf';
process.env.BREVO_API_KEY = 'test-brevo-key';
process.env.BREVO_SENDER_EMAIL = 'support@bluezoid.in';
process.env.BREVO_SENDER_NAME = 'Bluezoid';

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('order_id=BLZ-TEST123'),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
  redirect: vi.fn(),
}));

// Mock next/image globally — static import images in jsdom
vi.mock('next/image', async () => {
  const React = await import('react');
  return {
    default: ({ src, alt, ...props }: { src: string | { src: string }; alt: string; [key: string]: unknown }) => {
      const imgSrc = typeof src === 'object' && src !== null ? (src as { src: string }).src : src;
      const { loading, fetchPriority, preload, fill, quality, placeholder, blurDataURL, unoptimized, onLoad, onError, ...rest } = props as Record<string, unknown>;
      void loading; void fetchPriority; void preload; void fill; void quality; void placeholder; void blurDataURL; void unoptimized; void onLoad; void onError;
      return React.createElement('img', { src: imgSrc as string, alt, ...rest });
    },
  };
});

// Mock framer-motion — animations do not work in jsdom
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_target, tag: string) =>
      React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }, ref: React.Ref<HTMLElement>) =>
        React.createElement(tag as keyof React.JSX.IntrinsicElements, { ...props, ref }, children)
      ),
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useInView: () => true,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    type: vi.fn(),
    Variants: {},
  };
});

// Mock CSS imports from react-phone-number-input
vi.mock('react-phone-number-input/style.css', () => ({}));
