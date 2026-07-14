import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { connectedClient, parseToolResult } from './test-utils.js';

async function call(
  client: Client,
  name: string,
  args: Record<string, unknown> = {},
): Promise<{ isError: boolean; data: unknown }> {
  const result = await client.callTool({ name, arguments: args });
  return parseToolResult(result);
}

test('validateDeck fails until a deck has been created', async () => {
  const client = await connectedClient();
  const { isError } = await call(client, 'validateDeck');
  assert.equal(isError, true);
});

test('validateDeck reports invalid for a freshly created deck with zero beats', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'Empty' });

  const { isError, data } = await call(client, 'validateDeck');
  assert.equal(isError, false);
  const result = data as { valid: boolean; issues: { message: string }[] };
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes('at least one beat')));
});

test('validateDeck reports invalid for a beat with zero blocks', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'Has an empty beat' });
  await call(client, 'createBeat', { heading: 'No content yet' });

  const { data } = await call(client, 'validateDeck');
  const result = data as { valid: boolean; issues: { message: string }[] };
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes('has no blocks')));
});

test('validateDeck reports valid once every beat has at least one block', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'Complete deck' });
  await call(client, 'createBeat', {
    heading: 'Intro',
    blocks: [{ id: 'block-1', type: 'text', content: 'hi' }],
  });

  const { isError, data } = await call(client, 'validateDeck');
  assert.equal(isError, false);
  assert.deepEqual(data, { valid: true, issues: [] });
});
