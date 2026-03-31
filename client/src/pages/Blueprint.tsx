/*
 * The Trader's Financial Blueprint — Sales Page
 *
 * $147 | Stripe-ready
 * STRIPE_LINK constant — replace "#" with your Stripe payment link
 */

import { ArrowRight, CheckCircle, BookOpen, TrendingUp, Shield, Brain, DollarSign, BarChart2 } from "lucide-react";

// ─── REPLACE THIS WITH YOUR STRIPE PAYMENT LINK ───────────────────────────────
const STRIPE_LINK = "https://buy.stripe.com/6oUbJ1eeK6YmdRDbRufjG01";
// ──────────────────────────────────────────────────────────────────────────────

const PRICE = "$147";

const modules = [
  { number: "01", title: "The Trader's Financial Paradox", description: "Why traders who can read a chart cannot read a balance sheet — and how that gap silently drains capital even during winning streaks. The psychology of separating trading performance from financial health.", icon: Brain },
  { number: "02", title: "Structuring Your Trading Capital", description: "The correct way to allocate capital across trading accounts, emergency reserves, and living expenses. Why your trading account is not your bank account, and the damage that conflation causes.", icon: BarChart2 },
  { number: "03", title: "Income Architecture for Traders", description: "Building income streams that don't depend entirely on monthly P&L. How to design your personal finances so that a drawdown period doesn't force bad trades or premature position closures.", icon: TrendingUp },
  { number: "04", title: "Taxes, Entities, and Jurisdiction", description: "The tax obligations most retail traders don't know they have. Structuring trading activity correctly from day one — whether as an individual, an LLC, or across jurisdictions.", icon: DollarSign },
  { number: "05", title: "Risk of Ruin — The Full Picture", description: "Risk of ruin is not just a position-sizing concept. Applied to your total financial life: how long your capital and reserves can sustain you, and what the true failure point is.", icon: Shield },
  { number: "06", title: "Building Wealth Alongside Trading", description: "Trading as one component of a broader wealth-building strategy. Asset allocation outside of trading accounts, compounding over time, and the transition from active trader to financially sovereign.", icon: BookOpen },
];

const forList = [
  "Retail traders who are consistently profitable but feel financially disorganised",
  "Traders entering live accounts for the first time who want to structure correctly from the start",
  "Anyone who has experienced a drawdown that affected their personal finances directly",
  "Traders who have never thought about tax implications of their trading activity",
  "Anyone relying entirely on trading P&L to cover living expenses",
];

const notForList = [
  "Complete beginners who have never traded — learn the technical framework first",
  "Anyone looking for trading strategies or entry signals — this covers personal finance, not market analysis",
];

const faqs = [
  { q: "Is this a trading strategy course?", a: "No. This course covers personal financial management specifically for traders — capital structuring, income architecture, taxes, and wealth building. Trading strategies are covered in the SMC course." },
  { q: "Do I need to be profitable before taking this?", a: "No. The earlier you build the right financial structure, the better. Most traders build bad habits around money management before they become profitable — this course helps you avoid that." },
  { q: "How long is the course?", a: "Six modules. Designed to be completed over a weekend or spread across a week. The content is dense and practical — not padded." },
  { q: "Is there a refund policy?", a: "Yes. If you complete the course and feel it did not deliver value, contact us within 14 days for a full refund. No questions asked." },
  { q: "How is the course delivered?", a: "Video lessons with downloadable frameworks and worksheets. Lifetime access on purchase." },
];

