import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { validateDeck } from '@slideforge/schema';
import type { DeckStore } from '../deck-store.js';
import { errorResult, textResult } from '../tool-result.js';

export function registerValidateDeckTool(server: McpServer, store: DeckStore): void {
  server.registerTool(
    'validateDeck',
    {
      title: 'Validate deck',
      description:
        'Checks the current Deck for structural validity (unique ids, at least one Beat, every Beat has at least one Block) before compiling.',
      inputSchema: {},
    },
    async () => {
      if (!store.hasDeck()) {
        return errorResult('No deck exists yet -- call createDeck first.');
      }
      return textResult(validateDeck(store.getDeck()));
    },
  );
}
