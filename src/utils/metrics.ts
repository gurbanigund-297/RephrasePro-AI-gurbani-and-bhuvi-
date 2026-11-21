export interface TextMetrics {
  words: number;
  characters: number;
  sentences: number;
  readingTimeLabel: string;
  avgWordsPerSentence: number;
}

export function analyzeTextMetrics(text: string): TextMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      sentences: 0,
      readingTimeLabel: "0 sec",
      avgWordsPerSentence: 0,
    };
  }

  const wordsList = trimmed.split(/\s+/).filter(Boolean);
  const words = wordsList.length;
  const characters = text.length;
  const sentencesList = trimmed
    .split(/[.!?]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sentences = Math.max(1, sentencesList.length);

  const seconds = Math.max(1, Math.round((words / 225) * 60));
  const readingTimeLabel =
    seconds < 60
      ? `${seconds} sec`
      : `${Math.floor(seconds / 60)} min ${seconds % 60 > 0 ? `${seconds % 60} sec` : ""}`.trim();

  return {
    words,
    characters,
    sentences,
    readingTimeLabel,
    avgWordsPerSentence: Number((words / sentences).toFixed(1)),
  };
}
