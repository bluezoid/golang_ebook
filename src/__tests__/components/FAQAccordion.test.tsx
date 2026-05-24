import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQAccordion from '@/components/deep-dive-into-go/FAQAccordion';

describe('FAQAccordion', () => {
  it('renders without crashing', () => {
    const { container } = render(<FAQAccordion />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the section heading', () => {
    render(<FAQAccordion />);
    // Heading is "Common\nquestions" split across elements
    expect(screen.getByText(/common/i)).toBeInTheDocument();
  });

  it('renders at least 6 FAQ question buttons', () => {
    render(<FAQAccordion />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it('answers are initially collapsed (aria-expanded=false)', () => {
    render(<FAQAccordion />);
    const buttons = screen.getAllByRole('button');
    // All FAQ buttons start collapsed
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('clicking a question expands its answer', async () => {
    render(<FAQAccordion />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('clicking the same question again collapses it', async () => {
    render(<FAQAccordion />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    await userEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('support email link is present', () => {
    render(<FAQAccordion />);
    const emailLinks = screen.getAllByRole('link', { name: /support@bluezoid\.in/i });
    expect(emailLinks.length).toBeGreaterThan(0);
  });
});
