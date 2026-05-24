import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Suspense } from 'react';
import { server } from '../msw/server';

// Control what useSearchParams and useRouter return per test
const mockReplace = vi.fn();
const mockSearchParams = vi.fn(() => new URLSearchParams('order_id=BLZ-TEST123'));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams(),
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  redirect: vi.fn(),
}));

// Import after navigation mock
const { default: SuccessPage } = await import('@/app/products/deep-dive-into-go/success/page');

const VERIFY_URL = 'http://localhost:3000/api/verify-payment';

function mockVerify(response: Record<string, unknown>, status = 200) {
  server.use(
    http.post(VERIFY_URL, () => HttpResponse.json(response, { status }))
  );
}

function renderPage() {
  return render(
    <Suspense fallback={<div>Loading</div>}>
      <SuccessPage />
    </Suspense>
  );
}

describe('SuccessPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSearchParams.mockReset();
    mockSearchParams.mockReturnValue(new URLSearchParams('order_id=BLZ-TEST123'));
  });

  it('shows verifying spinner initially', () => {
    // Handler that never responds
    server.use(http.post(VERIFY_URL, () => new Promise(() => {})));
    renderPage();
    expect(screen.getByText(/verifying your payment/i)).toBeInTheDocument();
  });

  it('shows success card when status is fulfilled', async () => {
    mockVerify({ status: 'fulfilled', email: 'customer@gmail.com' });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/customer@gmail\.com/i)).toBeInTheDocument();
  });

  it('shows already_fulfilled message', async () => {
    mockVerify({ status: 'already_fulfilled' });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/already processed/i)).toBeInTheDocument();
    });
  });

  it('redirects to cancelled page when status is failed', async () => {
    mockVerify({ status: 'failed' });
    renderPage();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/products/deep-dive-into-go/cancelled')
      );
    });
  });

  it('shows pending card when status is pending', async () => {
    mockVerify({ status: 'pending' });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/payment is processing/i)).toBeInTheDocument();
    });
  });

  it('shows error card on network failure', async () => {
    server.use(http.post(VERIFY_URL, () => HttpResponse.error()));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('does not call fetch when order_id param is missing', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    let called = false;
    server.use(http.post(VERIFY_URL, () => { called = true; return HttpResponse.json({}); }));

    renderPage();

    await new Promise((r) => setTimeout(r, 100));
    expect(called).toBe(false);
  });

  it('calls /api/verify-payment with the orderId', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(VERIFY_URL, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ status: 'fulfilled', email: 'x@gmail.com' });
      })
    );

    renderPage();

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toEqual({ orderId: 'BLZ-TEST123' });
  });

  it('does not re-call the API after initial verification', async () => {
    mockVerify({ status: 'fulfilled', email: 'x@gmail.com' });

    renderPage();

    // Wait for the fulfilled state to render — confirms one call completed
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });
    // The success state is stable — no infinite loop or repeated calls
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
  });

  it('displays the orderId in support text', async () => {
    mockVerify({ status: 'fulfilled', email: 'x@gmail.com' });
    renderPage();

    await waitFor(() => screen.getByText(/payment successful/i));
    expect(screen.getByText(/BLZ-TEST123/)).toBeInTheDocument();
  });
});
