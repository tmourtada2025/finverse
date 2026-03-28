/*
 * FinVerse About Page — Institutional Refinement
 * 
 * Color system: #111318, #F4F4F2, #3E5C76, #9EA7B3
 * Professional, measured tone. No motivational language.
 * SVT section moved here from homepage — given proper context.
 */

import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const SVT_LOGO = "https://private-us-east-1.manuscdn.com/sessionFile/feCh4CM4AAJJxZhdsCxOxr/sandbox/hkMQ7Pc1wXfXSinLSpcHyK-img-1_1771581393000_na1fn_c292ZXJlaWduLXRyYWRlci1sb2dv.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZmVDaDRDTTRBQUpKeFpoZHNDeE94ci9zYW5kYm94L2hrTVE3UGMxd1hmWFNpbkxTcGNIeUstaW1nLTFfMTc3MTU4MTM5MzAwMF9uYTFmbl9jMjkyWlhKbGFXZHVMWFJ5WVdSbGNpMXNiMmR2LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SCLIa4s5VkuPxf21YxoKbu8MyFrH~3jRtcjbBeNaJ7nTwMTgf13yoh7QdMEPksixpHWE2sA8TgiduXDGsFy4H1eW5HNc18JDJ2g9D8Z7CWQao3vPYL7lm1JwDVRGZXuaHoXJCcO0DQAgPWS5mjn8rTGBBufKqzvkPnqbX~ttXlmz-FFs-wxM2Hy7fm7IMtdpZxpQhzYyepA-jDr3DIIRpeB66SkV-4mc8QYvY4ojESVsQgcsIHF1nhw4fxh5k1l3HTU6LXDSy9~DSGBKntrzfNBchY-NXL5UyqX2Zg9UYn7Brq9E~tvSZ8~-inct4YMEPnxA-8aINqk32M8D81Sy5w__";

export default function About() {
  return (
    <div style={{ backgroundColor: "#111318" }}>
      {/* Header */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">
              About
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-8">
              The Discipline Behind<br />
              the Framework
            </h1>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7", maxWidth: "600px" }}>
              FinVerse is built on institutional market structure research, 
              disciplined risk management, and intellectual rigor over market noise.
            </p>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Background */}
      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Background
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#F4F4F2]">Professional Foundation</h2>
            </div>
            <div className="lg:col-span-8" style={{ maxWidth: "720px" }}>
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                The work behind FinVerse draws from years of experience in financial markets, 
                with a specialization in institutional market structure and order flow analysis. 
                The approach is rooted in understanding how institutional participants — banks, 
                hedge funds, and proprietary trading firms — interact with price through 
                liquidity mechanics.
              </p>
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                The hybrid framework was developed through extensive study of Smart Money 
                Concepts, classical technical analysis, and quantitative risk management. 
                It represents a synthesis of these disciplines into a unified execution 
                methodology that prioritizes capital preservation and structural precision.
              </p>
              <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                This is not a signals service, a trading academy, or a membership platform. 
                FinVerse exists as a research journal — a structured record of market analysis, 
                framework development, and the ongoing refinement of a disciplined approach 
                to independent trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Specialization */}
      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Specialization
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#F4F4F2]">Market Structure</h2>
            </div>
            <div className="lg:col-span-8" style={{ maxWidth: "720px" }}>
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                The core specialization is hybrid institutional market structure — the 
                integration of Smart Money Concepts with classical technical rhythm and 
                systematic risk architecture. This approach treats the market as a 
                structured environment where institutional order flow creates predictable 
                patterns that can be identified, classified, and traded with discipline.
              </p>
              <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Key areas of focus include liquidity mapping, inducement mechanics, 
                structural rhythm analysis, session-based volatility profiling, and 
                graduated risk allocation. Each of these components is documented in 
                the Framework section and applied in the case studies published in 
                the Journal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Speaking & Recognition */}
      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Recognition
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#F4F4F2]">Speaking & Education</h2>
            </div>
            <div className="lg:col-span-8" style={{ maxWidth: "720px" }}>
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                The framework and its underlying methodology have been shared through 
                various educational channels. Notable engagements include contributions 
                to the Asia Forex Mentor platform, where the hybrid approach was presented 
                to an audience of independent traders and institutional participants.
              </p>
              <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                A comprehensive Smart Money Trading course provides a structured 
                curriculum covering the foundational concepts of the framework. The course 
                is designed for traders committed to developing a systematic approach to 
                market structure analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Philosophy */}
      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Philosophy
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#F4F4F2]">Disciplined Execution</h2>
            </div>
            <div className="lg:col-span-8" style={{ maxWidth: "720px" }}>
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                In a market where information is abundant and strategies are widely 
                available, the differentiator is consistency. Execution discipline, 
                risk discipline, and the discipline to wait for high-probability setups 
                are the foundations of sustainable performance.
              </p>
              <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                This journal documents that process — the analysis, the decisions, 
                the lessons, and the ongoing refinement of a framework built for 
                structural precision and capital preservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Sovereign Trader Institute — moved from homepage for proper context */}
      <section className="py-20 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Identity
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#F4F4F2]">Sovereign Trader Institute</h2>
            </div>
            <div className="lg:col-span-8" style={{ maxWidth: "720px" }}>
              <img
                src={SVT_LOGO}
                alt="Sovereign Trader Institute"
                className="mb-8 w-full max-w-sm"
                loading="lazy"
              />
              <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.7" }}>
                The Sovereign Trader Institute is the structured identity framework behind 
                FinVerse — governing performance architecture, psychological discipline, 
                and capital allocation. It represents the operational philosophy that 
                underpins every aspect of the trading methodology.
              </p>
              <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                Where FinVerse documents the analysis and framework, the Institute defines 
                the standards of execution — the rules, the governance, and the accountability 
                structures that separate systematic trading from discretionary guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20" style={{ borderTop: "1px solid rgba(158,167,179,0.15)" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-2">
                Next Step
              </p>
              <p className="font-serif text-xl font-bold text-[#F4F4F2]">Read the Framework</p>
            </div>
            <Link
              href="/framework"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors"
              style={{ backgroundColor: "#3E5C76" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}
            >
              View Framework
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
