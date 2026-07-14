import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DeckStore } from './deck-store.js';
import { registerTools } from './tools/index.js';

const SERVER_INFO = {
  name: 'slideforge',
  version: '0.0.0',
};

/**
 * Builds a fresh McpServer (with a fresh DeckStore) with every slideforge
 * tool registered. Kept separate from transport wiring (see index.ts) so
 * tests can connect to it with an in-memory transport instead of stdio.
 */
export function createServer(): McpServer {
  const server = new McpServer(SERVER_INFO);
  const store = new DeckStore();
  registerTools(server, store);
  return server;
}
