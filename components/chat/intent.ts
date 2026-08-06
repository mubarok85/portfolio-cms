const IMAGE_COMMAND_PATTERN =
  /^(?:please\s+)?(?:can|could|would|will)?\s*(?:you\s+)?(?:generate|create|make|draw|design|paint|illustrate|render|produce)\b/i;

const IMAGE_SUBJECT_PATTERN =
  /\b(?:image|picture|photo|art|artwork|illustration|portrait|poster|logo|icon|wallpaper|banner|thumbnail|graphic|design)\b/i;

const DIRECT_IMAGE_COMMAND_PATTERN =
  /^\s*\/image(?:\s+|$)/i;

const IMAGE_NEGATION_PATTERNS: RegExp[] = [
  /\b(?:do not|don't|dont|did not|didn't|didnt|never|stop)\b.{0,40}\b(?:generate|create|make|draw|design|paint|illustrate|render|produce)\b/i,

  /\b(?:do not|don't|dont|did not|didn't|didnt|never|stop)\b.{0,40}\b(?:image|picture|photo|artwork|illustration)\b/i,

  /\bwhy\b.{0,45}\b(?:generate|generated|create|created|make|made|draw|drew|design|designed)\b.{0,35}\b(?:image|picture|photo|artwork|illustration)\b/i,

  /\bi\s+(?:did not|didn't|didnt|never)\s+(?:ask|request|tell)\b/i,

  /\bi\s+(?:do not|don't|dont)\s+want\b.{0,35}\b(?:image|picture|photo|artwork|illustration)\b/i,

  /\b(?:wrong|unwanted|unexpected|accidental)\s+(?:image|picture|generation)\b/i,

  /\b(?:explain|describe|analyse|analyze|review|fix|edit|change|remove)\b.{0,40}\b(?:this|that|the|generated)?\s*(?:image|picture|photo|artwork|illustration)\b/i,

  /\b(?:about|regarding)\s+(?:the|that|this)?\s*(?:image|picture|photo|generation)\b/i,
];

const IMAGE_FOLLOW_UP_PATTERNS: RegExp[] = [
  /\b(?:regenerate|generate again|create again|make another|try another)\b/i,

  /\b(?:same image|similar image|another version|different version|new variation)\b/i,
];

export function shouldGenerateImage(
  message: string,
) {
  const text =
    message.trim();

  if (!text) {
    return false;
  }

  if (
    IMAGE_NEGATION_PATTERNS.some(
      (pattern) =>
        pattern.test(text),
    )
  ) {
    return false;
  }

  if (
    DIRECT_IMAGE_COMMAND_PATTERN.test(
      text,
    )
  ) {
    return (
      text.replace(
        DIRECT_IMAGE_COMMAND_PATTERN,
        "",
      ).trim().length > 0
    );
  }

  if (
    IMAGE_FOLLOW_UP_PATTERNS.some(
      (pattern) =>
        pattern.test(text),
    )
  ) {
    return true;
  }

  return (
    IMAGE_COMMAND_PATTERN.test(
      text,
    ) &&
    IMAGE_SUBJECT_PATTERN.test(
      text,
    )
  );
}

export function cleanImageGenerationPrompt(
  message: string,
) {
  return message
    .replace(
      DIRECT_IMAGE_COMMAND_PATTERN,
      "",
    )
    .replace(
      /^(?:please\s+)?(?:can|could|would|will)?\s*(?:you\s+)?(?:generate|create|make|draw|design|paint|illustrate|render|produce)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|photo|artwork|illustration|portrait|poster|logo|icon|wallpaper|banner|thumbnail|graphic|design)?\s*(?:of|showing|with)?\s*/i,
      "",
    )
    .trim();
}
