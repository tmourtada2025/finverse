/*
 * FinVerse Resources Page
 *
 * Sections:
 * 1. Header
 * 2. Recommended Brokers (IB section — contextual, disclosed)
 * 3. Charting & Analysis
 * 4. Macro & Institutional Data
 * 5. IB Disclosure
 */

import { useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";

interface Resource {
  name: string;
  description: string;
  url: string;
  category: string;
}

interface Broker {
  name: string;
  type: string;
  description: string;
  strengths: string[];
  url: string;
}

const brokers: Broker[] = [
  {
    name: "Windsor Brokers",
    type: "ECN/STP",
    description: "Regulated broker with competitive spreads on FX majors and indices. Suitable for SMC traders running intraday setups on EUR/USD, GBP/USD, and US30. Strong execution during London and New York sessions.",
    strengths: ["Competitive FX spreads", "MT4/MT5 platforms", "Regulated CySEC/FSA", "No dealing desk"],
    url: "https://sc.myuserhub.com?pt=27777",
    affiliate: true
  },
  {
    name: "One Royal",
    type: "ECN/STP",
    description: "Multi-regulated broker offering ECN execution on FX and CFDs. Transparent pricing with no hidden fees. Suitable for SMC traders who require reliable order execution across multiple asset classes including FX majors, minors, and indices.",
    strengths: ["Multi-regulated", "ECN execution", "MT4/MT5 platforms", "FX, indices, commodities"],
    url: "https://vc.cabinet.oneroyal.com/links/go/3952",
    affiliate: true
  },
  {
    name: "Taurex",
    type: "ECN",
    description: "ECN broker with competitive spreads and fast execution. Strong offering on FX majors and minors with transparent cost structure. Suitable for active structural traders looking for a regulated ECN environment with direct market access.",
    strengths: ["ECN direct access", "Transparent pricing", "MT4/MT5 platforms", "Regulated IFSC/FSA"],
    url: "https://global.mytaurex.com/live_signup?sidc=633BB30A-0954-47D4-82BE-32CF66627B91",
    affiliate: true
  },
  {
    name: "Equiti",
    type: "ECN/STP",
    description: "Multi-asset broker with a strong presence across MENA and international markets. Competitive spreads on FX and CFDs with reliable execution infrastructure. Suitable for traders looking for a regulated environment with broad instrument coverage including FX, indices, and commodities.",
    strengths: ["MENA-regulated", "Broad instrument coverage", "MT4/MT5 platforms", "Regulated FCA/CySEC"],
    url: "https://www.equiti-me.com/sc-en/?clickid=19833&affid=C01175584",
    affiliate: true
  }
];

const resources: Resource[] = [
  {
    name: "TradingView",
    description: "Primary charting platform for multi-timeframe structural analysis. The Premium tier enables the multi-monitor, multi-chart workflows required for serious institutional-style analysis. Pine Script environment supports custom SMC indicator development.",
    url: "https://www.tradingview.com/?aff_id=139305",
    category: "Charting & Analysis"
  },
  {
    name: "MultiCharts",
    description: "Professional charting and automated trading platform used by serious discretionary and systematic traders. Industry-grade backtesting environment, broker-neutral execution, and multi-broker compatibility. The choice for traders who have outgrown retail-tier platforms.",
    url: "https://www.multicharts.com",
    category: "Charting & Analysis"
  },
  {
    name: "NinjaTrader",
    description: "Institutional-grade futures and forex platform with advanced order flow analytics and depth-of-market visualization. Strong fit for traders who work with US30, NAS100, and other index futures alongside spot FX. Robust strategy backtesting and automation capabilities.",
    url: "https://ninjatrader.com",
    category: "Charting & Analysis"
  },
  {
    name: "Bookmap",
    description: "Order flow and liquidity heatmap visualization in real time. Particularly relevant for SMC practitioners studying institutional positioning at key structural levels. Free tier covers basics; paid tiers unlock the full liquidity heatmap and advanced order flow tools — the depth that separates structural analysis from intuition.",
    url: "https://bookmap.com",
    category: "Charting & Analysis"
  },
  {
    name: "Trading Economics",
    description: "Country-level economic dashboards and forecasts across 196 economies. Primary research source for macro regime identification and the cross-asset context that shapes structural bias. Free tier is functional; the paid subscription unlocks deep historical data and API access.",
    url: "https://tradingeconomics.com",
    category: "Macro & Institutional Data"
  },
  {
    name: "Federal Reserve Economic Data (FRED)",
    description: "The Federal Reserve Bank of St. Louis economic data infrastructure. The primary source for US macro data and regime identification. If you cite a macro statistic in serious analysis, this is where the number originates.",
    url: "https://fred.stlouisfed.org",
    category: "Macro & Institutional Data"
  },
  {
    name: "CFTC Commitment of Traders",
    description: "Weekly institutional positioning data across futures markets. The non-commercial (large speculator) net positions provide directional bias context for weekly SMC structural analysis. Public data, underused by retail, foundational for serious traders.",
    url: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm",
    category: "Macro & Institutional Data"
  },
  {
    name: "CME FedWatch Tool",
    description: "Market-implied probabilities for Federal Reserve interest rate decisions, derived from Fed Funds futures pricing. Critical for understanding macro positioning and institutional sentiment ahead of FOMC events. Reads the rate expectations curve the way institutions actually price it.",
    url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html",
    category: "Macro & Institutional Data"
  }
];

const toolCategories = Array.from(new Set(resources.map((r) => r.category)));

export default function Resources() {
  const [showDisclosure, setShowDisclosure] = useState(false);
  return (
    <div style={{ backgroundColor: "#111318" }}>
      <SEO
        title="Resources"
        description="Recommended brokers, charting platforms, and macro data sources for SMC practitioners. Curated tools for serious independent traders."
        canonical="/resources"
      />
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
              A curated selection of brokers, charting platforms, and data sources that support the hybrid framework. Each recommendation reflects actual use within the analysis and execution process.
            </p>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* ===== BROKER SECTION ===== */}
      <section className="py-16 md:py-24">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3]">
              Recommended Brokers
            </p>
            <div style={{ position: "relative" }}>
              <span
                onMouseEnter={() => setShowDisclosure(true)}
                onMouseLeave={() => setShowDisclosure(false)}
                style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 8px", cursor: "help", userSelect: "none", backgroundColor: "rgba(62,92,118,0.15)", color: "#3E5C76", border: "1px solid rgba(62,92,118,0.3)" }}
              >
                Affiliate Disclosure ⓘ
              </span>
              {showDisclosure && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "320px", zIndex: 100 }}>
                  <div style={{ backgroundColor: "#15181f", border: "1px solid rgba(158,167,179,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", padding: "1rem 1.25rem" }}>
                    <p style={{ fontSize: "11px", color: "#9EA7B3", lineHeight: "1.75", opacity: 0.8, margin: 0 }}>
                      FinVerse participates in Introducing Broker (IB) programs with certain brokers listed on this page. When you open a trading account using a link from this site, FinVerse may receive compensation in the form of commission per lot traded. This does not affect the cost of your account, the spreads you are offered, or any other terms. Recommendations are based on execution quality, regulatory standing, and suitability for SMC-based trading strategies. Conduct your own due diligence before opening any account. Trading foreign exchange and derivatives involves substantial risk of loss and is not appropriate for all investors. Past performance is not indicative of future results.
                    </p>
                  </div>
                  <div style={{ position: "absolute", right: "12px", top: "-5px", width: "10px", height: "10px", backgroundColor: "#15181f", borderTop: "1px solid rgba(158,167,179,0.2)", borderLeft: "1px solid rgba(158,167,179,0.2)", transform: "rotate(45deg)" }} />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-[#9EA7B3] opacity-60 mb-12 mt-3" style={{ maxWidth: "640px" }}>
            The brokers below are selected based on execution quality relevant to SMC trading. FinVerse receives compensation through Introducing Broker (IB) agreements when you open an account using the links on this page. This does not change the recommendations — these are brokers I use or have rigorously evaluated.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {brokers.map((broker) => (
              <div
                key={broker.name}
                className="flex flex-col"
                style={{
                  backgroundColor: "rgba(158,167,179,0.04)",
                  border: "1px solid rgba(158,167,179,0.12)",
                  padding: "1.75rem"
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#F4F4F2] mb-1">
                      {broker.name}
                    </h3>
                    <span
                      className="text-[10px] font-medium uppercase tracking-[0.1em]"
                      style={{ color: "#3E5C76" }}
                    >
                      {broker.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#9EA7B3] mb-5 flex-1" style={{ lineHeight: "1.7" }}>
                  {broker.description}
                </p>

                <div className="mb-6">
                  {broker.strengths.map((s) => (
                    <div key={s} className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "#3E5C76" }}
                      />
                      <span className="text-xs text-[#9EA7B3]">{s}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={broker.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium tracking-wide transition-colors"
                  style={{ border: "1px solid #3E5C76", color: "#3E5C76" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#3E5C76";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#3E5C76";
                  }}
                >
                  Open Account
                  <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Tools & Data by Category */}
      {toolCategories.map((category) => (
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

      {/* Full IB Disclosure */}
      <section className="py-12">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-4 opacity-60">
            Affiliate & IB Disclosure
          </p>
          <p className="text-xs text-[#9EA7B3] opacity-50" style={{ maxWidth: "680px", lineHeight: "1.8" }}>
            FinVerse participates in Introducing Broker (IB) programs with certain brokers listed on this page. When you open a trading account using a link from this site, FinVerse may receive compensation in the form of commission per lot traded. This compensation does not affect the cost of your account, the spreads you are offered, or any other terms. Recommendations are based on execution quality, regulatory standing, and suitability for SMC-based trading strategies. You should conduct your own due diligence before opening any account. Trading foreign exchange and derivatives involves substantial risk of loss and is not appropriate for all investors. Past performance is not indicative of future results.
          </p>
        </div>
      </section>
    </div>
  );
}
