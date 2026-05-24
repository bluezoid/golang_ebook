import { http, HttpResponse } from 'msw';

const BREVO_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';

export const brevoSendEmailHandler = http.post(
  BREVO_EMAIL_URL,
  () => HttpResponse.json({ messageId: 'mock-message-id-12345' }, { status: 201 })
);

export const brevoSendEmailFailHandler = http.post(
  BREVO_EMAIL_URL,
  () => HttpResponse.json({ message: 'Invalid API key', code: 'unauthorized' }, { status: 401 })
);

export const defaultBrevoHandlers = [brevoSendEmailHandler];
