import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CancelledPage from '@/app/products/deep-dive-into-go/cancelled/page';

describe('CancelledPage', () => {
  it('renders "Payment Cancelled" heading', () => {
    render(<CancelledPage />);
    expect(screen.getByRole('heading', { name: /payment cancelled/i })).toBeInTheDocument();
  });

  it('assures user no charge was made', () => {
    render(<CancelledPage />);
    expect(screen.getByText(/no charge was made/i)).toBeInTheDocument();
  });

  it('"Back to page" link points to the product page', () => {
    render(<CancelledPage />);
    const link = screen.getByRole('link', { name: /back to page/i });
    expect(link).toHaveAttribute('href', '/products/deep-dive-into-go');
  });

  it('"Try again" link points to the pricing section', () => {
    render(<CancelledPage />);
    const link = screen.getByRole('link', { name: /try again/i });
    expect(link).toHaveAttribute('href', '/products/deep-dive-into-go#pricing');
  });

  it('support email link is present and correct', () => {
    render(<CancelledPage />);
    const emailLink = screen.getByRole('link', { name: /support@bluezoid\.in/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:support@bluezoid.in');
  });

  it('shows the product name and launch price text', () => {
    render(<CancelledPage />);
    expect(screen.getByText(/deep dive into go/i)).toBeInTheDocument();
    expect(screen.getByText(/still available at launch price/i)).toBeInTheDocument();
  });
});
