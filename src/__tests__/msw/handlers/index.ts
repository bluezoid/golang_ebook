import { defaultCashfreeHandlers } from './cashfree.handlers';
import { defaultBrevoHandlers } from './brevo.handlers';

export const defaultHandlers = [
  ...defaultCashfreeHandlers,
  ...defaultBrevoHandlers,
];

export * from './cashfree.handlers';
export * from './brevo.handlers';
