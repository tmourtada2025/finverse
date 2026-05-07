/*
 * FinVerse — Privacy Policy
 */

export default function PrivacyPolicy() {
  const updated = "7 May 2026"

  return (
    <div style={{ backgroundColor: "#111318", minHeight: "100vh" }}>
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "720px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#3E5C76] mb-4">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#F4F4F2] mb-3">Privacy Policy</h1>
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
              <p>FinVerse does not sell, rent, or share your personal information with third parties for marketing purposes. This policy explains what data we collect, why we collect it, and how it is used.</p>
            </div>

            <h2>1. Who We Are</h2>
            <p>FinVerse (finverse.world) is an online trading education platform operated globally. References to "we", "us", or "FinVerse" in this policy refer to the FinVerse platform and its operators. For privacy-related enquiries, contact us at <a href="mailto:support@finverse.world">support@finverse.world</a>.</p>

            <h2>2. Information We Collect</h2>
            <h3>Information you provide directly</h3>
            <ul>
              <li><strong>Account information:</strong> Name and email address when you create an account or sign in with Google.</li>
              <li><strong>Payment information:</strong> Processed exclusively by Stripe. FinVerse does not store card numbers, CVVs, or full payment details. We retain transaction records (amount, date, course purchased) for financial record-keeping.</li>
              <li><strong>Communications:</strong> Messages you send to our support team.</li>
            </ul>
            <h3>Information collected automatically</h3>
            <ul>
              <li><strong>Course progress:</strong> Which lessons you have completed, your quiz results, and enrollment status.</li>
              <li><strong>Usage data:</strong> Pages visited, session duration, and general interaction patterns used to improve the platform.</li>
              <li><strong>Device information:</strong> Browser type, operating system, and IP address for security and fraud prevention.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information collected for the following purposes:</p>
            <ul>
              <li>To create and manage your account and course access.</li>
              <li>To process payments and issue refunds via Stripe.</li>
              <li>To send transactional emails (purchase confirmation, account verification, password reset). We do not send unsolicited marketing emails without your consent.</li>
              <li>To track your course progress and provide personalised learning continuity.</li>
              <li>To improve platform functionality, identify technical issues, and prevent fraudulent activity.</li>
              <li>To comply with legal obligations.</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. We share data only with the following service providers, strictly for the purposes of operating the platform:</p>
            <ul>
              <li><strong>Supabase</strong> — database and authentication infrastructure (EU servers)</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Vercel</strong> — hosting and deployment</li>
            </ul>
            <p>Each of these providers operates under their own privacy policies and data processing agreements. We do not share your data with advertisers, data brokers, or analytics platforms.</p>

            <h2>5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active. If you delete your account, your profile and login credentials are removed. Financial transaction records (amount paid, course purchased, date) are retained for a minimum of 7 years for legal and accounting purposes, in anonymised form.</p>

            <h2>6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements).</li>
              <li><strong>Portability:</strong> Request your data in a portable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data in certain circumstances.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:support@finverse.world">support@finverse.world</a>. We will respond within 30 days.</p>

            <h2>7. Cookies</h2>
            <p>FinVerse uses minimal cookies, primarily for authentication session management (keeping you logged in) and theme preferences. We do not use advertising cookies or third-party tracking cookies.</p>

            <h2>8. Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), secure authentication via Supabase, and row-level security on all database tables. No system is completely immune to security risks. If you believe your account has been compromised, contact us immediately at <a href="mailto:support@finverse.world">support@finverse.world</a>.</p>

            <h2>9. Children's Privacy</h2>
            <p>FinVerse is not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, contact us and we will delete it promptly.</p>

            <h2>10. Changes to This Policy</h2>
            <p>We may update this policy periodically. When we do, we will update the "Last updated" date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy. For material changes, we will notify registered users via email.</p>

            <h2>11. Contact</h2>
            <p>For any privacy-related questions or requests, contact us at <a href="mailto:support@finverse.world">support@finverse.world</a>.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
