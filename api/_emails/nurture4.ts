import { renderEmail } from "./template";

export function nurture4() {
  return renderEmail({
    subject: "Why position sizing matters more than entries",
    headline: "Why position sizing matters more than entries",
    subtitle: "The trade you can't recover from is the one you sized wrong.",
    paragraphs: [
      "Three weeks in. Most of what I've written so far has been about how to read the market — patterns, structure, sessions. Today I want to talk about what most traders care about least and what actually determines whether you stay in the game: how much you risk per trade.",

      "Here's the uncomfortable truth. You can have the best entry strategy in the world and still go broke if you size your positions wrong. You can have a mediocre entry strategy and compound capital steadily for years if you size them correctly.",

      "The math isn't complicated. It's just rarely taught seriously.",

      "Suppose you have a 60% win rate. Sounds good. Most retail traders never get there. Now suppose you risk 5% per trade. That's the standard \"aggressive but not insane\" position size that retail education often suggests.",

      "After 20 trades, with a 60% win rate, you'd expect 12 wins and 8 losses. That looks profitable on paper. But the path matters. If those 8 losses cluster — say five in a row early on, which happens often in random sequences — you'd be down 25% before you ever recover. Recovering from a 25% drawdown requires a 33% return. That changes your psychology. You stop trading the system that produced the win rate in the first place. You start trying to \"make it back.\"",

      "The drawdown isn't the problem. The drawdown is normal. The problem is the position sizing that turned a normal drawdown into a career-ending one.",

      "The serious answer:",

      "— Risk no more than **1%** of account equity per trade in normal conditions.",

      "— Risk no more than **0.5%** when confidence is partial.",

      "— Risk no more than **0.3%** on counter-trend trades, regardless of confidence.",

      "— Cap **session risk at 2%**. After two losses, stop trading for the session.",

      "— Cap **weekly risk at 4%**. After a 3% weekly drawdown, reduce risk to 0.5% maximum until you've recovered.",

      "These aren't suggestions. They're survival parameters. Traders who follow them mechanically can survive a 50-trade losing streak (which happens, even with profitable systems, due to variance). Traders who don't, can't.",

      "The hardest part of position sizing isn't calculating the numbers. It's accepting that smaller positions feel \"not worth it\" when you're confident. They are worth it. Confidence is not a probability. It's an emotion. Probability is what your historical performance actually shows. Until you have a meaningful sample of trades — at least a hundred, ideally several hundred — you don't actually know what your win rate is. Risking more than 1% per trade is risking more than you can afford to lose given how little you actually know about your own edge.",

      "The full risk architecture — graduated sizing by setup type, mandatory rest periods, drawdown protocols, and how all of it integrates with the structural framework — is module 7 of [The SMC Complete Guide](https://finverse.world/courses/smc-complete-guide). It's the layer that determines whether the patterns and structure you've been learning actually translate into profitable trading.",

      "**finverse.world/courses/smc-complete-guide**",
    ],
  });
}
