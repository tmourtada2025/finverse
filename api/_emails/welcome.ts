/**
 * Email 0 — Welcome (sent immediately on signup)
 *
 * Promises and links to the lead magnet PDF.
 * Sets expectation for the 5-letter sequence over 4 weeks.
 *
 * NOTE: Update LEAD_MAGNET_URL once the PDF is hosted.
 */

const LEAD_MAGNET_URL = "https://finverse.world/downloads/5-smc-patterns.pdf";

export function welcomeEmail() {
  return {
    subject: "Your guide is here — 5 Smart Money Patterns",
    html: html(),
    text: text(),
  };
}

function html(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Your guide is here</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F2;font-family:Georgia,serif;color:#111318;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:48px 48px 24px 48px;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 8px 0;letter-spacing:0.12em;text-transform:uppercase;font-weight:500;">FinVerse</p>
              <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:32px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.1;letter-spacing:-0.01em;">Your guide is here.</h1>
              <p style="font-family:Georgia,serif;font-size:14px;color:#9EA7B3;margin:0 0 32px 0;font-style:italic;">Five patterns. Once you see them, you can't unsee them.</p>

              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 16px 0;">Welcome to FinVerse. Your guide is linked below — read it on whatever device you prefer.</p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 32px 0;">Inside, five patterns that institutions use every trading day to extract liquidity from retail traders. Once you can see them, you stop being on the wrong side of the move.</p>

              <div style="text-align:center;margin:0 0 36px 0;">
                <a href="${LEAD_MAGNET_URL}" style="display:inline-block;background:#3E5C76;color:#F4F4F2;padding:14px 32px;text-decoration:none;border-radius:6px;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.02em;">Download the guide</a>
              </div>

              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 32px 0;">Over the next four weeks, I'll send you five short letters. Each one builds on what you read in the guide and goes deeper into how these patterns work in live markets. The first arrives in three days.</p>

              <p style="font-family:Inter,Arial,sans-serif;font-size:15px;color:#111318;line-height:1.7;margin:0 0 12px 0;">If you want to start exploring before then, here are two places to begin:</p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#111318;line-height:1.7;margin:0 0 6px 0;">— <a href="https://finverse.world/framework" style="color:#3E5C76;text-decoration:none;font-weight:600;">The Framework</a> (the structural philosophy)</p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#111318;line-height:1.7;margin:0 0 32px 0;">— <a href="https://finverse.world/blog" style="color:#3E5C76;text-decoration:none;font-weight:600;">The Journal</a> (weekly analysis on structure, macro, and trader psychology)</p>

              <p style="font-family:Georgia,serif;font-size:16px;color:#111318;font-style:italic;margin:0;">&mdash; Toufic</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px 32px 48px;border-top:1px solid #F4F4F2;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;line-height:1.6;margin:0;letter-spacing:0.02em;">You received this because you signed up at finverse.world.<br>FinVerse &middot; The Trader Alchemist</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function text(): string {
  return `Your guide is here.
Five patterns. Once you see them, you can't unsee them.

Welcome to FinVerse. Your guide is linked below — read it on whatever device you prefer.

Inside, five patterns that institutions use every trading day to extract liquidity from retail traders. Once you can see them, you stop being on the wrong side of the move.

Download the guide:
${LEAD_MAGNET_URL}

Over the next four weeks, I'll send you five short letters. Each one builds on what you read in the guide and goes deeper into how these patterns work in live markets. The first arrives in three days.

If you want to start exploring before then, here are two places to begin:

— The Framework (the structural philosophy)
  https://finverse.world/framework

— The Journal (weekly analysis on structure, macro, and trader psychology)
  https://finverse.world/blog

— Toufic

---
You received this because you signed up at finverse.world.
FinVerse · The Trader Alchemist`;
}
