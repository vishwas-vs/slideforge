import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerGetDeckTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'getDeck',
    {
      title: 'Get deck',
      description: 'Returns the full current Deck for this session.',
      inputSchema: {},
    },
    async () => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      return textResult(store.getDeck());
    },
  );
}
