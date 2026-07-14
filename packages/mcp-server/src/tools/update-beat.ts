import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BlockSchema } from '@slideforge/schema';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerUpdateBeatTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'updateBeat',
    {
      title: 'Update beat',
      description:
        'Updates the given fields of an existing Beat; fields left out of the call are unchanged.',
      inputSchema: {
        beatId: z.string().min(1),
        heading: z.string().optional(),
        blocks: z.array(BlockSchema).optional(),
        notes: z.string().optional(),
        visualHint: z.string().optional(),
        durationHint: z.number().positive().optional(),
      },
    },
    async ({ beatId, heading, blocks, notes, visualHint, durationHint }) => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      const exists = store.getDeck().beats.some((beat) => beat.id === beatId);
      if (!exists) {
        return errorResult(`No beat with id "${beatId}" in the current deck.`);
      }

      const deck = store.mutate((draft) => {
        const beat = draft.beats.find((candidate) => candidate.id === beatId);
        if (!beat) {
          return;
        }
        if (heading !== undefined) {
          beat.heading = heading;
        }
        if (blocks !== undefined) {
          beat.blocks = blocks;
        }
        if (notes !== undefined) {
          beat.notes = notes;
        }
        if (visualHint !== undefined) {
          beat.visualHint = visualHint;
        }
        if (durationHint !== undefined) {
          beat.durationHint = durationHint;
        }
      });

      const updated = deck.beats.find((candidate) => candidate.id === beatId);
      return textResult(updated);
    },
  );
}
