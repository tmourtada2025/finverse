import type { VercelRequest, VercelResponse } from "@vercel/node";
import { welcomeEmail } from "./_emails/welcome";
import { nurture1 } from "./_emails/nurture1";
import { nurture2 } from "./_emails/nurture2";
import { nurture3 } from "./_emails/nurture3";
import { nurture4 } from "./_emails/nurture4";
import { nurture5 } from "./_emails/nurture5";

/**
 * POST /api/subscribe
 *
 * Body: { email: string, source?: string, website?: string (honeypot) }
 *
 * Behavior:
 * - Validates email format
 * - Inserts new subscriber to Supabase (idempotent on email — silent dedup)
 * - Sends welcome email immediately via Resend
 * - Schedules 5 nurture emails for Day 3, 7, 14, 21, 28 using Resend's scheduled_at
 * - Returns 200 even for duplicates (don't expose subscription state)
 *
 * Why direct REST instead of @supabase/supabase-js:
 * - The library tries to initialize a Realtime WebSocket on createClient()
 * - Node 20 (Vercel default) lacks native WebSocket support
 * - Library crashes immediately. Direct fetch() against Supabase REST API bypasses entirely.
 *
 * Why scheduled_at for nurture sequence:
 * - Resend Broadcasts fire at fixed calendar times, not relative to signup
 * - scheduled_at lets us queue all 5 emails immediately, each with a future send time
 * - Zero manual intervention needed after signup
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Toufic at FinVerse <journal@finverse.world>";
const REPLY_TO = "support@finverse.world";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SupabaseSubscriber {
  id: string;
  welcome_sent_at: string | null;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Nurture sequence schedule.
 * Days are relative to signup time. Each email is sent via Resend scheduled_at.
 */
const NURTURE_SCHEDULE = [
  { day: 3, getEmail: nurture1 },
  { day: 7, getEmail: nurture2 },
  { day: 14, getEmail: nurture3 },
  { day: 21, getEmail: nurture4 },
  { day: 28, getEmail: nurture5 },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[subscribe] Missing Supabase env vars");
    return res.status(500).json({ ok: false, error: "Server misconfigured" });
  }

  // Parse body
  let email: string;
  let source: string;
  let website: string;
  try {
    const body = req.body;
    email = String(body.email || "").trim().toLowerCase();
    source = String(body.source || "unknown").trim();
    website = String(body.website || "").trim();
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid request body" });
  }

  // Honeypot — silently accept and discard if filled
  if (website.length > 0) {
    console.log("[subscribe] Honeypot triggered, silent reject");
    return res.status(200).json({ ok: true });
  }

  // Validate email
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }

  // Insert or fetch subscriber (idempotent on email)
  let subscriber: SupabaseSubscriber | null = null;
  try {
    subscriber = await upsertSubscriber(email, source);
  } catch (err) {
    console.error("[subscribe] Supabase upsert threw:", err);
    return res.status(500).json({ ok: false, error: "Could not save subscription" });
  }

  if (!subscriber) {
    return res.status(500).json({ ok: false, error: "Could not save subscription" });
  }

  // If welcome already sent, this is a duplicate — silently succeed
  if (subscriber.welcome_sent_at) {
    return res.status(200).json({ ok: true });
  }

  // Send welcome immediately. Wrapped to never block enrollment.
  try {
    const welcomeOk = await sendEmailNow(email, welcomeEmail());
    if (welcomeOk) {
      await markWelcomeSent(subscriber.id);
    }
  } catch (err) {
    console.error("[subscribe] Welcome email send threw:", err);
  }

  // Schedule the 5 nurture emails. Each is queued in Resend with scheduled_at.
  // If any individual scheduling fails, log and continue.
  const signupTime = new Date();
  for (const item of NURTURE_SCHEDULE) {
    try {
      const sendAt = new Date(signupTime.getTime() + item.day * 24 * 60 * 60 * 1000);
      const emailContent = item.getEmail();
      await scheduleEmail(email, emailContent, sendAt.toISOString());
    } catch (err) {
      console.error(`[subscribe] Failed to schedule Day ${item.day} nurture:`, err);
    }
  }

  return res.status(200).json({ ok: true });
}

