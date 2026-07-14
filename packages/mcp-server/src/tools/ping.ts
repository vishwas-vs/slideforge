import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Health-check tool proving the registration plumbing and a real
 * client<->server round-trip work end to end. Not one of the real
 * content-model tools (those land in later issues) -- safe to remove
 * once at least one real tool covers the same ground.
 */
export function registerPingTool(server: McpServer): void {
  server.registerTool(
    'ping',
    {
      title: 'Ping',
      description: 'Health-check: replies with pong and the current server time.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ pong: true, timestamp: new Date().toISOString() }),
        },
      ],
    }),
  );
}
