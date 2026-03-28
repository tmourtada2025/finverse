/*
 * FinVerse Article Data
 * Static article data for the blog system.
 * Categories: Structure, Macro, Psychology
 */

export type ArticleCategory = "Structure" | "Macro" | "Psychology";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  date: string;
  readTime: string;
  thumbnail: string;
  content: {
    intro: string;
    htfAnalysis: string;
    intradayNarrative: string;
    structuralConfirmation: string;
    riskArchitecture: string;
    lessons: string;
  };
}

const CHART_1 = "https://private-us-east-1.manuscdn.com/sessionFile/feCh4CM4AAJJxZhdsCxOxr/sandbox/uxzclZHkFL47M3ji1YrWWH-img-1_1771418982000_na1fn_Y2hhcnQtdGh1bWJuYWlsLTE.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZmVDaDRDTTRBQUpKeFpoZHNDeE94ci9zYW5kYm94L3V4emNsWkhrRkw0N00zamkxWXJXV0gtaW1nLTFfMTc3MTQxODk4MjAwMF9uYTFmbl9ZMmhoY25RdGRHaDFiV0p1WVdsc0xURS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=UeKwZJdnaQA2YX1p5f0NuTBnliMvhCHPgCXJBdrjo6as1eP746deo3YCtYncOmD45qsKh5tpFJXxV4oTpskU-Gw726A4Z49nlrvDIUlipnhrND4hZAyVf6jMmx-H1J9yYrIQKCTNTWprYelP-3-zU7A2kf7s4bPAaJTZvLvQAC8hlC7PQlfRUec1dL52h0RGgpDFdUgBe6jhhgix0LDInofZCoZ~HpONAtdqygmHMeCLQsuK~-ePD~od9PeCt2rK~guDifCPQHtLvBK2mIxJ5ZPp6zVnmHuyY66V-24JuAbUtdXD-iMTkLm6q0tl0uefYARIlSYzV-SPmi52qmDk9w__";
const CHART_2 = "https://private-us-east-1.manuscdn.com/sessionFile/feCh4CM4AAJJxZhdsCxOxr/sandbox/uxzclZHkFL47M3ji1YrWWH-img-2_1771418968000_na1fn_Y2hhcnQtdGh1bWJuYWlsLTI.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZmVDaDRDTTRBQUpKeFpoZHNDeE94ci9zYW5kYm94L3V4emNsWkhrRkw0N00zamkxWXJXV0gtaW1nLTJfMTc3MTQxODk2ODAwMF9uYTFmbl9ZMmhoY25RdGRHaDFiV0p1WVdsc0xUSS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=vzm4UryREstb-hVLv6q5P-5bGxtP9hGx9nAqVMi0dKfp8RRHAHIYJxL34nMXNvbYMvCvkrU3agE0OmQQkxTgYiyjjFnrBQ02n8RCKHZtQVlLKguROdRgPpZxw2NZVX6Br6~txLXfgebqVQsHM~VTp800e0nlGqp5KQnA0plqYVcGAIjgMuTPOejEllkPkQta-VtffZzxdujq9uLXb3YpCej1CY90TsD~qrdMcv0tRUN-~7pOl6WgU3CqRx-GX1ejMzSIg0EoRK2VTT2V3TxuSAuf4C0zPeraQZJ1aCK-a~YdPa4nvYSZRBFlSAq2HhGHeZ8FKUTTIu3k6e1Vzm9wFg__";
const CHART_3 = "https://private-us-east-1.manuscdn.com/sessionFile/feCh4CM4AAJJxZhdsCxOxr/sandbox/uxzclZHkFL47M3ji1YrWWH-img-3_1771418968000_na1fn_Y2hhcnQtdGh1bWJuYWlsLTM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZmVDaDRDTTRBQUpKeFpoZHNDeE94ci9zYW5kYm94L3V4emNsWkhrRkw0N00zamkxWXJXV0gtaW1nLTNfMTc3MTQxODk2ODAwMF9uYTFmbl9ZMmhoY25RdGRHaDFiV0p1WVdsc0xUTS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=N7HBv~knS8RuXKBXEYgzrgdxQ2E8SPkZjBr9p-VeskG8vwz8DdmYLnKc0U8xbKZXGKb4-1nvev7GanmfDsvXNJdAA45v6EZIgn-F9siD2mliEk13YtUziyVc0CtwJV0CTvPpUm-UuWM3LSvy~8gBegw1aZPPZ0PWpWRuMLbsyJxlRRKK4adGoWL7Z~rXbCwqmQ1k62aQ-n5VvoEjQ3SbgUlep~eI8ErFDtrtdrY6wG41geqkSvOEeIwKxt3Xc3zbNEj6gO5fIiXTIP8woLfmXjtOkDziAPO8fwl06bstbZVB35lEebeLBBti9Zbi-D0dUGtxkfOpUR62az5YkrnrlA__";

