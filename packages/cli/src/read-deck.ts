import { readFileSync } from 'node:fs';
import { type Deck, validateDeck } from '@slideforge/schema';

/** Reads and validates a Deck from a JSON file, throwing a readable error if it's invalid. */
export function readDeckFromFile(deckPath: string): Deck {
  const raw = readFileSync(deckPath, 'utf8');
  const parsed: unknown = JSON.parse(raw);

  const result = validateDeck(parsed);
  if (!result.valid) {
    const issues = result.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Deck at ${deckPath} is invalid:\n${issues}`);
  }

  return parsed as Deck;
}
