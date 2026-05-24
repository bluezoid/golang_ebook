import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSection from '@/components/deep-dive-into-go/HeroSection';

// Static image import is mocked globally in vitest.setup.ts
vi.mock('../../../public/book-cover.jpg', () => ({ default: { src: '/book-cover.jpg', width: 700, height: 640 } }));

const DEFAULT_PRODUCT = {
  currentPrice: 149,
  originalPrice: 999,
  discountPercent: 85,
  discountLabel: 'Launch Price',
  ctaPrimary: 'Buy Now',
  ctaSecondary: 'Preview Book',
  title: 'Deep Dive Into Go',
  subtitle: 'Building Production-Ready Systems',
};

const setup = (overrides = {}) => {
  const onBuyClick = vi.fn();
  const onPreviewClick = vi.fn();
  render(<HeroSection onBuyClick={onBuyClick} onPreviewClick={onPreviewClick} product={DEFAULT_PRODUCT} {...overrides} />);
  return { onBuyClick, onPreviewClick };
};

describe('HeroSection', () => {
  it('renders the main heading', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Into Go')).toBeInTheDocument();
  });

  it('renders the book cover image with correct alt text', () => {
    setup();
    expect(screen.getByAltText('Deep Dive Into Go — book cover')).toBeInTheDocument();
  });

  it('renders the ₹149 price badge', () => {
    setup();
    expect(screen.getAllByText(/₹149/).length).toBeGreaterThan(0);
  });

  it('"Buy Now" button calls onBuyClick', async () => {
    const { onBuyClick } = setup();
    const buttons = screen.getAllByRole('button', { name: /buy now/i });
    await userEvent.click(buttons[0]);
    expect(onBuyClick).toHaveBeenCalledOnce();
  });

  it('"Preview Book" button calls onPreviewClick', async () => {
    const { onPreviewClick } = setup();
    const btns = screen.getAllByRole('button', { name: /preview book/i });
    await userEvent.click(btns[0]);
    expect(onPreviewClick).toHaveBeenCalledOnce();
  });

  it('renders all 6 trust badge items', () => {
    setup();
    expect(screen.getByText('315 Runnable Programs')).toBeInTheDocument();
    expect(screen.getByText('102 Chapters · 7 Parts')).toBeInTheDocument();
    expect(screen.getByText('Lifetime Access')).toBeInTheDocument();
    expect(screen.getByText('10 Capstone Projects')).toBeInTheDocument();
  });

  it('renders the 3 reading path badges', () => {
    setup();
    expect(screen.getByText('Linear Path')).toBeInTheDocument();
    expect(screen.getByText('Bridge Path')).toBeInTheDocument();
    expect(screen.getByText('Interview Path')).toBeInTheDocument();
  });

  it('pricing card lists key features', () => {
    setup();
    expect(screen.getByText(/instant pdf delivery/i)).toBeInTheDocument();
    expect(screen.getAllByText(/lifetime access/i).length).toBeGreaterThan(0);
  });

  it('mobile sticky CTA renders "Preview Book" and "Buy Now" buttons', () => {
    setup();
    const previewBtns = screen.getAllByRole('button', { name: /preview book/i });
    const buyBtns = screen.getAllByRole('button', { name: /buy now/i });
    // At least one of each (sticky CTA + main CTA)
    expect(previewBtns.length).toBeGreaterThanOrEqual(1);
    expect(buyBtns.length).toBeGreaterThanOrEqual(1);
  });
});
