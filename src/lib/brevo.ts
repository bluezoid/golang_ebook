import { BrevoClient } from '@getbrevo/brevo';

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

interface SendEbookEmailParams {
  toEmail: string;
  toName: string;
  downloadUrl: string;
  orderId: string;
}

export async function sendEbookDeliveryEmail({
  toEmail,
  toName,
  downloadUrl,
  orderId,
}: SendEbookEmailParams): Promise<void> {
  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL!,
      name: process.env.BREVO_SENDER_NAME!,
    },
    to: [{ email: toEmail, name: toName }],
    subject: '🎉 Your Deep Dive Into Go eBook is ready!',
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your eBook is Ready</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#3b82f6,#6366f1,#3b82f6);"></td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
                <img src="https://bluezoid.in/email-logo.png" alt="Bluezoid" width="32" height="32" style="width:32px;height:32px;border-radius:50%;display:block;" />
                <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.01em;">Bluezoid</span>
              </div>
              <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:100px;padding:6px 14px;margin-bottom:28px;">
                <span style="width:6px;height:6px;background:#60a5fa;border-radius:50%;display:inline-block;"></span>
                <span style="color:#60a5fa;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Order Confirmed</span>
              </div>

              <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">
                Your eBook is ready, ${toName.split(' ')[0]}! 🚀
              </h1>
              <p style="margin:0 0 32px;font-size:16px;color:#a1a1aa;line-height:1.6;">
                Thank you for purchasing <strong style="color:#e4e4e7;">Deep Dive Into Go</strong>. Your download link is ready — it expires in <strong style="color:#f59e0b;">10 minutes</strong> for security.
              </p>

              <div style="background:#09090b;border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;margin-bottom:32px;">
                <div style="color:#ffffff;font-weight:600;font-size:15px;margin-bottom:4px;">Deep Dive Into Go</div>
                <div style="color:#71717a;font-size:13px;">102 chapters · 10 capstone projects · 315 runnable programs</div>
                <div style="color:#71717a;font-size:13px;margin-top:2px;">First Edition 2025 · Go 1.22+</div>
              </div>

              <div style="text-align:center;margin-bottom:32px;">
                <a href="${downloadUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 40px;border-radius:12px;box-shadow:0 4px 24px rgba(37,99,235,0.3);">
                  Download Your eBook →
                </a>
                <p style="margin:12px 0 0;font-size:12px;color:#52525b;">Link expires in 10 minutes · One-time use</p>
              </div>

              <div style="background:#09090b;border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Order ID: <span style="color:#a1a1aa;font-family:monospace;">${orderId}</span></p>
                <p style="margin:0;font-size:13px;color:#71717a;">Need help? Reply to this email or write to <a href="mailto:support@bluezoid.in" style="color:#3b82f6;text-decoration:none;">support@bluezoid.in</a></p>
              </div>

              <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">
                If the link has expired, reply to this email with your order ID and we'll send a fresh one within a few hours.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:#3f3f46;text-align:center;">
                © 2025 Bluezoid · <a href="https://bluezoid.in" style="color:#52525b;text-decoration:none;">bluezoid.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
