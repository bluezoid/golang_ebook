import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/lib/**',
        'src/app/api/**',
        'src/components/**',
        'src/app/products/**',
      ],
      exclude: [
        '**/*.d.ts',
        '**/__mocks__/**',
        'node_modules',
        // Pure render-only components — covered by E2E, no unit test needed
        'src/components/deep-dive-into-go/AudienceSection.tsx',
        'src/components/deep-dive-into-go/CTASection.tsx',
        'src/components/deep-dive-into-go/EbookFeatures.tsx',
        'src/components/deep-dive-into-go/EbookPreview.tsx',
        'src/components/deep-dive-into-go/Footer.tsx',
        'src/components/deep-dive-into-go/PDFPreview.tsx',
        'src/components/deep-dive-into-go/PricingCard.tsx',
        'src/components/deep-dive-into-go/Testimonials.tsx',
        'src/components/deep-dive-into-go/DeepDiveIntoGoPage.tsx',
        'src/app/products/deep-dive-into-go/page.tsx',
        // MongoDB client — singleton infrastructure, not unit-testable without real DB
        'src/lib/mongodb.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    css: {
      modules: { classNameStrategy: 'non-scoped' },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
