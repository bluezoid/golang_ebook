import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendTransacEmail = vi.fn();

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn().mockImplementation(() => ({
    transactionalEmails: {
      sendTransacEmail: mockSendTransacEmail,
    },
  })),
}));

const { sendEbookDeliveryEmail } = await import('@/lib/brevo');

const BASE_PARAMS = {
  toEmail: 'customer@gmail.com',
  toName: 'Arjun Sharma',
  downloadUrl: 'https://test.r2.cloudflarestorage.com/signed-url-abc',
  orderId: 'BLZ-TEST123456',
};

describe('sendEbookDeliveryEmail', () => {
  beforeEach(() => {
    mockSendTransacEmail.mockReset();
    mockSendTransacEmail.mockResolvedValue({ messageId: 'mock-id' });
  });

  it('calls sendTransacEmail once', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);
    expect(mockSendTransacEmail).toHaveBeenCalledOnce();
  });

  it('sends to the correct recipient email and name', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.to).toEqual([{ email: BASE_PARAMS.toEmail, name: BASE_PARAMS.toName }]);
  });

  it('uses sender from env vars', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.sender.email).toBe(process.env.BREVO_SENDER_EMAIL);
    expect(arg.sender.name).toBe(process.env.BREVO_SENDER_NAME);
  });

  it('subject contains the book title and celebration emoji', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.subject).toContain('Deep Dive Into Go');
    expect(arg.subject).toContain('🎉');
  });

  it('htmlContent includes the recipient first name', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain('Arjun'); // first name extracted with split(' ')[0]
  });

  it('htmlContent includes the downloadUrl', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain(BASE_PARAMS.downloadUrl);
  });

  it('htmlContent includes the orderId', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain(BASE_PARAMS.orderId);
  });

  it('htmlContent includes the 15-minute expiry warning', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain('15 minutes');
  });

  it('htmlContent includes support email', async () => {
    await sendEbookDeliveryEmail(BASE_PARAMS);

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain('support@bluezoid.in');
  });

  it('propagates error when sendTransacEmail throws', async () => {
    mockSendTransacEmail.mockRejectedValue(new Error('Brevo rate limit'));

    await expect(sendEbookDeliveryEmail(BASE_PARAMS)).rejects.toThrow('Brevo rate limit');
  });

  it('uses only the first name when toName has multiple parts', async () => {
    await sendEbookDeliveryEmail({ ...BASE_PARAMS, toName: 'Ravi Kumar Singh' });

    const arg = mockSendTransacEmail.mock.calls[0][0];
    expect(arg.htmlContent).toContain('Ravi');
    expect(arg.htmlContent).not.toContain('Ravi Kumar Singh');
  });
});
