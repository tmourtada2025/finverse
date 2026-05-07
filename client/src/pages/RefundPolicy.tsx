/*
 * FinVerse — Refund Policy
 */

export default function RefundPolicy() {
  const updated = "7 May 2026"

  return (
    <div style={{ backgroundColor: "#111318", minHeight: "100vh" }}>
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "720px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#3E5C76] mb-4">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#F4F4F2] mb-3">Refund Policy</h1>
          <p className="text-sm text-[#9EA7B3] mb-12">Last updated: {updated}</p>

          <div className="prose" style={{ color: "#9EA7B3", lineHeight: "1.8" }}>
            <style>{`
              .prose h2 { font-family: Georgia, serif; color: #F4F4F2; font-size: 1.2em; font-weight: 700; margin: 2em 0 0.6em; }
              .prose h3 { color: #F4F4F2; font-size: 1em; font-weight: 600; margin: 1.5em 0 0.4em; }
              .prose p  { margin: 0.8em 0; font-size: 0.95rem; }
              .prose ul { list-style: disc; padding-left: 1.5em; margin: 0.6em 0; }
              .prose li { margin-bottom: 0.4em; font-size: 0.95rem; }
              .prose a  { color: #3E5C76; text-decoration: underline; }
              .prose strong { color: #F4F4F2; font-weight: 600; }
              .prose .highlight { border-left: 2px solid #3E5C76; padding-left: 1.25rem; margin: 1.5em 0; }
            `}</style>

            <div className="highlight">
              <p>FinVerse offers a <strong>14-day refund guarantee</strong> on all course purchases. If you are not satisfied, you may request a full refund within 14 days of your purchase date — no questions asked.</p>
            </div>

            <h2>1. Eligibility</h2>
            <p>To be eligible for a refund, the following conditions must be met:</p>
            <ul>
              <li>Your refund request is submitted within <strong>14 calendar days</strong> of the original purchase date.</li>
              <li>The purchase was made directly through the FinVerse platform (finverse.world) via Stripe.</li>
              <li>The course access has not been transferred or shared with another individual.</li>
            </ul>

            <h2>2. How to Request a Refund</h2>
            <p>You can request a refund in two ways:</p>
            <h3>Self-serve (fastest)</h3>
            <p>Log in to your FinVerse account → Dashboard → My Courses → click <strong>"Request refund"</strong> on the relevant course. The refund is processed automatically and access is revoked immediately.</p>
            <h3>Via email</h3>
            <p>Send an email to <a href="mailto:support@finverse.world">support@finverse.world</a> with the subject line "Refund Request" and include your registered email address and the course name. We will process your request within 2 business days.</p>

            <h2>3. Refund Processing</h2>
            <p>Approved refunds are returned to the original payment method used at checkout. Processing times vary by payment provider:</p>
            <ul>
              <li><strong>Credit / debit card:</strong> 5–10 business days</li>
              <li><strong>Other methods:</strong> Up to 10 business days</li>
            </ul>
            <p>FinVerse processes refunds promptly upon approval. Delays beyond the above timeframes are determined by your card issuer or bank, not by FinVerse.</p>

            <h2>4. Exceptions</h2>
            <p>Refunds will not be issued in the following circumstances:</p>
            <ul>
              <li>The 14-day refund window has expired.</li>
              <li>The purchase was not made through the FinVerse platform (e.g. third-party resellers).</li>
              <li>Evidence of course content being downloaded, screen-recorded, or redistributed.</li>
              <li>Chargebacks initiated without first contacting FinVerse support — chargebacks may result in permanent account suspension.</li>
            </ul>

            <h2>5. Course Access After Refund</h2>
            <p>Upon refund approval, access to the course is revoked immediately. Course progress, completion certificates, and any downloaded materials associated with the enrollment will no longer be accessible. Your account remains active and you may re-enrol at the current course price.</p>

            <h2>6. Promotional Purchases</h2>
            <p>Courses purchased at a discounted or promotional price are subject to the same 14-day refund policy. The refund amount will equal the amount actually paid, not the standard course price.</p>

            <h2>7. Contact</h2>
            <p>For any questions regarding this policy, contact us at <a href="mailto:support@finverse.world">support@finverse.world</a>. We aim to respond to all refund-related inquiries within 1 business day.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
