import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/subscribe
 *
 * Body: { email: string, source?: string }
 *
 * Behavior:
 * - Validates email format
 * - Inserts new subscriber to Supabase (idempotent on email)
 * - Sends welcome email via Resend
 * - Returns 200 even for duplicates (don't expose subscription state)
 *
 * Why service role:
 * - We need to bypass RLS to mark welcome_sent_at after the Resend call
 * - Service role key is server-side only (Vercel env, never exposed to client)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Toufic at FinVerse <journal@finverse.world>";
const REPLY_TO = "support@finverse.world";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function welcomeEmailHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Welcome to FinVerse</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F2;font-family:Georgia,serif;color:#111318;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:48px 48px 24px 48px;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 8px 0;letter-spacing:0.12em;text-transform:uppercase;font-weight:500;">
                FinVerse
              </p>
              <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:32px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.1;letter-spacing:-0.01em;">
                Welcome.
              </h1>
              <p style="font-family:Georgia,serif;font-size:14px;color:#9EA7B3;margin:0 0 32px 0;font-style:italic;">
                The market reveals who you are.
              </p>

              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 16px 0;">
                You signed up because you're looking for something more rigorous than what passes for trading education.
              </p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 32px 0;">
                Three things worth your time right now:
              </p>

              <div style="margin:0 0 24px 0;padding:20px 24px;background:#F4F4F2;border-left:3px solid #3E5C76;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 6px 0;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">
                  01
                </p>
                <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.3;">
                  Read the Framework
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#3E5C76;line-height:1.6;margin:0 0 12px 0;">
                  The structural philosophy behind every analysis, course, and journal article on FinVerse.
                </p>
                <a href="https://finverse.world/framework" style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#3E5C76;text-decoration:none;font-weight:600;letter-spacing:0.02em;">
                  Read it &rarr;
                </a>
              </div>

              <div style="margin:0 0 24px 0;padding:20px 24px;background:#F4F4F2;border-left:3px solid #3E5C76;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 6px 0;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">
                  02
                </p>
                <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.3;">
                  Preview the SMC course
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#3E5C76;line-height:1.6;margin:0 0 12px 0;">
                  Our complete guide to Smart Money Concepts. The first lesson of each module is free to preview.
                </p>
                <a href="https://finverse.world/courses/smc-complete-guide" style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#3E5C76;text-decoration:none;font-weight:600;letter-spacing:0.02em;">
                  Preview it &rarr;
                </a>
              </div>

              <div style="margin:0 0 36px 0;padding:20px 24px;background:#F4F4F2;border-left:3px solid #3E5C76;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 6px 0;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">
                  03
                </p>
                <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.3;">
                  Follow the Journal
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#3E5C76;line-height:1.6;margin:0 0 12px 0;">
                  Weekly analysis on market structure, macro context, and the psychology that breaks most traders.
                </p>
                <a href="https://finverse.world/blog" style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#3E5C76;text-decoration:none;font-weight:600;letter-spacing:0.02em;">
                  Read recent articles &rarr;
                </a>
              </div>

              <p style="font-family:Inter,Arial,sans-serif;font-size:15px;color:#111318;line-height:1.7;margin:0 0 16px 0;">
                I'll send you something worth reading roughly once a week. No fluff, no FOMO, no fake urgency. If it's not useful, the unsubscribe link works.
              </p>
              <p style="font-family:Georgia,serif;font-size:16px;color:#111318;font-style:italic;margin:0;">
                &mdash; Toufic
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px 32px 48px;border-top:1px solid #F4F4F2;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;line-height:1.6;margin:0;letter-spacing:0.02em;">
                You received this because you signed up at finverse.world.<br>
                FinVerse &middot; The Trader Alchemist
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function welcomeEmailText(): string {
  return `Welcome to FinVerse.
The market reveals who you are.

You signed up because you're looking for something more rigorous than what passes for trading education.

Three things worth your time right now:

01. Read the Framework
    The structural philosophy behind every analysis, course, and journal article on FinVerse.
    https://finverse.world/framework

02. Preview the SMC course
    Our complete guide to Smart Money Concepts. The first lesson of each module is free to preview.
    https://finverse.world/courses/smc-complete-guide

03. Follow the Journal
    Weekly analysis on market structure, macro context, and the psychology that breaks most traders.
    https://finverse.world/blog

I'll send you something worth reading roughly once a week. No fluff, no FOMO, no fake urgency. If it's not useful, the unsubscribe link works.

— Toufic

---
You received this because you signed up at finverse.world.
FinVerse · The Trader Alchemist`;
}

async function sendWelcomeEmail(toEmail: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[subscribe] RESEND_API_KEY missing — skipping welcome email");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        reply_to: REPLY_TO,
        subject: "Welcome to FinVerse",
        html: welcomeEmailHtml(),
        text: welcomeEmailText(),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[subscribe] Resend error:", response.status, errBody);
      return false;
    }

    const data = await response.json();
    console.log("[subscribe] welcome email sent, id:", data.id);
    return true;
  } catch (err) {
    console.error("[subscribe] Resend exception:", err);
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "https://finverse.world");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const email = (body?.email || "").trim().toLowerCase();
  const source = (body?.source || "unknown").slice(0, 100);

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (email.length > 254) {
    return res.status(400).json({ error: "Email too long" });
  }

  // Honeypot — body.website should be empty (form has hidden field)
  if (body?.website) {
    return res.status(200).json({ success: true });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[subscribe] Missing Supabase env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let subscriberId: string | null = null;
  let isNewSubscriber = false;

  const { data: insertData, error: insertError } = await supabase
    .from("subscribers")
    .insert({ email, source })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate email
      const { data: existing } = await supabase
        .from("subscribers")
        .select("id, welcome_sent_at, unsubscribed_at")
        .eq("email", email)
        .single();

      if (existing) {
        if (existing.unsubscribed_at) {
          return res.status(200).json({ success: true });
        }
        subscriberId = existing.id;
        isNewSubscriber = false;
      } else {
        console.error("[subscribe] Could not find existing subscriber after dupe");
        return res.status(500).json({ error: "Internal error" });
      }
    } else {
      console.error("[subscribe] Insert error:", insertError);
      return res.status(500).json({ error: "Could not save subscription" });
    }
  } else {
    subscriberId = insertData.id;
    isNewSubscriber = true;
  }

  if (isNewSubscriber) {
    const sent = await sendWelcomeEmail(email);
    if (sent && subscriberId) {
      await supabase
        .from("subscribers")
        .update({ welcome_sent_at: new Date().toISOString() })
        .eq("id", subscriberId);
    }
  }

  return res.status(200).json({ success: true });
}