export default function Blueprint() {
  return (
    <div style={{ backgroundColor: "#111318" }}>

      {/* HERO */}
      <section className="py-24 md:py-32" style={{ borderBottom: "1px solid rgba(158,167,179,0.12)" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="md:col-span-7">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#3E5C76] mb-6">Personal Finance for Traders</p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-6">
                The Trader's<br />Financial Blueprint
              </h1>
              <p className="text-lg text-[#9EA7B3] mb-8" style={{ lineHeight: "1.7", maxWidth: "540px" }}>
                Most traders learn how to read markets. Almost none learn how to manage the money those markets generate. This course closes that gap.
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {["6 Modules", "Lifetime Access", "Downloadable Frameworks", "14-Day Refund"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3E5C76" }} />
                    <span className="text-sm text-[#9EA7B3]">{item}</span>
                  </div>
                ))}
              </div>
              <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-base font-medium tracking-wide text-white transition-colors"
                style={{ backgroundColor: "#3E5C76" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
                Enrol Now — $147
                <ArrowRight size={18} />
              </a>
              <p className="text-xs text-[#9EA7B3] opacity-50 mt-4">Secure checkout via Stripe. One-time payment. Lifetime access.</p>
            </div>
            <div className="md:col-span-5" style={{ backgroundColor: "rgba(62,92,118,0.08)", border: "1px solid rgba(62,92,118,0.25)", padding: "2rem" }}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4">Course Access</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-serif text-5xl font-bold text-[#F4F4F2]">$147</span>
                <span className="text-sm text-[#9EA7B3] opacity-60 ml-1">one-time</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(158,167,179,0.12)", marginBottom: "1.5rem" }} />
              {["6 in-depth video modules","Personal capital structure framework","Income architecture worksheet","Tax planning checklist","Risk of ruin calculator","Lifetime access & future updates","14-day money-back guarantee"].map((item) => (
                <div key={item} className="flex items-start gap-3 mb-3">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                  <span className="text-sm text-[#9EA7B3]">{item}</span>
                </div>
              ))}
              <div style={{ height: "1px", backgroundColor: "rgba(158,167,179,0.12)", margin: "1.5rem 0" }} />
              <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium tracking-wide text-white transition-colors"
                style={{ backgroundColor: "#3E5C76" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
                Enrol Now <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">The Problem</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#F4F4F2] mb-8">
              You learned how to trade.<br />Nobody taught you what to do with the money.
            </h2>
            <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>The trading education industry is built almost entirely around one thing: how to identify and execute trades. Entry criteria, risk management, psychology. What it does not cover — at all — is what happens outside the trading account.</p>
            <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>Most retail traders have no capital structure. Their trading account doubles as their savings account. They have no clarity on their tax obligations. Their income depends entirely on monthly P&L — which means a drawdown period doesn't just affect their account, it affects their ability to pay rent.</p>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.8" }}>This is not a trading problem. It's a financial architecture problem. And it compounds silently — until a bad month, a bad quarter, or a bad year forces a decision that permanently damages both their capital and their confidence.</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* CURRICULUM */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }} className="mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">What's Inside</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#F4F4F2]">Six modules. One complete financial system.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.number} className="flex gap-6" style={{ backgroundColor: "rgba(158,167,179,0.03)", border: "1px solid rgba(158,167,179,0.1)", padding: "1.75rem" }}>
                  <div className="shrink-0"><span className="font-serif text-sm font-bold" style={{ color: "#3E5C76", opacity: 0.6 }}>{mod.number}</span></div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={16} style={{ color: "#3E5C76" }} />
                      <h4 className="font-serif text-base font-bold text-[#F4F4F2]">{mod.title}</h4>
                    </div>
                    <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>{mod.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* WHO IT'S FOR */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">This is for you if</p>
              {forList.map((item) => (
                <div key={item} className="flex items-start gap-3 mb-4">
                  <CheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                  <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>{item}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">This is not for you if</p>
              {notForList.map((item) => (
                <div key={item} className="flex items-start gap-3 mb-4">
                  <div className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border flex items-center justify-center" style={{ borderColor: "rgba(158,167,179,0.3)" }}>
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(158,167,179,0.4)" }} />
                  </div>
                  <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* INSTRUCTOR */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">The Instructor</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F4F4F2] mb-6">Toufic Mourtada — The Trader Alchemist</h2>
            <p className="text-[#9EA7B3] mb-5" style={{ lineHeight: "1.8" }}>Toufic Mourtada is the founder of FinVerse and the Sovereign Trader Institute. He has spent over a decade at the intersection of market structure analysis and trader psychology — first applying these frameworks to his own trading, then building systems to teach them to others.</p>
            <p className="text-[#9EA7B3] mb-5" style={{ lineHeight: "1.8" }}>The Trader's Financial Blueprint emerged from a consistent pattern observed across hundreds of traders: technical competence and financial incompetence coexisting in the same person. The course is the structured response to that pattern — practical, direct, and built entirely on what actually costs traders money outside their charts.</p>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.8" }}>His SMC course on Udemy has helped thousands of traders develop a rigorous technical framework. This course completes the other half of the equation.</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* PRICING CTA */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "#0d0f14" }}>
        <div className="px-5 mx-auto text-center" style={{ maxWidth: "640px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">Ready to start</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F4F4F2] mb-4">One payment. Permanent access.</h2>
          <p className="text-[#9EA7B3] mb-10" style={{ lineHeight: "1.7" }}>Every module, every framework, every update — for the price of a single poorly-managed trade.</p>
          <div className="flex items-baseline justify-center gap-1 mb-8">
            <span className="font-serif text-6xl font-bold text-[#F4F4F2]">$147</span>
          </div>
          <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 text-base font-medium tracking-wide text-white transition-colors mb-4"
            style={{ backgroundColor: "#3E5C76" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
            Enrol Now <ArrowRight size={18} />
          </a>
          <p className="text-xs text-[#9EA7B3] opacity-40 mt-4">Secure checkout via Stripe. 14-day refund guarantee. No subscriptions.</p>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* FAQ */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">FAQ</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F4F4F2] mb-12">Common questions</h2>
            {faqs.map((faq, i) => (
              <div key={faq.q}>
                <div className="py-7">
                  <h4 className="font-serif text-base font-bold text-[#F4F4F2] mb-3">{faq.q}</h4>
                  <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.8" }}>{faq.a}</p>
                </div>
                {i < faqs.length - 1 && <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="py-10">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <p className="text-xs text-[#9EA7B3] opacity-40" style={{ maxWidth: "680px", lineHeight: "1.8" }}>
            This course is for educational purposes only and does not constitute financial, legal, or tax advice. Tax laws and financial regulations vary by jurisdiction. Consult a qualified professional before making financial or tax decisions. Results described are illustrative and not guaranteed. Trading involves risk of loss.
          </p>
        </div>
      </section>

    </div>
  );
}