/**
 * Upsert subscriber — fetch by email, insert if not present.
 * Honors unsubscribed_at — does NOT re-enroll previously unsubscribed addresses.
 */
async function upsertSubscriber(email: string, source: string): Promise<SupabaseSubscriber | null> {
  const fetchUrl = `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id,welcome_sent_at,unsubscribed_at`;
  const fetchRes = await fetch(fetchUrl, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });

  if (!fetchRes.ok) {
    console.error("[subscribe] Fetch existing failed:", fetchRes.status, await fetchRes.text());
    return null;
  }

  const existing = (await fetchRes.json()) as Array<
    SupabaseSubscriber & { unsubscribed_at: string | null }
  >;

  // Honor unsubscribe — return existing row with welcome_sent_at populated
  // so the caller's duplicate check short-circuits and no emails are sent
  if (existing.length > 0 && existing[0].unsubscribed_at) {
    console.log("[subscribe] Previously unsubscribed, ignoring:", email);
    return { id: existing[0].id, welcome_sent_at: existing[0].welcome_sent_at || new Date().toISOString() };
  }

  if (existing.length > 0) {
    return existing[0];
  }

  // New subscriber — insert
  const insertUrl = `${SUPABASE_URL}/rest/v1/subscribers`;
  const insertRes = await fetch(insertUrl, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ email, source }),
  });

  if (!insertRes.ok) {
    console.error("[subscribe] Insert failed:", insertRes.status, await insertRes.text());
    return null;
  }

  const inserted = (await insertRes.json()) as SupabaseSubscriber[];
  return inserted[0] || null;
}

/**
 * Mark welcome email as sent.
 */
async function markWelcomeSent(subscriberId: string): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/subscribers?id=eq.${subscriberId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ welcome_sent_at: new Date().toISOString() }),
  });

  if (!res.ok) {
    console.error("[subscribe] Mark welcome_sent failed:", res.status, await res.text());
  }
}

/**
 * Send email immediately via Resend.
 */
async function sendEmailNow(toEmail: string, content: EmailContent): Promise<boolean> {
  return await sendViaResend(toEmail, content, undefined);
}

/**
 * Schedule email for future delivery via Resend's scheduled_at parameter.
 */
async function scheduleEmail(
  toEmail: string,
  content: EmailContent,
  sendAtIso: string
): Promise<boolean> {
  return await sendViaResend(toEmail, content, sendAtIso);
}

/**
 * Internal: send to Resend with optional scheduled_at.
 * Has fallback retry without reply_to if 422 validation error.
 */
async function sendViaResend(
  toEmail: string,
  content: EmailContent,
  sendAtIso: string | undefined
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[subscribe] RESEND_API_KEY missing");
    return false;
  }

  const basePayload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: [toEmail],
    subject: content.subject,
    html: content.html,
    text: content.text,
  };

  if (sendAtIso) {
    basePayload.scheduled_at = sendAtIso;
  }

  let payload: Record<string, unknown> = { ...basePayload, reply_to: [REPLY_TO] };
  const label = sendAtIso ? `scheduled@${sendAtIso}` : "immediate";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `[subscribe] Resend ${label} ok: id=${data.id} to=${toEmail} attempt=${attempt}`
        );
        return true;
      }

      const errBody = await response.text();
      console.error(
        `[subscribe] Resend ${label} error attempt ${attempt}: status=${response.status} body=${errBody}`
      );

      if (response.status === 422 && attempt === 1) {
        console.log(`[subscribe] Retrying ${label} without reply_to`);
        payload = { ...basePayload };
        continue;
      }

      return false;
    } catch (err) {
      console.error(`[subscribe] Resend ${label} exception attempt ${attempt}:`, err);
      return false;
    }
  }

  return false;
}
