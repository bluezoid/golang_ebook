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
                <img src="data:image/png;base64,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" alt="Bluezoid" width="32" height="32" style="width:32px;height:32px;border-radius:50%;display:block;" />
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
                © 2025 Bluezoid · <a href="https://deepdiveintogo.in" style="color:#52525b;text-decoration:none;">deepdiveintogo.in</a>
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
