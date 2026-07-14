import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from './server.js';

/** Not a test file itself -- shared helpers for the integration tests. */

export async function connectedClient(): Promise<Client> {
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

/**
 * Narrows a callTool() result (whose type also covers the legacy
 * pre-2024-11-05 `{ toolResult }` shape) down to its text content, and
 * parses it as JSON when possible.
 */
export function parseToolResult(result: Awaited<ReturnType<Client['callTool']>>): {
  isError: boolean;
  data: unknown;
} {
  assert.ok('content' in result);
  assert.ok(Array.isArray(result.content));

  const [first] = result.content;
  assert.ok(first);
  assert.ok(first.type === 'text');

  const isError = 'isError' in result && result.isError === true;
  try {
    return { isError, data: JSON.parse(first.text) };
  } catch {
    return { isError, data: first.text };
  }
}
