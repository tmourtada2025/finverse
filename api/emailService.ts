import type { VercelRequest, VercelResponse } from '@vercel/node'

interface SendPurchaseEmailParams {
  to: string
  courseTitle: string
}

export async function sendPurchaseConfirmationEmail({ to, courseTitle }: SendPurchaseEmailParams) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FinVerse <noreply@finverse.world>',
      to,
      subject: `You're enrolled in ${courseTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0d0d0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:800;color:#f0f0f5;letter-spacing:-0.03em;">Fin<span style="font-weight:300;">Verse</span></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#18181d;border:1px solid #1e1e24;border-radius:12px;padding:36px;">

              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b6b80;">Payment confirmed</p>

              <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#f0f0f5;line-height:1.3;">
                You're enrolled in<br>${courseTitle}
              </h1>

              <p style="margin:0 0 28px;font-size:15px;color:#9b9baa;line-height:1.7;">
                Your purchase was successful. To access your course, create your FinVerse account using the same email address you used at checkout.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#ffffff;border-radius:8px;">
                    <a href="https://finverse.world/login"
                       style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#0d0d0f;text-decoration:none;border-radius:8px;">
                      Create your account →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e24;padding-top:24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b80;">How to get started</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ['1', 'Click the button above to go to FinVerse'],
                        ['2', 'Click "Create one" and sign up with this email address'],
                        ['3', 'Confirm your email — your course will be waiting'],
                      ].map(([num, text]) => `
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:24px;height:24px;background-color:#1e1e24;border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:#6b6b80;">${num}</td>
                              <td style="padding-left:12px;font-size:14px;color:#9b9baa;line-height:1.6;">${text}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join('')}
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#3a3a48;line-height:1.6;">
                This email was sent to ${to} because you purchased a course on FinVerse.<br>
                If you didn't make this purchase, please contact us at <a href="mailto:support@finverse.world" style="color:#3a3a48;">support@finverse.world</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('Resend error:', error)
    throw new Error(`Failed to send email: ${error}`)
  }

  return res.json()
}
