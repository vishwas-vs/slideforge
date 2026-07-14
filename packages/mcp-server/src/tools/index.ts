import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DeckStore } from '../deck-store.js';
import { registerCreateBeatTool } from './create-beat.js';
import { registerCreateDeckTool } from './create-deck.js';
import { registerDeleteBeatTool } from './delete-beat.js';
import { registerGetDeckTool } from './get-deck.js';
import { registerPingTool } from './ping.js';
import { registerReorderBeatsTool } from './reorder-beats.js';
import { registerSetNarrationTool } from './set-narration.js';
import { registerUpdateBeatTool } from './update-beat.js';

/**
 * Central registration point for every slideforge MCP tool. Compile/render
 * tools (compileSlides/compileVideo/renderVideo) land here in later issues,
 * alongside the content-CRUD tools registered below.
 */
export function registerTools(server: McpServer, store: DeckStore): void {
  registerPingTool(server);
  registerCreateDeckTool(server, store);
  registerGetDeckTool(server, store);
  registerCreateBeatTool(server, store);
  registerUpdateBeatTool(server, store);
  registerReorderBeatsTool(server, store);
  registerDeleteBeatTool(server, store);
  registerSetNarrationTool(server, store);
}
