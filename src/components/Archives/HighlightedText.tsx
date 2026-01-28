interface HighlightedTextProps {
  text: string;
  searchQuery: string;
  className?: string;
}

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const HighlightedText = ({ text, searchQuery, className = "" }: HighlightedTextProps) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const keywords = searchQuery.trim().split(" ").filter(Boolean);

  if (keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Trouver tous les matches
  const normalizedText = normalizeText(text);
  const matches: Array<{ start: number; end: number }> = [];

  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    let index = 0;

    while (index < normalizedText.length) {
      const foundIndex = normalizedText.indexOf(normalizedKeyword, index);
      if (foundIndex === -1) break;

      matches.push({
        start: foundIndex,
        end: foundIndex + normalizedKeyword.length,
      });

      index = foundIndex + 1;
    }
  });

  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Fusionner les matches qui se chevauchent
  matches.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];

  for (const match of matches) {
    if (merged.length === 0) {
      merged.push(match);
    } else {
      const last = merged[merged.length - 1];
      if (match.start <= last.end) {
        last.end = Math.max(last.end, match.end);
      } else {
        merged.push(match);
      }
    }
  }

  // Construire le JSX avec les highlights
  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  merged.forEach((match, index) => {
    // Texte avant le match
    if (match.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, match.start)}
        </span>
      );
    }

    // Texte surligné
    parts.push(
      <mark
        key={`highlight-${index}`}
        className="bg-primary/20 text-foreground font-semibold rounded px-0.5"
      >
        {text.substring(match.start, match.end)}
      </mark>
    );

    lastIndex = match.end;
  });

  // Texte après le dernier match
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <span className={className}>{parts}</span>;
};
