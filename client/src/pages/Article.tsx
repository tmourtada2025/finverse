/*
 * FinVerse Single Article Template — Institutional Refinement
 * 
 * Color system: #111318, #F4F4F2, #3E5C76, #9EA7B3
 * Single-column reading layout. Max-width 720px. Line-height 1.7.
 */

import { useParams, Link, Redirect } from "wouter";
import { getArticleBySlug } from "@/lib/articles";
import { ArrowLeft } from "lucide-react";

interface ArticleSectionProps {
  label: string;
  title: string;
  content: string;
}

function ArticleSection({ label, title, content }: ArticleSectionProps) {
  return (
    <div className="mb-16">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
        {label}
      </p>
      <h2 className="font-serif text-xl md:text-2xl font-bold text-[#F4F4F2] mb-6">{title}</h2>
      <p className="text-[#9EA7B3] text-base" style={{ lineHeight: "1.7" }}>
        {content}
      </p>
    </div>
  );
}

export default function Article() {
  const params = useParams<{ slug: string }>();
  const article = getArticleBySlug(params.slug || "");

  if (!article) {
    return <Redirect to="/404" />;
  }

  return (
    <div style={{ backgroundColor: "#111318" }}>
      {/* Article Header */}
      <section className="pt-16 md:pt-24 pb-12">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="mx-auto" style={{ maxWidth: "720px" }}>
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#9EA7B3] hover:text-[#3E5C76] transition-colors mb-10"
            >
              <ArrowLeft size={14} />
              Back to Journal
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#3E5C76]">
                {article.category}
              </span>
              <span className="text-[#9EA7B3] opacity-30">|</span>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9EA7B3]">
                {article.date}
              </span>
              <span className="text-[#9EA7B3] opacity-30">|</span>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9EA7B3]">
                {article.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-8">
              {article.title}
            </h1>

            {/* Thumbnail */}
            <div className="aspect-[16/9] overflow-hidden mb-4" style={{ backgroundColor: "#1a1d24" }}>
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "720px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Article Body */}
      <section className="py-16 md:py-20">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="mx-auto" style={{ maxWidth: "720px" }}>
            {/* Intro */}
            <div className="mb-16">
              <p className="text-[#F4F4F2] text-lg" style={{ lineHeight: "1.8" }}>
                {article.content.intro}
              </p>
            </div>

            <ArticleSection
              label="Higher Timeframe"
              title="HTF Analysis"
              content={article.content.htfAnalysis}
            />

            <ArticleSection
              label="Intraday"
              title="Intraday Narrative"
              content={article.content.intradayNarrative}
            />

            <ArticleSection
              label="Confirmation"
              title="Structural Confirmation"
              content={article.content.structuralConfirmation}
            />

            <ArticleSection
              label="Risk Management"
              title="Risk Architecture Commentary"
              content={article.content.riskArchitecture}
            />

            {/* Thin divider */}
            <div className="mb-16" style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />

            {/* Lessons */}
            <div style={{ borderLeft: "2px solid #3E5C76", paddingLeft: "2rem" }}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-3">
                Takeaway
              </p>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#F4F4F2] mb-6">Lessons</h2>
              <p className="text-[#F4F4F2] text-base" style={{ lineHeight: "1.8" }}>
                {article.content.lessons}
              </p>
            </div>

            {/* Udemy reference */}
            <div className="mt-20 pt-12" style={{ borderTop: "1px solid rgba(158,167,179,0.15)" }}>
              <p className="text-xs text-[#9EA7B3] opacity-60">
                For a structured curriculum covering these concepts, see the{" "}
                <a
                  href="https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3E5C76] hover:underline"
                >
                  Smart Money Trading Course
                </a>{" "}
                on Udemy.
              </p>
            </div>

            {/* Navigation */}
            <div className="mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-[#3E5C76] hover:text-[#9EA7B3] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Journal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
