import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BlockSchema, createId } from '@slideforge/schema';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerCreateBeatTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'createBeat',
    {
      title: 'Create beat',
      description: 'Appends a new Beat to the end of the current Deck.',
      inputSchema: {
        heading: z.string().optional(),
        blocks: z.array(BlockSchema).default([]),
        notes: z.string().optional(),
        visualHint: z.string().optional(),
        durationHint: z.number().positive().optional(),
      },
    },
    async ({ heading, blocks, notes, visualHint, durationHint }) => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      const beatId = createId();
      const deck = store.mutate((draft) => {
        draft.beats.push({ id: beatId, heading, blocks, notes, visualHint, durationHint });
      });
      const beat = deck.beats.find((candidate) => candidate.id === beatId);
      return textResult(beat);
    },
  );
}
