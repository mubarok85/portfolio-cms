export type ParsedCitation = {
  key: string;
  sourceNumber: number;
  startLine?: number;
  endLine?: number;
  label: string;
};

const CITATION_PATTERN =
  /【(\d+)†L(\d+)(?:-L?(\d+))?】/g;

export function extractCitations(
  content: string,
): ParsedCitation[] {
  const citations =
    new Map<string, ParsedCitation>();

  for (
    const match of
    content.matchAll(
      CITATION_PATTERN,
    )
  ) {
    const sourceNumber =
      Number(match[1]);

    const startLine =
      Number(match[2]);

    const endLine =
      match[3]
        ? Number(match[3])
        : startLine;

    const key =
      `${sourceNumber}-${startLine}-${endLine}`;

    if (
      citations.has(key)
    ) {
      continue;
    }

    citations.set(key, {
      key,
      sourceNumber,
      startLine,
      endLine,
      label:
        startLine === endLine
          ? `${sourceNumber} · L${startLine}`
          : `${sourceNumber} · L${startLine}–${endLine}`,
    });
  }

  return Array.from(
    citations.values(),
  );
}

export function prepareCitationMarkdown(
  content: string,
) {
  return content.replace(
    CITATION_PATTERN,
    (
      _match,
      sourceNumber: string,
      startLine: string,
      endLine?: string,
    ) => {
      const finalEndLine =
        endLine ||
        startLine;

      const label =
        startLine ===
        finalEndLine
          ? `${sourceNumber} · L${startLine}`
          : `${sourceNumber} · L${startLine}–${finalEndLine}`;

      const citationUrl =
        `citation://${sourceNumber}` +
        `?start=${startLine}` +
        `&end=${finalEndLine}`;

      return `[${label}](${citationUrl})`;
    },
  );
}

export function isCitationUrl(
  href?: string,
) {
  return Boolean(
    href?.startsWith(
      "citation://",
    ),
  );
}

export function removeCitationMarkers(
  content: string,
) {
  return content.replace(
    CITATION_PATTERN,
    "",
  );
}
