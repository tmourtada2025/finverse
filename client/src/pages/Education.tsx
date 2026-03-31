/*
 * FinVerse Education Page — /education
 */

import { Link } from "wouter";
import { ArrowRight, ExternalLink, CheckCircle, BarChart2, Brain } from "lucide-react";

const UDEMY_URL = "https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5";

const courses = [
  {
    id: "smc",
    category: "Market Structure",
    badge: "Udemy",
    external: true,
    href: UDEMY_URL,
    title: "SMC: The Complete Guide to Smart Trading",
    subtitle: "Smart Money Concepts — Hybrid Structure Integration",
    description: "A complete technical framework for independent traders. Covers institutional order flow, liquidity mechanics, fair value gaps, order blocks, and structural execution across all market sessions.",
    level: "Beginner → Advanced",
    duration: "Self-paced",
    price: null,
    priceLabel: "On Udemy",
    highlights: [
      "Full SMC methodology from first principles",
      "Liquidity pools, order blocks, fair value gaps",
      "Multi-timeframe structural analysis",
      "Session timing and volatility windows",
      "Risk architecture and position sizing",
      "Live trade walkthroughs",
    ],
    icon: BarChart2,
    featured: false,
  },
  {
    id: "blueprint",
    category: "Personal Finance",
    badge: "FinVerse",
    external: false,
    href: "/blueprint",
    title: "The Trader’s Financial Blueprint",
    subtitle: "Capital Structure · Income Architecture · Financial Sovereignty",
    description: "Most traders spend years learning how to read markets. Almost none learn what to do with the money those markets generate. Six focused modules covering everything outside the chart.",
    level: "All Levels",
    duration: "6 Modules",
    price: "$147",
    priceLabel: "$147 · One-time",
    highlights: [
      "Separating trading capital from personal finances",
      "Income streams that survive drawdown periods",
      "Tax obligations and entity structuring",
      "Risk of ruin applied to your full financial life",
      "Wealth building alongside active trading",
      "Lifetime access and downloadable frameworks",
    ],
    icon: Brain,
    featured: true,
  },
];

const upcoming = [
  {
    title: "Advanced Order Flow & Institutional Execution",
    category: "Market Structure",
    description: "Depth of market, tape reading, and institutional execution techniques layered on top of the SMC framework.",
    status: "In Development",
  },
  {
    title: "Trading Psychology — The Inner Circle Method",
    category: "Psychology",
    description: "The psychological framework behind the Sovereign Trader Institute’s Inner Circle cohort program.",
    status: "Coming Soon",
  },
  {
    title: "Portfolio Construction for Active Traders",
    category: "Personal Finance",
    description: "How to manage multiple asset classes, allocate between trading and investment accounts, and build a resilient long-term portfolio.",
    status: "Coming Soon",
  },
];

export default function Education() {
  return (
    <div style={{ backgroundColor: "#111318" }}>
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">Education</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-6">
              Courses Built for<br />Serious Traders
            </h1>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.8", maxWidth: "580px" }}>
              Two disciplines. The technical framework for reading markets, and the financial framework for managing what those markets generate. Both are required. Most traders only have one.
            </p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      <section className="py-20 md:py-28">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course) => {
              const Icon = course.icon;
              return (
                <div key={course.id} className="flex flex-col" style={{
                  backgroundColor: course.featured ? "rgba(62,92,118,0.06)" : "rgba(158,167,179,0.03)",
                  border: course.featured ? "1px solid rgba(62,92,118,0.3)" : "1px solid rgba(158,167,179,0.1)",
                }}>
                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: "rgba(62,92,118,0.15)", border: "1px solid rgba(62,92,118,0.25)" }}>
                          <Icon size={16} style={{ color: "#3E5C76" }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-60">{course.category}</p>
                          <span className="text-[9px] font-medium uppercase tracking-[0.1em] px-1.5 py-0.5" style={{ backgroundColor: "rgba(62,92,118,0.15)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.25)" }}>
                            {course.badge}
                          </span>
                        </div>
                      </div>
                      {course.featured && (
                        <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1" style={{ backgroundColor: "rgba(62,92,118,0.2)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.3)" }}>New</span>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#F4F4F2] mb-2 leading-snug">{course.title}</h2>
                    <p className="text-xs text-[#9EA7B3] opacity-60 mb-4 uppercase tracking-[0.08em]">{course.subtitle}</p>
                    <p className="text-sm text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>{course.description}</p>
                    <div className="mb-6">
                      {course.highlights.map((h) => (
                        <div key={h} className="flex items-start gap-2.5 mb-2.5">
                          <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                          <span className="text-xs text-[#9EA7B3]" style={{ lineHeight: "1.6" }}>{h}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#9EA7B3] opacity-40 mb-0.5">Level</p>
                        <p className="text-xs text-[#9EA7B3]">{course.level}</p>
                      </div>
                      <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(158,167,179,0.15)" }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#9EA7B3] opacity-40 mb-0.5">Format</p>
                        <p className="text-xs text-[#9EA7B3]">{course.duration}</p>
                      </div>
                      <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(158,167,179,0.15)" }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#9EA7B3] opacity-40 mb-0.5">Price</p>
                        <p className="text-xs text-[#9EA7B3]">{course.priceLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-5" style={{ borderTop: "1px solid rgba(158,167,179,0.08)" }}>
                    {course.external ? (
                      <a href={course.href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-colors"
                        style={{ border: "1px solid rgba(62,92,118,0.5)", color: "#3E5C76" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3E5C76"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#3E5C76"; }}>
                        View on Udemy <ExternalLink size={13} />
                      </a>
                    ) : (
                      <Link href={course.href}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors"
                        style={{ backgroundColor: "#3E5C76" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
                        View Course — {course.price} <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "600px" }} className="mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4">In the Pipeline</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F4F4F2]">Courses in Development</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcoming.map((course) => (
              <div key={course.title} style={{ backgroundColor: "rgba(158,167,179,0.02)", border: "1px solid rgba(158,167,179,0.08)", padding: "1.75rem" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9EA7B3] opacity-50">{course.category}</p>
                  <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5" style={{ color: "rgba(158,167,179,0.4)", border: "1px solid rgba(158,167,179,0.12)" }}>{course.status}</span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#F4F4F2] mb-3 leading-snug">{course.title}</h4>
                <p className="text-xs text-[#9EA7B3] opacity-60" style={{ lineHeight: "1.7" }}>{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: "#0d0f14" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div style={{ maxWidth: "480px" }}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">Stay Informed</p>
              <h3 className="font-serif text-xl font-bold text-[#F4F4F2] mb-2">Be first to know when new courses launch.</h3>
              <p className="text-sm text-[#9EA7B3] opacity-60">Join the weekly structure watch — new course announcements go to the list first.</p>
            </div>
            <Link href="/#subscribe"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-colors whitespace-nowrap"
              style={{ border: "1px solid rgba(62,92,118,0.5)", color: "#3E5C76" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3E5C76"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#3E5C76"; }}>
              Join the List <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
