import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from './server.js';

async function connectedClient(): Promise<Client> {
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

test('createServer registers a ping tool reachable over a real MCP round-trip', async () => {
  const client = await connectedClient();

  const result = await client.callTool({ name: 'ping', arguments: {} });

  // callTool's return type is a union that also covers the legacy
  // (pre 2024-11-05) `{ toolResult }` shape, so `content` isn't known to
  // exist without narrowing first.
  assert.ok('content' in result);
  assert.ok(Array.isArray(result.content));

  const [first] = result.content;
  assert.ok(first);
  assert.ok(first.type === 'text');

  const parsed = JSON.parse(first.text);
  assert.equal(parsed.pong, true);
  assert.equal(typeof parsed.timestamp, 'string');
});

test('createServer exposes ping in the tool list', async () => {
  const client = await connectedClient();

  const { tools } = await client.listTools();

  assert.ok(tools.some((tool) => tool.name === 'ping'));
});
