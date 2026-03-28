/*
 * FinVerse Resources Page — Institutional Refinement
 * 
 * Color system: #111318, #F4F4F2, #3E5C76, #9EA7B3
 * Minimal curated external links only. No widgets, no feeds, no tickers.
 */

import { ArrowUpRight } from "lucide-react";

interface Resource {
  name: string;
  description: string;
  url: string;
  category: string;
}

const resources: Resource[] = [
  {
    name: "TradingView",
    description: "Advanced charting platform for multi-timeframe structural analysis. The primary tool for liquidity mapping and structural rhythm identification.",
    url: "https://www.tradingview.com",
    category: "Charting"
  },
  {
    name: "Forex Factory Calendar",
    description: "Comprehensive economic calendar for session timing and volatility window planning. Essential for identifying high-impact events that affect institutional order flow.",
    url: "https://www.forexfactory.com/calendar",
    category: "Economic Data"
  },
  {
    name: "Investing.com Economic Calendar",
    description: "Detailed economic event calendar with historical data and consensus forecasts. Useful for macro regime analysis and session preparation.",
    url: "https://www.investing.com/economic-calendar",
    category: "Economic Data"
  },
  {
    name: "Federal Reserve Economic Data (FRED)",
    description: "Comprehensive database of economic data from the Federal Reserve Bank of St. Louis. Primary source for macro research and regime identification.",
    url: "https://fred.stlouisfed.org",
    category: "Macro Research"
  },
  {
    name: "Bank for International Settlements",
    description: "Research and data from the central bank of central banks. Institutional-grade analysis of global financial markets and monetary policy.",
    url: "https://www.bis.org",
    category: "Macro Research"
  },
  {
    name: "CME FedWatch Tool",
    description: "Market-implied probabilities for Federal Reserve interest rate decisions. Critical for understanding macro positioning and institutional sentiment.",
    url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html",
    category: "Macro Research"
  }
];

const categories = Array.from(new Set(resources.map((r) => r.category)));

export default function Resources() {
  return (
    <div style={{ backgroundColor: "#111318" }}>
      {/* Header */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">
              Resources
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-8">
              Curated Tools &<br />
              Reference Materials
            </h1>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7", maxWidth: "600px" }}>
              A minimal selection of external tools and data sources used within 
              the hybrid framework. Each resource serves a specific function in 
              the analysis process.
            </p>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Resources by Category */}
      {categories.map((category) => (
        <section key={category} className="py-16 md:py-20">
          <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-8">
              {category}
            </p>
            <div>
              {resources
                .filter((r) => r.category === category)
                .map((resource, index, arr) => (
                  <div key={resource.name}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-6 py-6"
                    >
                      <div style={{ maxWidth: "640px" }}>
                        <h4 className="font-serif text-lg font-bold text-[#F4F4F2] group-hover:text-[#3E5C76] transition-colors mb-2">
                          {resource.name}
                        </h4>
                        <p className="text-sm text-[#9EA7B3]" style={{ lineHeight: "1.7" }}>
                          {resource.description}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-[#9EA7B3] opacity-40 group-hover:opacity-100 group-hover:text-[#3E5C76] transition-all mt-1 shrink-0"
                      />
                    </a>
                    {index < arr.length - 1 && (
                      <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.1 }} />
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="px-5 mx-auto mt-4" style={{ maxWidth: "1200px" }}>
            <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
          </div>
        </section>
      ))}

      {/* Disclaimer */}
      <section className="py-12">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <p className="text-xs text-[#9EA7B3] opacity-50" style={{ maxWidth: "640px" }}>
            These resources are provided for reference only. FinVerse has no affiliation 
            with any of the listed platforms or organizations. Always conduct your own 
            due diligence before using any tool or data source for trading decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
