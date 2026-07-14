import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerReorderBeatsTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'reorderBeats',
    {
      title: 'Reorder beats',
      description:
        "Sets the Deck's beat order to exactly the given list of beat ids (must be a reordering of the existing ids -- same set, no duplicates, none missing).",
      inputSchema: {
        beatIds: z.array(z.string().min(1)).min(1),
      },
    },
    async ({ beatIds }) => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }

      const currentIds = new Set(store.getDeck().beats.map((beat) => beat.id));
      const noDuplicates = new Set(beatIds).size === beatIds.length;
      const sameSize = beatIds.length === currentIds.size;
      const sameMembers = beatIds.every((id) => currentIds.has(id));

      if (!noDuplicates || !sameSize || !sameMembers) {
        return errorResult(
          "beatIds must be exactly a reordering of the current deck's beat ids (same ids, no duplicates, none missing).",
        );
      }

      const deck = store.mutate((draft) => {
        const byId = new Map(draft.beats.map((beat) => [beat.id, beat]));
        draft.beats = beatIds.flatMap((id) => {
          const beat = byId.get(id);
          return beat ? [beat] : [];
        });
      });

      return textResult(deck);
    },
  );
}
