import { renderEmail } from "./template";

export function nurture2() {
  return renderEmail({
    subject: "Order blocks vs fair value gaps — getting the order right",
    headline: "Order blocks vs fair value gaps",
    subtitle: "One is a cause. The other is an effect.",
    paragraphs: [
      "A question that comes up often: \"What's the difference between an order block and a fair value gap, and which one should I trade?\"",

      "The framing is wrong. They're not alternatives. They're sequential.",

      "An order block is a *cause*. It's the zone where institutional accumulation or distribution happened. Footprints of intent.",

      "A fair value gap is an *effect*. It's the imbalance left behind when the institutional flow moved price quickly through a range. Evidence of that intent in motion.",

      "Causes precede effects. Order blocks precede fair value gaps in the structural hierarchy. When an institution accumulates in a zone (order block) and then drives price away from that zone with conviction, the impulse leaves a fair value gap behind.",

      "The strongest setups happen when both are present and aligned:",

      "— A bullish order block with a bullish fair value gap above it suggests the institution accumulated, then drove price up, leaving inefficiency that price will likely return to fill.",

      "— When price returns to fill the fair value gap, it often pauses or reverses near the order block — because the institution may want to add to its position there, or because the level has structural significance.",

      "Trading either pattern in isolation works sometimes. Trading them together — order block as the zone of origin, fair value gap as the magnet that draws price back — works much more reliably.",

      "A practical sequence for the coming week:",

      "1. Identify a strong directional move on the 4-hour or daily chart.",

      "2. Mark the order block (the last opposing candle before the move began).",

      "3. Mark any fair value gaps that formed during the move.",

      "4. Wait. Don't trade yet.",

      "5. When price returns toward those zones, drop to a lower timeframe (15-minute, 5-minute) and watch for structural confirmation — a small break of structure in the direction of the order block bias.",

      "6. Enter on the structural confirmation. Stop beyond the order block. Target the next structural level.",

      "This is one specific application of one specific concept. The full system involves more — session timing, risk architecture, multi-timeframe alignment. But you can start using just this much, this week, and see results.",

      "If the language is unfamiliar (BOS, CHoCH, structural confirmation), reread the guide. Pattern 04 covers it. The terminology becomes natural after you've used it on twenty charts.",
    ],
  });
}
