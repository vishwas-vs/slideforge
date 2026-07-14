import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerDeleteBeatTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'deleteBeat',
    {
      title: 'Delete beat',
      description: 'Removes a Beat from the current Deck by id.',
      inputSchema: {
        beatId: z.string().min(1),
      },
    },
    async ({ beatId }) => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      const exists = store.getDeck().beats.some((beat) => beat.id === beatId);
      if (!exists) {
        return errorResult(`No beat with id "${beatId}" in the current deck.`);
      }

      const deck = store.mutate((draft) => {
        const index = draft.beats.findIndex((beat) => beat.id === beatId);
        if (index !== -1) {
          draft.beats.splice(index, 1);
        }
      });

      return textResult(deck);
    },
  );
}
