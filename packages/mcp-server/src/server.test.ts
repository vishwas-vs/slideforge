import assert from 'node:assert/strict';
import { test } from 'node:test';
import { connectedClient, parseToolResult } from './test-utils.js';

test('createServer registers a ping tool reachable over a real MCP round-trip', async () => {
  const client = await connectedClient();

  const result = await client.callTool({ name: 'ping', arguments: {} });
  const { isError, data } = parseToolResult(result);

  assert.equal(isError, false);
  const parsed = data as { pong: boolean; timestamp: string };
  assert.equal(parsed.pong, true);
  assert.equal(typeof parsed.timestamp, 'string');
});

test('createServer exposes ping in the tool list', async () => {
  const client = await connectedClient();

  const { tools } = await client.listTools();

  assert.ok(tools.some((tool) => tool.name === 'ping'));
});
