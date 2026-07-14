import { DeckSchema } from './deck.js';

export interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates a Deck beyond what zod's shape-checking alone can express:
 * every id (Deck/Beat/Block) must be unique across the whole tree, every
 * Deck needs at least one Beat, and every Beat needs at least one Block.
 * Accepts `unknown` so it can run directly against untrusted input (e.g.
 * from an MCP tool call) -- shape errors are reported the same way as
 * the structural ones below, in one combined result.
 */
export function validateDeck(input: unknown): ValidationResult {
  const parsed = DeckSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    };
  }

  const deck = parsed.data;
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();

  const checkId = (id: string, path: (string | number)[]) => {
    if (seenIds.has(id)) {
      issues.push({
        path,
        message: `Duplicate id "${id}" -- ids must be unique across the whole deck.`,
      });
    } else {
      seenIds.add(id);
    }
  };

  checkId(deck.id, ['id']);

  if (deck.beats.length === 0) {
    issues.push({ path: ['beats'], message: 'Deck must have at least one beat.' });
  }

  deck.beats.forEach((beat, beatIndex) => {
    checkId(beat.id, ['beats', beatIndex, 'id']);

    if (beat.blocks.length === 0) {
      issues.push({
        path: ['beats', beatIndex, 'blocks'],
        message: `Beat "${beat.id}" has no blocks.`,
      });
    }

    beat.blocks.forEach((block, blockIndex) => {
      checkId(block.id, ['beats', beatIndex, 'blocks', blockIndex, 'id']);
    });
  });

  return { valid: issues.length === 0, issues };
}
