/*
 * FinVerse — Terms of Use
 */

import SEO from "@/components/SEO";

export default function TermsOfUse() {
  const updated = "7 May 2026"

  return (
    <div style={{ backgroundColor: "#111318", minHeight: "100vh" }}>
      <SEO
        title="Terms of Use"
        description="Terms governing your use of FinVerse and its courses, including disclaimers and limitations of liability."
        canonical="/terms"
      />
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "720px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#3E5C76] mb-4">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#F4F4F2] mb-3">Terms of Use</h1>
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
              <p>By accessing or using FinVerse (finverse.world), you agree to be bound by these Terms of Use. If you do not agree, do not use the platform.</p>
            </div>

            <h2>1. Platform Description</h2>
            <p>FinVerse is an online trading education platform providing courses, journal articles, and educational resources related to market structure analysis and personal finance for traders. FinVerse content is for <strong>educational purposes only</strong> and does not constitute financial, investment, legal, or tax advice.</p>

            <h2>2. Eligibility</h2>
            <p>You must be at least 18 years of age to create an account and purchase courses on FinVerse. By creating an account, you represent that you meet this requirement and that all information you provide is accurate and complete.</p>

            <h2>3. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at <a href="mailto:support@finverse.world">support@finverse.world</a> if you suspect unauthorised access to your account.</p>
            <p>Accounts are for individual use only. Sharing your account credentials or course access with others is prohibited and may result in account termination without refund.</p>

            <h2>4. Course Access and Licence</h2>
            <p>Upon purchasing a course, FinVerse grants you a <strong>personal, non-exclusive, non-transferable licence</strong> to access and view the course content for your own personal, non-commercial educational use.</p>
            <p>This licence does not permit you to:</p>
            <ul>
              <li>Download, copy, reproduce, or redistribute course materials in any form.</li>
              <li>Screen-record, capture, or otherwise duplicate video or audio content.</li>
              <li>Share access credentials or course content with any third party.</li>
              <li>Use course content for commercial purposes, resale, or in competing educational products.</li>
              <li>Remove or obscure any copyright, trademark, or proprietary notices.</li>
            </ul>
            <p>Violation of these terms may result in immediate access revocation and legal action.</p>

            <h2>5. Intellectual Property</h2>
            <p>All content on FinVerse — including course material, articles, frameworks, methodologies, graphics, and branding — is the exclusive intellectual property of FinVerse and its content creators, protected under applicable copyright and intellectual property laws.</p>
            <p>The FinVerse name, logo, and "The Trader Alchemist" brand are trademarks of FinVerse. Nothing in these Terms grants you any right to use FinVerse trademarks without prior written permission.</p>

            <h2>6. Educational Disclaimer</h2>
            <p>All content provided on FinVerse is for <strong>educational and informational purposes only</strong>. Nothing on this platform constitutes:</p>
            <ul>
              <li>Financial or investment advice</li>
              <li>A recommendation to buy or sell any financial instrument</li>
              <li>Legal or tax advice</li>
              <li>A guarantee of trading results or performance</li>
            </ul>
            <p>Trading financial instruments involves significant risk of loss. Past performance discussed in course content or articles does not guarantee future results. You are solely responsible for your own trading decisions and their financial consequences.</p>

            <h2>7. Payments</h2>
            <p>All payments are processed securely by Stripe. By purchasing a course, you agree to Stripe's Terms of Service. FinVerse does not store your payment card details.</p>
            <p>Prices are displayed in USD and are subject to change without notice. The price at the time of purchase is the price you will be charged.</p>

            <h2>8. Refunds</h2>
            <p>Refunds are governed by the <a href="/refund-policy">FinVerse Refund Policy</a>. In summary, a full refund is available within 14 days of purchase. After 14 days, no refunds will be issued.</p>

            <h2>9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any unlawful purpose or in violation of any applicable regulations.</li>
              <li>Attempt to gain unauthorised access to any part of the platform or its infrastructure.</li>
              <li>Introduce malicious code, viruses, or any technology that could harm the platform or other users.</li>
              <li>Harass, impersonate, or harm other users or FinVerse staff.</li>
              <li>Use automated tools, scrapers, or bots to access platform content.</li>
              <li>Misrepresent your identity or affiliation with FinVerse.</li>
            </ul>

            <h2>10. Termination</h2>
            <p>FinVerse reserves the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any conduct we determine to be harmful to the platform, other users, or FinVerse's reputation. In cases of deliberate abuse (e.g. chargebacks, content piracy), no refund will be issued upon termination.</p>

            <h2>11. Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, FinVerse and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or its content, including but not limited to trading losses, loss of profits, or loss of data.</p>
            <p>FinVerse's total liability to you for any claim arising from these Terms shall not exceed the amount you paid for the course giving rise to the claim.</p>

            <h2>12. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with applicable international commercial law. Any disputes arising from these Terms shall be resolved through good-faith negotiation first, followed by binding arbitration if necessary. Nothing in these Terms limits your statutory rights as a consumer in your jurisdiction.</p>

            <h2>13. Changes to These Terms</h2>
            <p>We may update these Terms periodically. When we do, we will update the "Last updated" date at the top of this page and, for material changes, notify registered users via email. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>

            <h2>14. Contact</h2>
            <p>For questions regarding these Terms, contact us at <a href="mailto:support@finverse.world">support@finverse.world</a>.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
