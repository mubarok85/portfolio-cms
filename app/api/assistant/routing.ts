import type {
  AssistantMode,
} from "./types";

const LIVE_INFORMATION_PATTERNS: RegExp[] = [
  /\b(today|tonight|currently|current|right now|now)\b/i,

  /\b(latest|recent|newest|breaking|live|updated|up[- ]to[- ]date)\b/i,

  /\b(search|search again|search the web|search online|browse|browse the web|look up|lookup|check online|check the web)\b/i,

  /\b(internet access|web access|real[- ]time|live information)\b/i,

  /\b(verify|verification|fact[- ]check|double[- ]check|confirm from sources)\b/i,

  /\b(source|sources|citation|citations|reference|references)\b/i,

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

const CORRECTION_PATTERNS: RegExp[] = [
  /\b(that|this|your|the)\s+(answer|information|result|claim)\s+(is|was)\s+(wrong|incorrect|false|outdated)\b/i,

  /\b(you are|you're|you were)\s+(wrong|incorrect|mistaken)\b/i,

  /\b(search again|check again|verify again|try again)\b/i,

  /\b(wrong person|wrong player|wrong footballer|wrong singer|mixed up|mix[- ]up)\b/i,

  /\b(i meant|i am talking about|i'm talking about)\b/i,

  /\b(link is wrong|wrong link|broken link|link does not work|link doesn't work)\b/i,

  /\b(do not defend|don't defend|stop defending)\b/i,

  /\b(previous answer|earlier answer|last answer)\b.*\b(wrong|incorrect|false)\b/i,
];

const IDENTITY_VERIFICATION_PATTERNS: RegExp[] = [
  /\b(who is|which person|which player|which footballer)\b/i,

  /\b(rodri|ronaldo|messi|neymar|mbappe|haaland)\b/i,

  /\b(footballer|player|coach|manager|singer|actor|president|prime minister|ceo)\b/i,

  /\b(full name|identity|identify|verify the person)\b/i,
];

function matchesAnyPattern(
  message: string,
  patterns: RegExp[],
) {
  return patterns.some(
    (pattern) =>
      pattern.test(message),
  );
}

export function selectAssistantMode(
  latestUserMessage: string,
): AssistantMode {
  const cleanMessage =
    latestUserMessage
      .trim()
      .toLowerCase();

  if (!cleanMessage) {
    return "standard";
  }

  const requiresLiveInformation =
    matchesAnyPattern(
      cleanMessage,
      LIVE_INFORMATION_PATTERNS,
    );

  const isCorrectionRequest =
    matchesAnyPattern(
      cleanMessage,
      CORRECTION_PATTERNS,
    );

  const requiresIdentityVerification =
    matchesAnyPattern(
      cleanMessage,
      IDENTITY_VERIFICATION_PATTERNS,
    );

  if (
    requiresLiveInformation ||
    isCorrectionRequest ||
    requiresIdentityVerification
  ) {
    return "live";
  }

  return "standard";
}