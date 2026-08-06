import type {
  AssistantMode,
} from "./types";

const LIVE_INFORMATION_PATTERNS: RegExp[] =
  [
    /\b(today|tonight|currently|current|right now|now)\b/i,

    /\b(latest|recent|newest|breaking|live|updated|up[- ]to[- ]date)\b/i,

    /\b(browse|browser|search|search the web|search online|search internet|look up|lookup|check online|check the web)\b/i,

    /\b(internet access|web access|real[- ]time|live information)\b/i,

    /\b(knowledge cutoff|training cutoff|outdated|backdated)\b/i,

    /\b(news|headline|headlines|announcement|release date|released)\b/i,

    /\b(weather|forecast|temperature|rain|storm|snow|humidity)\b/i,

    /\b(score|scores|result|results|fixture|fixtures|schedule|standings|match result|match results)\b/i,

    /\b(who won|winner|won the|final result|champion|champions)\b/i,

    /\b(stock price|share price|market price|crypto price|current price)\b/i,

    /\b(bitcoin|ethereum|nasdaq|dow jones|s&p 500)\b/i,

    /\b(exchange rate|currency rate|usd rate|dollar rate|bdt rate)\b/i,

    /\b(current president|current prime minister|current ceo|current leader)\b/i,

    /\b(election result|poll result|vote result|election winner)\b/i,

    /\b(cricket|football|soccer|tennis|basketball|baseball|hockey)\b/i,

    /\b(world cup|champions league|premier league|la liga|serie a|bundesliga|nba|nfl|nhl|mlb|ipl|bpl|psl|cpl|icc)\b/i,

    /\b(2025|2026|2027|2028)\b.*\b(result|winner|news|latest|current|score|schedule|released)\b/i,

    /\b(26 wc|2026 wc|wc 2026|2026 world cup)\b/i,
  ];

export function selectAssistantMode(
  latestUserMessage: string,
): AssistantMode {
  const cleanMessage =
    latestUserMessage
      .trim()
      .toLowerCase();

  const requiresLiveInformation =
    LIVE_INFORMATION_PATTERNS.some(
      (pattern) =>
        pattern.test(
          cleanMessage,
        ),
    );

  return requiresLiveInformation
    ? "live"
    : "standard";
}