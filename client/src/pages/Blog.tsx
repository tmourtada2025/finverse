/*
 * FinVerse Journal Page — Institutional Refinement
 * 
 * Title: "Market Structure Journal"
 * Color system: #111318, #F4F4F2, #3E5C76, #9EA7B3
 * Research archive feel. Improved spacing. Reduced metadata clutter.
 */

import { useState } from "react";
import { Link } from "wouter";
import { articles, type ArticleCategory } from "@/lib/articles";
import { ArrowRight } from "lucide-react";

const CATEGORIES: (ArticleCategory | "All")[] = ["All", "Structure", "Macro", "Psychology"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | "All">("All");

  const filtered = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div style={{ backgroundColor: "#111318" }}>
      {/* Header */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">
              The Journal
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-6">
              Market Structure<br />
              Journal
            </h1>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7", maxWidth: "600px" }}>
              Detailed breakdowns of market structure, institutional order flow, 
              and risk architecture applied to live market conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Filters + Articles */}
      <section className="py-16 md:py-20">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          {/* Category Filter */}
          <div className="flex items-center gap-8 mb-14">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="text-sm font-medium tracking-wide transition-colors"
                style={{
                  color: activeCategory === cat ? "#3E5C76" : "#9EA7B3",
                  opacity: activeCategory === cat ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat) e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat) e.currentTarget.style.opacity = "0.6";
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Article List */}
          <div>
            {filtered.map((article, index) => (
              <div key={article.slug}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="group grid md:grid-cols-12 gap-6 md:gap-10 py-10"
                >
                  {/* Thumbnail */}
                  <div className="md:col-span-4 lg:col-span-3">
                    <div className="aspect-[16/10] overflow-hidden" style={{ backgroundColor: "#1a1d24" }}>
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#3E5C76]">
                        {article.category}
                      </span>
                      <span className="text-[#9EA7B3] opacity-30">|</span>
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9EA7B3]">
                        {article.date}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#F4F4F2] group-hover:text-[#3E5C76] transition-colors leading-snug mb-3">
                      {article.title}
                    </h2>
                    <p className="text-sm text-[#9EA7B3] leading-relaxed line-clamp-2" style={{ maxWidth: "640px" }}>
                      {article.excerpt}
                    </p>
                  </div>
                </Link>

                {index < filtered.length - 1 && (
                  <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-[#9EA7B3] text-center py-16">
              No articles in this category yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
