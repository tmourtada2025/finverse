/*
 * Smart Money Concepts: The Complete Guide — Sales Page
 * Enrol button disabled when course is unpublished in Supabase
 * Mirrors Blueprint.tsx pattern for consistency
 */

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, BarChart2, Layers, Compass, Target, Activity, Zap, BookOpen, Brain } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STRIPE_LINK = "https://buy.stripe.com/aFa4gzdaG0zY6pb4p2fjG04"; // TODO: paste Stripe Payment Link URL once created
const COURSE_SLUG = "smc-complete-guide";
const INTRO_VIDEO_URL = "https://iframe.mediadelivery.net/embed/656804/12da8be6-7e14-436b-a72d-db16e9d2caf8";

const modules = [
  { number: "01", title: "Foundations of Smart Money", description: "What institutional flow actually is, why retail traders systematically lose to it, and the foundational language of liquidity, market structure, and price psychology that everything else builds on.", icon: Compass },
  { number: "02", title: "Market Structure", description: "Reading trends through the lens of structural shifts. How algorithmic execution shapes the price action you see, and how to identify trend continuation versus reversal in real time.", icon: BarChart2 },
  { number: "03", title: "Core SMC Mechanics", description: "Order blocks, fair value gaps, breaks of structure, liquidity grabs, and inducement. The five execution-grade concepts that define institutional positioning on a chart.", icon: Layers },
  { number: "04", title: "Execution and Risk", description: "Precision entry techniques. Stop loss and take profit construction. Risk management and position sizing. Trade management once you're in. The full execution layer of SMC.", icon: Target },
  { number: "05", title: "Advanced Application", description: "Multi-timeframe analysis. Advanced strategies for order blocks, fair value gaps, liquidity, and market structure. The level required to trade institutional setups consistently rather than occasionally.", icon: Zap },
];

const forList = [
  "Active retail traders who want a structural framework that survives market regime shifts",
  "Traders who have studied indicators, patterns, or strategies but still trade against institutional flow without realising it",
  "Anyone who has been stopped out repeatedly at obvious technical levels and suspects there's a deeper mechanic at play",
  "Traders ready to move from chasing price to anticipating it",
  "Anyone serious enough about trading to invest in their education the same way they invest in their tools",
];

const notForList = [
  "Anyone looking for signal services, automated systems, or copy-trade setups",
  "Traders who want trade-by-trade hand-holding rather than a framework to apply independently",
  "Anyone unwilling to spend time on chart practice before risking real capital",
];

const faqs = [
  { q: "Do I need any prior trading experience?", a: "Some helps, but it's not required. The course assumes no prior knowledge of SMC and starts from first principles. Anyone who has spent time looking at charts will be able to follow it." },
  { q: "What markets does this work on?", a: "SMC is market-agnostic. The mechanics apply to forex, indices, gold, crypto, and equities. Examples in the course cover all of these." },
  { q: "How long is the course?", a: "Five modules, twenty-five lessons, approximately 4 hours and 45 minutes of video content. Designed to be completed over a week or compressed into a focused weekend." },
  { q: "Is this self-paced?", a: "Yes. Lifetime access, free-flow navigation. Watch in any order, return as often as you need. Each lesson includes video instruction plus written reference material and a knowledge check." },
  { q: "What format is the content?", a: "HD video lessons hosted on a private streaming platform, plus written companion text for each lesson and a 5-question knowledge check. Lifetime access to all current and future updates." },
  { q: "Is there a refund policy?", a: "Yes. If the course doesn't deliver what's described, contact us within 14 days for a full refund. No questions asked." },
  { q: "How is this different from your Udemy course?", a: "The Udemy version covers similar concepts but is delivered through Udemy's platform with their constraints. This direct version on FinVerse runs on faster infrastructure with all future updates included for life — and supports the broader FinVerse education work." },
];

