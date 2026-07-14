import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerSetNarrationTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'setNarration',
    {
      title: 'Set narration',
      description:
        "Sets a Beat's notes -- speaker notes for a Slidev deck, or the caption/voiceover script for a HyperFrames video.",
      inputSchema: {
        beatId: z.string().min(1),
        notes: z.string(),
      },
    },
    async ({ beatId, notes }) => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      const exists = store.getDeck().beats.some((beat) => beat.id === beatId);
      if (!exists) {
        return errorResult(`No beat with id "${beatId}" in the current deck.`);
      }

      const deck = store.mutate((draft) => {
        const beat = draft.beats.find((candidate) => candidate.id === beatId);
        if (beat) {
          beat.notes = notes;
        }
      });

      const updated = deck.beats.find((candidate) => candidate.id === beatId);
      return textResult(updated);
    },
  );
}
