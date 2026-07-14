import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPingTool } from './ping.js';

/**
 * Central registration point for every slideforge MCP tool. Content-CRUD
 * tools (getDeck/createBeat/updateBeat/...) and compile/render tools land
 * here in later issues (#8, #9, and beyond), alongside registerPingTool.
 */
export function registerTools(server: McpServer): void {
  registerPingTool(server);
}