export const articles: Article[] = [
  {
    slug: "liquidity-sweep-eurusd-october",
    title: "Liquidity Sweep and Structural Shift on EUR/USD",
    excerpt: "A detailed breakdown of the October liquidity sweep below the Asian session low, the subsequent displacement candle, and the structural shift that confirmed a bullish continuation on the 4H timeframe.",
    category: "Structure",
    date: "2026-01-15",
    readTime: "8 min",
    thumbnail: CHART_1,
    content: {
      intro: "The EUR/USD pair presented a textbook liquidity sweep scenario during the London session on October 25th. Price had been consolidating within a well-defined range for three sessions, building equal lows beneath the Asian session low — a classic inducement pattern that institutional order flow frequently targets before initiating directional moves.",
      htfAnalysis: "On the daily timeframe, EUR/USD was trading within a broader bullish structure, having established a series of higher lows since early October. The weekly order block at 1.0520 had been respected, and the daily bias remained bullish above this level. The 4H chart showed a clear accumulation phase with three distinct touches of the range low, each creating a pool of sell-side liquidity below 1.0540.",
      intradayNarrative: "During the London session, price drove below the Asian low at 1.0538, triggering the clustered stop losses. The displacement candle that followed — a strong bullish engulfing with minimal upper wick — confirmed the sweep was complete. Volume analysis showed a significant spike during the sweep, consistent with institutional absorption of retail sell orders.",
      structuralConfirmation: "The break of structure occurred on the 15-minute timeframe at 1.0565, confirmed by a clean break above the most recent swing high with a full-bodied candle. The fair value gap left between 1.0548 and 1.0558 served as the optimal entry zone for the continuation move. Price returned to fill the gap partially before continuing the bullish expansion.",
      riskArchitecture: "Risk was defined below the sweep low at 1.0530, providing an 8-pip stop loss from the FVG entry at 1.0548. The first target at the range high (1.0590) offered a 5.25R reward. Position sizing was calculated at 0.5% account risk per the standard risk architecture protocol. The trade was managed by moving the stop to breakeven after 2R was achieved.",
      lessons: "This setup reinforces the importance of patience during consolidation phases. The three-touch pattern at the range low was a clear signal of liquidity building. The key lesson is that the sweep itself is not the entry — the structural shift that follows is the confirmation. Entering on the sweep without structural confirmation would have resulted in a premature entry with wider risk."
    }
  },
  {
    slug: "order-block-gbpusd-daily",
    title: "Daily Order Block Rejection on GBP/USD",
    excerpt: "Analysis of the daily order block at 1.2100 and the subsequent rejection that provided a high-probability short setup during the New York session, demonstrating the integration of HTF structure with LTF execution.",
    category: "Structure",
    date: "2026-01-08",
    readTime: "7 min",
    thumbnail: CHART_2,
    content: {
      intro: "GBP/USD reached a critical daily order block at 1.2100 after an extended bullish run from the 1.1950 support zone. The order block, formed by the last bearish candle before the previous sell-off, represented a zone of institutional interest where supply was likely to re-enter the market.",
      htfAnalysis: "The weekly chart showed GBP/USD approaching a significant resistance zone between 1.2080 and 1.2150. This zone had acted as both support and resistance multiple times over the previous quarter. The daily order block at 1.2100 sat within this zone, adding confluence to the bearish thesis. The daily RSI was showing bearish divergence, though this was used only as supplementary context, not as a primary signal.",
      intradayNarrative: "Price entered the daily order block during the London-New York overlap. The initial reaction was a sharp rejection wick on the 1H chart, followed by a consolidation phase. During the New York session, price attempted to push above 1.2120 but was met with aggressive selling, creating a bearish engulfing pattern on the 15-minute chart.",
      structuralConfirmation: "The break of structure on the 5-minute chart occurred at 1.2085, confirmed by three consecutive bearish candles breaking below the most recent swing low. The change of character from bullish to bearish was clear — the higher-high, higher-low sequence was broken, replaced by a lower-high formation at 1.2105.",
      riskArchitecture: "The stop was placed above the order block high at 1.2130, with entry at the lower-high formation at 1.2105. This provided a 25-pip stop with targets at 1.2050 (2.2R) and 1.2000 (4.2R). Risk was set at 0.3% given the counter-trend nature of the setup relative to the recent bullish momentum.",
      lessons: "Counter-trend setups at HTF order blocks require additional confirmation and reduced position sizing. The key takeaway is that the daily order block provided the zone, but the LTF break of structure provided the timing. Without the 5-minute BOS, the entry would have been premature. Reduced risk allocation for counter-trend setups is a non-negotiable element of the risk architecture."
    }
  },
  {
    slug: "session-volatility-us30",
    title: "Session Timing and Volatility Expansion on US30",
    excerpt: "How the London-New York overlap created a volatility expansion that aligned with a structural break on US30, and why session timing is a critical filter in the hybrid framework.",
    category: "Macro",
    date: "2025-12-22",
    readTime: "9 min",
    thumbnail: CHART_3,
    content: {
      intro: "US30 demonstrated a classic session-based volatility expansion during the London-New York overlap on December 22nd. The index had been range-bound during the Asian and early London sessions, building energy for a directional move that aligned with the broader structural bias.",
      htfAnalysis: "The daily chart showed US30 in a corrective phase after the December rally. Price was trading below the 4H bearish order block at 43,200 and above the daily support at 42,800. The 4H structure was bearish, with a clear series of lower highs. The session timing analysis indicated that the highest probability for a directional move would occur during the London-New York overlap, between 13:00 and 16:00 GMT.",
      intradayNarrative: "During the Asian session, US30 consolidated between 43,050 and 43,100 — a 50-point range that represented compressed volatility. The London open brought a slight push higher to 43,120, which was identified as a potential inducement above the Asian high. At 13:30 GMT, coinciding with US economic data release, price reversed sharply from 43,120, breaking below the Asian low at 43,050.",
      structuralConfirmation: "The structural break was confirmed on the 5-minute chart at 43,040, where price broke below the London session low with a strong bearish displacement candle. The volume spike at this level confirmed institutional participation. The fair value gap between 43,060 and 43,080 provided the re-entry zone for traders who missed the initial break.",
      riskArchitecture: "Risk was defined above the inducement high at 43,130, with entry at the FVG zone at 43,070. The 60-point stop targeted the daily support at 42,800 for a 4.5R reward. Given the alignment of session timing, structural bias, and liquidity sweep, the full 1% risk allocation was justified under the framework's position sizing rules.",
      lessons: "Session timing is not merely a filter — it is a structural component of the framework. The Asian consolidation built the liquidity pools, the London session created the inducement, and the New York overlap provided the volatility for execution. Trading this setup during the Asian session would have resulted in a choppy, low-probability experience. The lesson is clear: align your execution window with the session that provides the volatility your setup requires."
    }
  },
  {
    slug: "discipline-over-conviction",
    title: "Discipline Over Conviction: Managing the Urge to Overtrade",
    excerpt: "A reflection on the psychological challenge of sitting through valid setups that do not meet all framework criteria, and why disciplined inaction is the highest form of execution.",
    category: "Psychology",
    date: "2025-12-15",
    readTime: "6 min",
    thumbnail: CHART_1,
    content: {
      intro: "The most difficult trades are the ones you do not take. This entry examines a week in December where three potential setups presented themselves on EUR/USD, GBP/USD, and Gold — all of which showed partial alignment with the framework but failed to meet the complete criteria for execution.",
      htfAnalysis: "Each setup had a valid HTF bias. EUR/USD was bullish above the weekly order block. GBP/USD was bearish below the daily supply zone. Gold was bullish within the ascending channel. The HTF analysis was sound, and the directional bias was clear on all three pairs.",
      intradayNarrative: "The problem was not the bias — it was the execution criteria. EUR/USD showed a potential sweep of the Asian low, but the displacement candle was weak, with a long upper wick suggesting indecision. GBP/USD broke structure on the 15-minute chart, but the break occurred during the Asian session, outside the optimal volatility window. Gold presented a fair value gap, but it was located within a previous consolidation zone, reducing its reliability.",
      structuralConfirmation: "None of the three setups achieved full structural confirmation under the framework. The EUR/USD displacement was insufficient. The GBP/USD timing was suboptimal. The Gold FVG lacked clean price action context. In each case, one or more criteria were missing.",
      riskArchitecture: "The correct risk architecture decision was zero allocation. No position was taken on any of the three setups. This is the hardest decision in trading — not because the analysis is difficult, but because the emotional pull to participate is strong when the bias is correct.",
      lessons: "Two of the three setups would have been profitable. EUR/USD rallied 80 pips from the sweep. Gold continued higher by 150 pips. But GBP/USD reversed against the short thesis, which would have resulted in a full stop loss. The net result of taking all three would have been marginally positive, but the process would have been compromised. The framework exists to protect against the setups that fail, not to capture every setup that works. Discipline is measured by what you do not do."
    }
  },
  {
    slug: "macro-regime-shift-q1",
    title: "Macro Regime Shift: Adapting the Framework for Q1 Conditions",
    excerpt: "How changing macro conditions — including central bank policy shifts and seasonal liquidity patterns — require adjustments to the hybrid framework's session timing and risk parameters.",
    category: "Macro",
    date: "2025-12-08",
    readTime: "10 min",
    thumbnail: CHART_2,
    content: {
      intro: "The transition from Q4 to Q1 brings predictable shifts in market behavior that the hybrid framework must account for. Reduced liquidity during the holiday period, followed by the January effect and new institutional positioning, creates a distinct macro regime that affects session timing, volatility expectations, and risk allocation.",
      htfAnalysis: "The weekly charts across major pairs showed extended ranges during December, consistent with year-end position squaring. The DXY was consolidating near the 104 level, with no clear directional bias on the monthly timeframe. This type of macro uncertainty requires a defensive posture — reduced position sizing and tighter session filters.",
      intradayNarrative: "During the final two weeks of December, intraday volatility dropped by approximately 30% compared to the November average. The London session, typically the most volatile, showed reduced participation. The New York session maintained some volatility around data releases, but the follow-through was limited. This environment favors scalping over swing trading within the framework.",
      structuralConfirmation: "Structural breaks during low-volatility regimes are less reliable. The framework accounts for this by requiring additional confirmation — specifically, a second break of structure on a higher timeframe before committing capital. During the holiday period, single-timeframe BOS signals produced a 40% lower win rate compared to the Q4 average.",
      riskArchitecture: "Risk allocation was reduced from the standard 1% to 0.5% per trade during the holiday period. Session filters were tightened to exclude the Asian session entirely and focus only on the London-New York overlap. Maximum daily risk was capped at 1% (two trades) compared to the standard 2% (three trades).",
      lessons: "The framework is not static. It must adapt to macro conditions while maintaining its core principles. The adjustments made during Q4-Q1 transition are systematic, not discretionary — they are pre-defined rules triggered by observable market conditions (reduced volatility, holiday calendar, central bank schedule). The lesson is that adaptability within structure is not the same as discretionary overriding of the framework."
    }
  },
  {
    slug: "fair-value-gap-hierarchy",
    title: "Fair Value Gap Hierarchy: Not All Gaps Are Equal",
    excerpt: "A systematic classification of fair value gaps by context, timeframe, and structural significance, explaining why some FVGs provide high-probability entries while others are noise.",
    category: "Structure",
    date: "2025-11-30",
    readTime: "8 min",
    thumbnail: CHART_3,
    content: {
      intro: "Fair value gaps are among the most discussed concepts in Smart Money trading, yet they are frequently misapplied. Not all FVGs carry equal weight. This article establishes a hierarchy for classifying FVGs based on their structural context, the timeframe on which they form, and their relationship to the broader market structure.",
      htfAnalysis: "The highest-probability FVGs form on the 4H and daily timeframes, within the context of a clear structural trend. An FVG that forms after a break of structure on the daily chart, within a weekly order block, carries significantly more weight than an FVG on the 15-minute chart during a ranging market. The hierarchy is: Daily FVG > 4H FVG > 1H FVG > 15M FVG, with each level requiring additional confluence to justify entry.",
      intradayNarrative: "Consider two FVGs on EUR/USD from the same week. The first formed on the 4H chart after a clean break of structure above 1.0600, within a daily bullish order block. The second formed on the 15-minute chart during the Asian session, with no clear structural context. The first FVG was filled and provided a 4R continuation trade. The second FVG was filled but price reversed immediately, resulting in a stop loss.",
      structuralConfirmation: "The classification system uses three criteria: (1) Timeframe — higher timeframe FVGs are more significant; (2) Context — FVGs within order blocks or after BOS carry more weight; (3) Displacement — the strength of the candle that created the FVG matters. A strong displacement candle (full body, minimal wicks) indicates genuine institutional interest, while a weak displacement (long wicks, small body) suggests indecision.",
      riskArchitecture: "Position sizing should reflect the FVG hierarchy. Daily FVGs with full confluence warrant 1% risk. 4H FVGs with partial confluence warrant 0.5-0.75% risk. Lower timeframe FVGs should rarely exceed 0.3% risk unless additional confluence is present. This graduated approach ensures that capital allocation matches the probability of the setup.",
      lessons: "The primary lesson is that FVGs are contextual, not absolute. An FVG is a symptom of institutional activity, but the significance of that activity depends on where it occurs within the broader structure. Treating all FVGs equally is a common error that leads to overtrading and inconsistent results. The hierarchy provides a systematic filter that improves both win rate and risk-adjusted returns."
    }
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return articles.filter((a) => a.category === category);
}
