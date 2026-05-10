import { renderEmail } from "./template";

export function nurture3() {
  return renderEmail({
    subject: "The session pattern most retail traders ignore",
    headline: "The session pattern most retail traders ignore",
    subtitle: "When the manipulation happens, when the move delivers, and why it matters.",
    paragraphs: [
      "Two weeks in. By now you should be seeing at least one or two of the patterns from the guide on charts you look at. If you're not, you're either not looking, or you're looking at timeframes too low to see structure clearly. Stay on 4-hour and daily for now. The lower timeframes are where execution happens, but they're not where you train your eye to read structure.",

      "Today I want to introduce something the guide didn't cover, because it deserves its own treatment: session timing.",

      "Most retail traders treat the trading day as one continuous block. Markets are open. They look for setups. If they see something, they trade it.",

      "This is wrong, and it's expensive.",

      "The trading day breaks into four functionally distinct phases. Each one has a specific role. Confusing them — taking trades during the wrong phase — is one of the most common reasons technically valid setups fail.",

      "**Asian session (19:00-23:00 UTC)** is the accumulation phase. Liquidity pools are forming on both sides of the range. This is observation time, not execution time. Mark the Asian high and low. They become the targets for what comes next.",

      "**London window (23:00-07:00 UTC)** is where institutional manipulation happens. Price sweeps the Asian range — taking out one side or the other — and reverses. This is the highest-probability phase in the day, but most retail traders are asleep through it. By the time London business hours open at 08:00 UTC, the structural shift is already complete and visible on the chart.",

      "**Neutral zone (07:00-12:30 UTC)** is the dead zone. Price is digesting the London move. There's no edge here. Most retail traders trade most heavily during this window, which is exactly why they lose during it.",

      "**New York delivery (12:30-19:00 UTC)** is where the move pays out. If London formed a valid structural shift, this is when price returns to retest the shift and continue in the established direction. Entries belong here. Setup formed in London. Delivery happens in New York.",

      "This is the rhythm institutions trade by. They are not staring at charts at 09:00 UTC looking for setups. They're reading what the manipulation showed them at 04:00 UTC, then waiting for delivery in the afternoon.",

      "Once you internalise this rhythm, your trade selection becomes much more efficient. You stop forcing setups during the neutral zone. You stop entering during low-liquidity periods. You start treating the chart as a sequence of phases rather than a continuous opportunity.",

      "There's much more to it — how to identify which side of the range will be swept, how to read the displacement candle, how to time the retest entry. The full session model and the structural framework that makes it tradeable is in [The SMC Complete Guide](https://finverse.world/courses/smc-complete-guide) on FinVerse. If you've been using the patterns from your guide and want to see how they integrate into a complete trading system, the course covers all eight modules — from foundations through risk architecture and trader psychology.",

      "You can preview the first lesson of each module free. **finverse.world/courses/smc-complete-guide**.",

      "No pressure to take it. The patterns alone will improve your trading if you apply them consistently. The course exists for traders who want to compress the learning curve and build a complete system around them.",
    ],
  });
}
