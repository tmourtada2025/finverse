/*
 * FinVerse Home Page — Institutional Refinement
 * 
 * Color system: #111318 primary bg, #F4F4F2 secondary bg, #3E5C76 accent, #9EA7B3 silver
 * 
 * Sections:
 * 1. Hero — full-width landscape image, dark overlay, single CTA
 * 2. Hybrid Thesis — 3 disciplines, generous whitespace
 * 3. Featured Analysis — 3 articles, clean cards
 * 4. Subscribe CTA — Weekly Structure Watch email capture
 * 5. Udemy Ad Banner — tasteful promotional strip before footer
 */

import { useState } from "react";
import { Link } from "wouter";
import { articles } from "@/lib/articles";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const HERO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/99087322/QcPaRPASaFbAtVEc.png";
const UDEMY_URL = "https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5";

export default function Home() {
  const featured = articles.slice(0, 3);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("You're in. First edition lands Sunday before London open.");
      setEmail("");
    }
  };

  return (
    <div>
      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(17,19,24,0.55)" }} />

        <div className="relative h-full flex flex-col justify-end pb-20 md:pb-24 px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-5">
              Market Structure Journal
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              Structural Precision.<br />
              Disciplined Execution.
            </h1>
            <p className="text-base md:text-lg text-[#9EA7B3] leading-relaxed mb-10 max-w-lg">
              Institutional market structure analysis. Applied to real markets, without noise.
            </p>
            <Link
              href="/framework"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors"
              style={{ backgroundColor: "#3E5C76" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}
            >
              Read the Framework
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: HYBRID THESIS ===== */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "#111318" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">
              The Hybrid Thesis
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#F4F4F2] mb-8">
              Three Disciplines. One Framework.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14 mt-14">
            <div style={{ borderLeft: "1px solid #3E5C76", paddingLeft: "1.5rem" }}>
              <h4 className="font-serif text-lg font-bold text-[#F4F4F2] mb-3">
                Liquidity Mechanics
              </h4>
              <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Smart Money Concepts explain where institutional order flow concentrates —
                liquidity pools, order blocks, and fair value gaps define the zones where
                price is engineered to move.
              </p>
            </div>

            <div style={{ borderLeft: "1px solid #3E5C76", paddingLeft: "1.5rem" }}>
              <h4 className="font-serif text-lg font-bold text-[#F4F4F2] mb-3">
                Classical Rhythm
              </h4>
              <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Classical structure defines the rhythm of price — higher highs, lower lows,
                breaks of structure, and changes of character provide the temporal framework
                for directional bias.
              </p>
            </div>

            <div style={{ borderLeft: "1px solid #3E5C76", paddingLeft: "1.5rem" }}>
              <h4 className="font-serif text-lg font-bold text-[#F4F4F2] mb-3">
                Risk Architecture
              </h4>
              <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Risk architecture governs capital survival — position sizing, session filters,
                and graduated allocation ensure that no single trade or sequence of trades
                compromises the account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />

      {/* ===== SECTION 3: FEATURED ANALYSIS ===== */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "#111318" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4">
                Latest Analysis
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F4F4F2]">
                Featured Articles
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center gap-2 text-sm text-[#3E5C76] hover:text-[#9EA7B3] transition-colors"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featured.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block"
              >
                <div className="aspect-[16/10] overflow-hidden mb-5" style={{ backgroundColor: "#1a1d24" }}>
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#3E5C76]">
                    {article.category}
                  </span>
                  <span className="text-[#9EA7B3] opacity-30">|</span>
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9EA7B3]">
                    {article.date}
                  </span>
                </div>
                <h4 className="font-serif text-xl font-bold text-[#F4F4F2] group-hover:text-[#3E5C76] transition-colors leading-snug mb-2">
                  {article.title}
                </h4>
                <p className="text-sm text-[#9EA7B3] leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>

          <div className="md:hidden mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#3E5C76]"
            >
              View All Articles
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />

      {/* ===== SECTION 4: SUBSCRIBE CTA ===== */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#111318" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div style={{ maxWidth: "480px" }}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4">
                Weekly Structure Watch
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F4F4F2] mb-3">
                Key Levels. No Noise.
              </h2>
              <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Every week: the structural levels that matter on EUR/USD, GBP/USD, and Gold —
                plus the bias framework for the sessions ahead. Published Sunday before London open.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 md:w-64 px-4 py-3 text-sm text-[#F4F4F2] placeholder-[#9EA7B3]/50 outline-none"
                style={{
                  backgroundColor: "rgba(158,167,179,0.08)",
                  border: "1px solid rgba(158,167,179,0.2)",
                  borderRight: "none",
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors whitespace-nowrap"
                style={{ backgroundColor: "#3E5C76" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}
              >
                Send Me the Levels
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />

      {/* ===== SECTION 5: UDEMY AD BANNER ===== */}
      <section className="py-14 md:py-16" style={{ backgroundColor: "#0d0f14" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: "#3E5C76", opacity: 0.6 }} />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9EA7B3] opacity-50 mb-2">
                  Course
                </p>
                <h3 className="font-serif text-lg md:text-xl font-bold text-[#F4F4F2] mb-1.5">
                  Smart Money Concepts — The Complete Guide to Smart Trading
                </h3>
                <p className="text-xs text-[#9EA7B3] opacity-70">
                  Hybrid structure integration for independent traders.
                </p>
              </div>
            </div>
            <a
              href={UDEMY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide transition-colors whitespace-nowrap shrink-0"
              style={{ border: "1px solid #3E5C76", color: "#3E5C76" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3E5C76";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#3E5C76";
              }}
            >
              View Course
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