function EnrolButtonSmall({ available }: { available: boolean }) {
  if (!available) return (
    <div>
      <div className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        style={{ backgroundColor: "#3E5C76" }}>
        Currently Unavailable
      </div>
      <p className="text-xs text-[#9EA7B3] opacity-50 mt-3 text-center">
        Launching soon. Check back or{" "}
        <a href="mailto:support@finverse.world" className="underline">contact us</a>.
      </p>
    </div>
  )
  return (
    <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium tracking-wide text-white transition-colors"
      style={{ backgroundColor: "#3E5C76" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
      Enrol Now <ArrowRight size={14} />
    </a>
  )
}

export default function CourseLandingSMC() {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    supabase
      .from('courses')
      .select('is_published')
      .eq('slug', COURSE_SLUG)
      .single()
      .then(({ data }) => setAvailable(data?.is_published ?? false))
  }, [])

  const ready = available !== null

  return (
    <div style={{ backgroundColor: "#111318" }}>

      {/* HERO */}
      <section className="py-24 md:py-32" style={{ borderBottom: "1px solid rgba(158,167,179,0.12)" }}>
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="md:col-span-7">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#3E5C76] mb-6">Smart Money Concepts</p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-6">
                The Complete Guide<br />to Smart Trading
              </h1>
              <p className="text-lg text-[#9EA7B3] mb-8" style={{ lineHeight: "1.7", maxWidth: "540px" }}>
                Read institutional order flow. Trade with the smart money instead of becoming their liquidity. The complete structural framework — built from first principles, applied across markets.
              </p>
              <div className="aspect-video rounded mb-8" style={{ overflow: "hidden", border: "1px solid rgba(158,167,179,0.15)" }}>
                <iframe src={INTRO_VIDEO_URL} className="w-full h-full" allowFullScreen />
              </div>
              <div className="flex flex-wrap gap-6 mb-2">
                {["5 Modules · 25 Lessons", "4h 45m of Video", "Lifetime Access", "14-Day Refund"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3E5C76" }} />
                    <span className="text-sm text-[#9EA7B3]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5" style={{ backgroundColor: "rgba(62,92,118,0.08)", border: "1px solid rgba(62,92,118,0.25)", padding: "2rem" }}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4">Course Access</p>
              {available && (
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-serif text-5xl font-bold text-[#F4F4F2]">$199</span>
                  <span className="text-sm text-[#9EA7B3] opacity-60 ml-1">one-time</span>
                </div>
              )}
              <div style={{ height: "1px", backgroundColor: "rgba(158,167,179,0.12)", marginBottom: "1.5rem" }} />
              {[
                "25 HD video lessons",
                "Written companion for each lesson",
                "Knowledge check after every lesson",
                "Free-flow navigation, no lockstep",
                "Lifetime access & future updates",
                "14-day money-back guarantee",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 mb-3">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                  <span className="text-sm text-[#9EA7B3]">{item}</span>
                </div>
              ))}
              <div style={{ height: "1px", backgroundColor: "rgba(158,167,179,0.12)", margin: "1.5rem 0" }} />
              {ready && <EnrolButtonSmall available={available!} />}
              {available && <p className="text-xs text-[#9EA7B3] opacity-50 mt-3 text-center">Secure checkout via Stripe. One-time payment. Lifetime access.</p>}
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
              Most retail traders<br />don't lose to the market.<br />They lose to who's behind it.
            </h2>
            <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>Conventional technical analysis treats the market as a closed system of patterns — a candle here, an indicator there, a setup that either works or doesn't. It treats price as if it moved by itself.</p>
            <p className="text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>It doesn't. Price moves because participants with size move it. Most of that size belongs to a small number of institutions whose execution mechanics differ fundamentally from how retail traders are taught to think about markets. They don't enter at obvious levels. They don't telegraph their direction. They engineer the conditions they need before they execute.</p>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.8" }}>Most retail traders provide that liquidity without knowing it. Smart Money Concepts is the framework for recognising those mechanics in real time, and trading on the same side of the flow rather than against it.</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* CURRICULUM */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }} className="mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">Curriculum</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-[#F4F4F2]">Five modules. Twenty-five lessons. One coherent framework.</h2>
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
            <p className="text-[#9EA7B3] mb-5" style={{ lineHeight: "1.8" }}>Toufic Mourtada is the founder of FinVerse. He has spent over a decade studying the intersection of market structure and trader psychology — first in his own trading, then in the systems he built to teach it to others.</p>
            <p className="text-[#9EA7B3] mb-5" style={{ lineHeight: "1.8" }}>This course is the structured form of years of pattern recognition: the mechanics that consistently differentiate institutional execution from retail action, taught from first principles rather than as scattered concepts.</p>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.8" }}>The framework here is not a strategy. Strategies fail when conditions change. This is the underlying structure that lets you build, test, and adapt strategies as the markets evolve.</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />

      {/* PRICING CTA */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "#0d0f14" }}>
        <div className="px-5 mx-auto text-center" style={{ maxWidth: "640px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">Ready to start</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F4F4F2] mb-4">One payment. Permanent access.</h2>
          <p className="text-[#9EA7B3] mb-10" style={{ lineHeight: "1.7" }}>The complete framework, every lesson, every future update — for less than the cost of a single avoidable losing trade.</p>
          {available && (
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="font-serif text-6xl font-bold text-[#F4F4F2]">$199</span>
            </div>
          )}
          {ready && (
            <div className="flex flex-col items-center gap-4">
              <EnrolButtonSmall available={available!} />
              {available && <p className="text-xs text-[#9EA7B3] opacity-40">Secure checkout via Stripe. 14-day refund guarantee. No subscriptions.</p>}
            </div>
          )}
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
            This course is for educational purposes only and does not constitute financial advice. Trading carries substantial risk of loss. Past performance does not guarantee future results. Examples shown in the course are illustrative and do not represent guaranteed outcomes. Trade only with capital you can afford to lose.
          </p>
        </div>
      </section>

    </div>
  );
}
