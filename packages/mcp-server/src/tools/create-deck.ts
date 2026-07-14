import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeckStore } from '../deck-store.js';
import { textResult } from '../tool-result.js';

export function registerCreateDeckTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'createDeck',
    {
      title: 'Create deck',
      description:
        'Starts a new, empty Deck for this session (replacing any deck already in progress).',
      inputSchema: {
        title: z.string().min(1),
        description: z.string().optional(),
        author: z.string().optional(),
      },
    },
    async ({ title, description, author }) => {
      const deck = store.createDeck({ title, description, author });
      return textResult(deck);
    },
  );
}
