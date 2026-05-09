/*
 * FinVerse Education Page — /education
 * Both course cards respect is_published from Supabase
 * SMC migrated from Udemy referral to native FinVerse course card (V1 launch)
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, BarChart2, Brain } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SMC_SLUG = "smc-complete-guide";
const BLUEPRINT_SLUG = "traders-financial-blueprint";

type CourseAvailability = {
  is_published: boolean | null;
  published_at: string | null;
};

function isWithin90Days(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const publishedDate = new Date(publishedAt);
  const now = new Date();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return now.getTime() - publishedDate.getTime() <= ninetyDaysMs;
}

export default function Education() {
  const [smc, setSmc] = useState<CourseAvailability | null>(null)
  const [blueprint, setBlueprint] = useState<CourseAvailability | null>(null)
  const [pipeline, setPipeline] = useState<any[]>([])
  const [publishedTitles, setPublishedTitles] = useState<string[]>([])

  useEffect(() => {
    supabase.from('courses').select('is_published, published_at').eq('slug', SMC_SLUG).single()
      .then(({ data }) => setSmc(data as CourseAvailability ?? { is_published: false, published_at: null }))

    supabase.from('courses').select('is_published, published_at').eq('slug', BLUEPRINT_SLUG).single()
      .then(({ data }) => setBlueprint(data as CourseAvailability ?? { is_published: false, published_at: null }))

    supabase.from('courses').select('title').eq('is_published', true)
      .then(({ data }) => setPublishedTitles((data || []).map((c: any) => c.title.toLowerCase())))

    supabase.from('pipeline').select('*').order('position').limit(3)
      .then(({ data }) => setPipeline(data || []))
  }, [])

  const ready = smc !== null && blueprint !== null
  const smcAvailable = smc?.is_published ?? false
  const blueprintAvailable = blueprint?.is_published ?? false
  const smcShowNew = smcAvailable && isWithin90Days(smc?.published_at ?? null)
  const blueprintShowNew = blueprintAvailable && isWithin90Days(blueprint?.published_at ?? null)

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

            {/* SMC — FinVerse, respects publish status */}
            <div className="flex flex-col" style={{
              backgroundColor: "rgba(62,92,118,0.06)",
              border: "1px solid rgba(62,92,118,0.3)",
            }}>
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: "rgba(62,92,118,0.15)", border: "1px solid rgba(62,92,118,0.25)" }}>
                      <BarChart2 size={16} style={{ color: "#3E5C76" }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-60">Market Structure</p>
                      <span className="text-[9px] font-medium uppercase tracking-[0.1em] px-1.5 py-0.5" style={{ backgroundColor: "rgba(62,92,118,0.15)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.25)" }}>FinVerse</span>
                    </div>
                  </div>
                  {ready && smcShowNew && (
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1" style={{ backgroundColor: "rgba(62,92,118,0.2)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.3)" }}>New</span>
                  )}
                  {ready && !smcAvailable && (
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1" style={{ backgroundColor: "rgba(158,167,179,0.08)", color: "#9EA7B3", border: "1px solid rgba(158,167,179,0.2)" }}>Coming Soon</span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#F4F4F2] mb-2 leading-snug">SMC: The Complete Guide to Smart Trading</h2>
                <p className="text-xs text-[#9EA7B3] opacity-60 mb-4 uppercase tracking-[0.08em]">Smart Money Concepts — Institutional Order Flow</p>
                <p className="text-sm text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>The complete technical framework for independent traders. Read institutional order flow, identify liquidity engineering in real time, and trade with the smart money instead of becoming their liquidity.</p>
                <div className="mb-6">
                  {[
                    "Five-module structural framework, twenty-five lessons",
                    "Order blocks, fair value gaps, liquidity grabs",
                    "Multi-timeframe execution from first principles",
                    "Precision entries, stop placement, trade management",
                    "Risk architecture and position sizing",
                    "HD video, written reference, knowledge checks",
                  ].map((h) => (
                    <div key={h} className="flex items-start gap-2.5 mb-2.5">
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                      <span className="text-xs text-[#9EA7B3]" style={{ lineHeight: "1.6" }}>{h}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {[["Level","Beginner → Advanced"],["Format","5 Modules"],["Price", smcAvailable ? "$199 · One-time" : "—"]].map(([label, val], i) => (
                    <div key={label} className="flex items-center gap-4">
                      {i > 0 && <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(158,167,179,0.15)" }} />}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#9EA7B3] opacity-40 mb-0.5">{label}</p>
                        <p className="text-xs text-[#9EA7B3]">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-8 py-5" style={{ borderTop: "1px solid rgba(158,167,179,0.08)" }}>
                {!ready ? null : smcAvailable ? (
                  <Link href="/courses/smc-complete-guide"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors"
                    style={{ backgroundColor: "#3E5C76" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
                    View Course — $199 <ArrowRight size={13} />
                  </Link>
                ) : (
                  <div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: "#3E5C76" }}>
                      Launching Soon
                    </div>
                    <p className="text-xs text-[#9EA7B3] opacity-50 mt-3">
                      Coming soon. Check back or{" "}
                      <a href="mailto:support@finverse.world" className="underline">contact us</a>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Blueprint — FinVerse, respects publish status */}
            <div className="flex flex-col" style={{
              backgroundColor: "rgba(62,92,118,0.06)",
              border: "1px solid rgba(62,92,118,0.3)",
            }}>
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: "rgba(62,92,118,0.15)", border: "1px solid rgba(62,92,118,0.25)" }}>
                      <Brain size={16} style={{ color: "#3E5C76" }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-60">Personal Finance</p>
                      <span className="text-[9px] font-medium uppercase tracking-[0.1em] px-1.5 py-0.5" style={{ backgroundColor: "rgba(62,92,118,0.15)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.25)" }}>FinVerse</span>
                    </div>
                  </div>
                  {ready && blueprintShowNew && (
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1" style={{ backgroundColor: "rgba(62,92,118,0.2)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.3)" }}>New</span>
                  )}
                  {ready && !blueprintAvailable && (
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1" style={{ backgroundColor: "rgba(158,167,179,0.08)", color: "#9EA7B3", border: "1px solid rgba(158,167,179,0.2)" }}>Coming Soon</span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#F4F4F2] mb-2 leading-snug">The Trader's Financial Blueprint</h2>
                <p className="text-xs text-[#9EA7B3] opacity-60 mb-4 uppercase tracking-[0.08em]">Capital Structure · Income Architecture · Financial Sovereignty</p>
                <p className="text-sm text-[#9EA7B3] mb-6" style={{ lineHeight: "1.8" }}>Most traders spend years learning how to read markets. Almost none learn what to do with the money those markets generate. Eight focused modules covering everything outside the chart.</p>
                <div className="mb-6">
                  {["Separating trading capital from personal finances","Income streams that survive drawdown periods","Tax obligations and entity structuring","Risk of ruin applied to your full financial life","Wealth building alongside active trading","Lifetime access and downloadable frameworks"].map((h) => (
                    <div key={h} className="flex items-start gap-2.5 mb-2.5">
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#3E5C76" }} />
                      <span className="text-xs text-[#9EA7B3]" style={{ lineHeight: "1.6" }}>{h}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {[["Level","All Levels"],["Format","8 Modules"],["Price", blueprintAvailable ? "$147 · One-time" : "—"]].map(([label, val], i) => (
                    <div key={label} className="flex items-center gap-4">
                      {i > 0 && <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(158,167,179,0.15)" }} />}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#9EA7B3] opacity-40 mb-0.5">{label}</p>
                        <p className="text-xs text-[#9EA7B3]">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-8 py-5" style={{ borderTop: "1px solid rgba(158,167,179,0.08)" }}>
                {!ready ? null : blueprintAvailable ? (
                  <Link href="/blueprint"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors"
                    style={{ backgroundColor: "#3E5C76" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4d6d87")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5C76")}>
                    View Course — $147 <ArrowRight size={13} />
                  </Link>
                ) : (
                  <div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-white opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: "#3E5C76" }}>
                      Launching Soon
                    </div>
                    <p className="text-xs text-[#9EA7B3] opacity-50 mt-3">
                      Temporarily unavailable. Check back soon or{" "}
                      <a href="mailto:support@finverse.world" className="underline">contact us</a>.
                    </p>
                  </div>
                )}
              </div>
            </div>

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
            {(() => {
              const visible = pipeline
                .filter(c => !publishedTitles.includes(c.title.toLowerCase()))
                .slice(0, 3)
              const slots = [...visible]
              while (slots.length < 3) slots.push(null)
              return slots.map((course, i) => (
                <div key={course?.id || `empty-${i}`} style={{ backgroundColor: "rgba(158,167,179,0.02)", border: "1px solid rgba(158,167,179,0.08)", padding: "1.75rem", minHeight: "140px", display: "flex", flexDirection: "column" as const, justifyContent: course ? "flex-start" : "center", alignItems: course ? "flex-start" : "center" }}>
                  {course ? (
                    <>
                      <div className="flex items-center justify-between w-full mb-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9EA7B3] opacity-50">{course.category}</p>
                        <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5" style={{ color: "rgba(158,167,179,0.4)", border: "1px solid rgba(158,167,179,0.12)" }}>{course.status}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-[#F4F4F2] mb-3 leading-snug">{course.title}</h4>
                      <p className="text-xs text-[#9EA7B3] opacity-60" style={{ lineHeight: "1.7" }}>{course.description}</p>
                    </>
                  ) : (
                    <p className="text-xs text-[#9EA7B3] opacity-30 text-center">Coming soon —<br />check back for updates.</p>
                  )}
                </div>
              ))
            })()}
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
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3E5C76"; e.currentTarget.style.color = "#ffffff" }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#3E5C76" }}>
              Join the List <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
