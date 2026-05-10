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

// Simple email regex — good enough, not perfect
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function welcomeEmailHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Welcome to FinVerse</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f5;font-family:Georgia,serif;color:#222;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:48px 48px 24px 48px;">
              <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#111;margin:0 0 8px 0;line-height:1.2;">
                Welcome to FinVerse.
              </h1>
              <p style="font-family:Georgia,serif;font-size:14px;color:#888;margin:0 0 32px 0;letter-spacing:0.05em;text-transform:uppercase;">
                The market reveals who you are
              </p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#222;margin:0 0 16px 0;">
                You just signed up because you're looking for something more rigorous than what passes for trading education.
              </p>
              <p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#222;margin:0 0 32px 0;">
                Here are three things worth your time right now:
              </p>

              <div style="margin:0 0 28px 0;padding:20px;background:#fafaf8;border-left:3px solid #1e3a5f;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;color:#111;margin:0 0 6px 0;">
                  1. Read the FinVerse Framework
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;">
                  The structural philosophy behind every analysis, course, and journal article on FinVerse.
                </p>
                <a href="https://finverse.world/framework" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#1e3a5f;text-decoration:none;font-weight:600;">
                  Read it &rarr;
                </a>
              </div>

              <div style="margin:0 0 28px 0;padding:20px;background:#fafaf8;border-left:3px solid #1e3a5f;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;color:#111;margin:0 0 6px 0;">
                  2. Preview the SMC course
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;">
                  Our complete guide to Smart Money Concepts. The first lesson of each module is free to preview.
                </p>
                <a href="https://finverse.world/courses/smc-complete-guide" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#1e3a5f;text-decoration:none;font-weight:600;">
                  Preview it &rarr;
                </a>
              </div>

              <div style="margin:0 0 32px 0;padding:20px;background:#fafaf8;border-left:3px solid #1e3a5f;">
                <p style="font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;color:#111;margin:0 0 6px 0;">
                  3. Follow the Journal
                </p>
                <p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;">
                  Weekly analysis on market structure, macro context, and the psychology that breaks most traders.
                </p>
                <a href="https://finverse.world/blog" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#1e3a5f;text-decoration:none;font-weight:600;">
                  Read recent articles &rarr;
                </a>
              </div>

              <p style="font-family:Inter,Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;margin:0 0 12px 0;">
                I'll send you something worth reading roughly once a week. No fluff, no FOMO, no fake urgency. If it's not useful, the unsubscribe link works.
              </p>
              <p style="font-family:Georgia,serif;font-size:15px;color:#222;font-style:italic;margin:0;">
                &mdash; Toufic
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px 32px 48px;border-top:1px solid #eee;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#888;line-height:1.6;margin:0;">
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

You just signed up because you're looking for something more rigorous than what passes for trading education.

Here are three things worth your time right now:

1. Read the FinVerse Framework
   The structural philosophy behind every analysis, course, and journal article on FinVerse.
   https://finverse.world/framework

2. Preview the SMC course
   Our complete guide to Smart Money Concepts. The first lesson of each module is free to preview.
   https://finverse.world/courses/smc-complete-guide

3. Follow the Journal
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
  // CORS for same-origin should not be needed but be defensive
  res.setHeader("Access-Control-Allow-Origin", "https://finverse.world");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse and validate input
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const email = (body?.email || "").trim().toLowerCase();
  const source = (body?.source || "unknown").slice(0, 100);

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Length sanity
  if (email.length > 254) {
    return res.status(400).json({ error: "Email too long" });
  }

  // Honeypot — body.website should be empty (form has hidden field)
  if (body?.website) {
    // Silent success for bots
    return res.status(200).json({ success: true });
  }

  // Verify env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[subscribe] Missing Supabase env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Insert subscriber (or fetch existing)
  let subscriberId: string | null = null;
  let isNewSubscriber = false;

  // Try insert first
  const { data: insertData, error: insertError } = await supabase
    .from("subscribers")
    .insert({ email, source })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate email — fetch existing record
      const { data: existing } = await supabase
        .from("subscribers")
        .select("id, welcome_sent_at, unsubscribed_at")
        .eq("email", email)
        .single();

      if (existing) {
        // If they previously unsubscribed, don't re-engage
        if (existing.unsubscribed_at) {
          // Silent success — don't expose unsubscription state
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

  // Send welcome email — only for new subscribers OR existing without welcome_sent_at
  if (isNewSubscriber) {
    const sent = await sendWelcomeEmail(email);
    if (sent && subscriberId) {
      // Best-effort update of welcome_sent_at — don't fail the request if this fails
      await supabase
        .from("subscribers")
        .update({ welcome_sent_at: new Date().toISOString() })
        .eq("id", subscriberId);
    }
  }

  // Always return success to client (don't expose state)
  return res.status(200).json({ success: true });
}
