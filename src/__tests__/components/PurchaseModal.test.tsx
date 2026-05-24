import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../msw/server';
import PurchaseModal from '@/components/deep-dive-into-go/PurchaseModal';

vi.mock('../../../public/book-cover.jpg', () => ({ default: { src: '/book-cover.jpg', width: 700, height: 640 } }));

// Make libphonenumber-js always validate — we test form submission, not phone format
vi.mock('libphonenumber-js', () => ({
  isValidPhoneNumber: (val: string) => val.length >= 5,
  parsePhoneNumber: (val: string) => ({ number: val }),
}));

const mockCheckout = vi.fn();
vi.mock('@cashfreepayments/cashfree-js', () => ({
  load: vi.fn().mockResolvedValue({ checkout: mockCheckout }),
  default: { load: vi.fn().mockResolvedValue({ checkout: mockCheckout }) },
}));

// Mock react-phone-number-input so the phone field renders a simple <input>.
// The Controller passes onChange(value: string) — our input calls it directly.
vi.mock('react-phone-number-input', async () => {
  const React = await import('react');
  const PhoneInput = React.forwardRef(function PhoneInput(
    { onChange, value, id, className }: { onChange: (v: string) => void; value: string; id?: string; className?: string },
    ref: React.Ref<HTMLInputElement>
  ) {
    return React.createElement('input', {
      ref,
      id,
      className,
      type: 'tel',
      // Controlled: reflect the form value
      value: value ?? '',
      // react-hook-form Controller calls onChange(value), not onChange(event)
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      'data-testid': 'phone-input',
    });
  });
  return {
    default: PhoneInput,
    isValidPhoneNumber: (val: string) => val.length >= 5,
  };
});

const VALID_FORM = {
  firstName: 'Arjun',
  lastName: 'Sharma',
  email: 'arjun@gmail.com',
};

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

function setup(open = true) {
  const onClose = vi.fn();
  render(<PurchaseModal open={open} onClose={onClose} product={DEFAULT_PRODUCT} />);
  return { onClose };
}

describe('PurchaseModal — render states', () => {
  it('renders nothing when open=false', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with correct ARIA attributes when open=true', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('renders "Complete Purchase" title', () => {
    setup();
    expect(screen.getByText(/complete purchase/i)).toBeInTheDocument();
  });

  it('shows product name and price in summary', () => {
    setup();
    expect(screen.getAllByText(/deep dive into go/i).length).toBeGreaterThan(0);
    expect(screen.getByText('₹149')).toBeInTheDocument();
  });

  it('renders book cover thumbnail in product summary', () => {
    setup();
    expect(screen.getByAltText('Deep Dive Into Go')).toBeInTheDocument();
  });
});

describe('PurchaseModal — close behavior', () => {
  it('close button (×) calls onClose', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pressing Escape calls onClose', async () => {
    const { onClose } = setup();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('PurchaseModal — form validation', () => {
  beforeEach(() => {
    mockCheckout.mockReset();
  });

  it('shows error messages when submitting empty form', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least/i)).toBeInTheDocument();
    });
  });

  it('shows email error for invalid email', async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/first name/i), 'Arjun');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Sharma');
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail');
    await userEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows disposable email error', async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/first name/i), 'Arjun');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Sharma');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@mailinator.com');
    await userEvent.type(screen.getByTestId('phone-input'), '+919876543210');
    await userEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => {
      expect(screen.getByText(/temporary email/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('PurchaseModal — submission flow', () => {
  beforeEach(() => {
    mockCheckout.mockReset();
  });

  it('calls /api/checkout with correct JSON on valid submit', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post('http://localhost:3000/api/checkout', async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ paymentSessionId: 'session_123', orderId: 'BLZ-ABC', cfOrderId: 'CF-001' });
      })
    );

    setup();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: VALID_FORM.firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: VALID_FORM.lastName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: VALID_FORM.email } });
    fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+919876543210' } });

    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody!.firstName).toBe(VALID_FORM.firstName);
    expect(capturedBody!.email).toBe(VALID_FORM.email);
    expect(capturedBody!.phone).toBe('+919876543210');
  });

  it('shows API error message when checkout fails', async () => {
    server.use(
      http.post('http://localhost:3000/api/checkout', () =>
        HttpResponse.json({ error: 'Failed to create order' }, { status: 400 })
      )
    );

    setup();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: VALID_FORM.firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: VALID_FORM.lastName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: VALID_FORM.email } });
    fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+919876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create order')).toBeInTheDocument();
    });
  });
});
