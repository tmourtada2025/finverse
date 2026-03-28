/*
 * FinVerse Framework Page — Institutional Refinement
 * 
 * Color system: #111318, #F4F4F2, #3E5C76, #9EA7B3
 * Typography: Playfair Display headings, Inter body, line-height 1.7, max-width 720px
 * Thin line dividers only. No icon clutter.
 */

interface FrameworkSection {
  number: string;
  title: string;
  content: string[];
}

const sections: FrameworkSection[] = [
  {
    number: "01",
    title: "Liquidity Mapping",
    content: [
      "Liquidity is the fuel of institutional order flow. Every significant price move begins with a liquidity event — the engineering of stop losses, the triggering of pending orders, or the absorption of retail positioning at predictable levels.",
      "The framework identifies three primary liquidity zones: equal highs and lows (where retail stops cluster), session extremes (Asian high/low, London high/low), and structural swing points (previous break of structure levels). These zones are mapped on the 4H and daily timeframes before each trading session.",
      "Liquidity mapping is not predictive — it is preparatory. The map identifies where price is likely to be attracted, not when or how it will arrive. Execution decisions are made only after price interacts with these zones and provides structural confirmation."
    ]
  },
  {
    number: "02",
    title: "Inducement & Trap Mechanics",
    content: [
      "Inducement is the mechanism by which institutional participants engineer retail participation on the wrong side of the market. It operates through the creation of false breakouts, premature breaks of structure, and the deliberate triggering of stop losses at obvious levels.",
      "The framework classifies inducements into three categories: liquidity sweeps (price briefly exceeds a key level before reversing), false breaks of structure (a structural break that lacks displacement and is immediately reclaimed), and time-based traps (moves that occur during low-volatility sessions and reverse during high-volatility sessions).",
      "Recognizing inducement requires patience and the discipline to wait for confirmation. The sweep itself is not the signal — the structural shift that follows the sweep is the confirmation. This distinction separates reactive trading from anticipatory positioning."
    ]
  },
  {
    number: "03",
    title: "Structural Rhythm Integration",
    content: [
      "Classical market structure provides the temporal framework for directional bias. The sequence of higher highs and higher lows defines a bullish trend; lower highs and lower lows define a bearish trend. Breaks of structure (BOS) and changes of character (ChoCH) signal transitions between these states.",
      "The hybrid framework integrates classical structure with Smart Money Concepts by using structure to define bias and SMC to define entry. The daily and 4H timeframes establish the structural bias, while the 15-minute and 5-minute timeframes provide the execution context within that bias.",
      "Structural rhythm is not about individual candles — it is about the sequence. A single bullish candle within a bearish structure does not change the bias. The framework requires a confirmed break of the most recent swing point, with displacement, to signal a legitimate structural shift."
    ]
  },
  {
    number: "04",
    title: "Session Timing & Volatility Windows",
    content: [
      "Not all hours are equal. The framework identifies three primary volatility windows: the London open (07:00–09:00 GMT), the New York open (13:00–15:00 GMT), and the London–New York overlap (13:00–16:00 GMT). These windows provide the institutional participation necessary for clean structural breaks and sustained directional moves.",
      "The Asian session (00:00–07:00 GMT) serves a different function within the framework — it is the accumulation phase where liquidity pools are built. The ranges established during the Asian session become the targets for London and New York sessions. Trading during the Asian session is generally avoided unless specific criteria are met.",
      "Session timing acts as a filter, not a signal. A valid structural setup that occurs outside the optimal volatility window is not automatically invalid, but it requires additional confirmation and reduced position sizing. The framework's session rules are probabilistic, not absolute."
    ]
  },
  {
    number: "05",
    title: "Risk Architecture Discipline",
    content: [
      "Risk architecture is the non-negotiable foundation of the framework. Without disciplined risk management, even the most accurate structural analysis becomes irrelevant. The framework defines risk at three levels: per-trade risk (maximum 1% of account equity), per-session risk (maximum 2%), and per-week risk (maximum 4%).",
      "Position sizing is graduated based on setup quality. Full confluence setups (HTF bias + LTF BOS + FVG entry + session timing alignment) warrant 1% risk. Partial confluence setups warrant 0.5% risk. Counter-trend setups are capped at 0.3% regardless of confluence. This graduated approach ensures that capital allocation reflects probability.",
      "The framework also defines mandatory rest periods: after two consecutive losses, no trading for the remainder of the session. After three consecutive losses, no trading for the remainder of the day. After a 3% weekly drawdown, risk is reduced to 0.5% maximum per trade for the following week. These rules are mechanical, not discretionary."
    ]
  }
];

export default function Framework() {
  return (
    <div style={{ backgroundColor: "#111318" }}>
      {/* Header */}
      <section className="py-24 md:py-32">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div style={{ maxWidth: "720px" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9EA7B3] mb-6">
              The Framework
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-6">
              Hybrid Institutional<br />
              Market Structure
            </h1>
            <p className="text-[#9EA7B3]" style={{ lineHeight: "1.7", maxWidth: "600px" }}>
              A systematic approach integrating Smart Money Concepts, classical technical 
              rhythm, and risk architecture into a unified execution framework.
            </p>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Framework Sections */}
      {sections.map((section, index) => (
        <section key={section.number} className="py-20 md:py-24">
          <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
              {/* Section Number */}
              <div className="lg:col-span-3">
                <span
                  className="font-serif text-7xl md:text-8xl font-bold"
                  style={{ color: "#3E5C76", opacity: 0.2 }}
                >
                  {section.number}
                </span>
              </div>

              {/* Content */}
              <div className="lg:col-span-9" style={{ maxWidth: "720px" }}>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F4F4F2] mb-8">
                  {section.title}
                </h2>
                {section.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[#9EA7B3] mb-6 last:mb-0"
                    style={{ lineHeight: "1.7" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Thin divider between sections */}
          {index < sections.length - 1 && (
            <div className="px-5 mx-auto mt-20" style={{ maxWidth: "1200px" }}>
              <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
