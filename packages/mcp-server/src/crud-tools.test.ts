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

test('getDeck fails until a deck has been created', async () => {
  const client = await connectedClient();
  const { isError } = await call(client, 'getDeck');
  assert.equal(isError, true);
});

test('createDeck starts an empty deck, and getDeck returns it', async () => {
  const client = await connectedClient();

  const created = await call(client, 'createDeck', { title: 'My Deck' });
  assert.equal(created.isError, false);
  const createdDeck = created.data as { meta: { title: string }; beats: unknown[] };
  assert.equal(createdDeck.meta.title, 'My Deck');
  assert.deepEqual(createdDeck.beats, []);

  const fetched = await call(client, 'getDeck');
  assert.equal(fetched.isError, false);
  assert.deepEqual(fetched.data, createdDeck);
});

test('createBeat fails until a deck has been created', async () => {
  const client = await connectedClient();
  const { isError } = await call(client, 'createBeat', { heading: 'Intro' });
  assert.equal(isError, true);
});

test('createBeat appends a beat with the given fields', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'My Deck' });

  const created = await call(client, 'createBeat', {
    heading: 'Intro',
    blocks: [{ id: 'block-1', type: 'text', content: 'hi' }],
  });
  assert.equal(created.isError, false);
  const beat = created.data as { id: string; heading: string };
  assert.equal(beat.heading, 'Intro');
  assert.ok(beat.id.length > 0);

  const deck = (await call(client, 'getDeck')).data as { beats: unknown[] };
  assert.equal(deck.beats.length, 1);
});

test('updateBeat changes only the given fields and rejects unknown ids', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'My Deck' });
  const beat = (await call(client, 'createBeat', { heading: 'Intro', notes: 'original notes' }))
    .data as { id: string };

  const updated = await call(client, 'updateBeat', { beatId: beat.id, heading: 'New heading' });
  assert.equal(updated.isError, false);
  const updatedBeat = updated.data as { heading: string; notes: string };
  assert.equal(updatedBeat.heading, 'New heading');
  assert.equal(updatedBeat.notes, 'original notes');

  const missing = await call(client, 'updateBeat', { beatId: 'no-such-id', heading: 'x' });
  assert.equal(missing.isError, true);
});

test('setNarration sets notes and rejects unknown ids', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'My Deck' });
  const beat = (await call(client, 'createBeat', {})).data as { id: string };

  const result = await call(client, 'setNarration', { beatId: beat.id, notes: 'say this aloud' });
  assert.equal(result.isError, false);
  assert.equal((result.data as { notes: string }).notes, 'say this aloud');

  const missing = await call(client, 'setNarration', { beatId: 'no-such-id', notes: 'x' });
  assert.equal(missing.isError, true);
});

test('reorderBeats applies a valid permutation and rejects invalid ones', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'My Deck' });
  const first = (await call(client, 'createBeat', { heading: 'First' })).data as { id: string };
  const second = (await call(client, 'createBeat', { heading: 'Second' })).data as { id: string };

  const reordered = await call(client, 'reorderBeats', { beatIds: [second.id, first.id] });
  assert.equal(reordered.isError, false);
  const deck = reordered.data as { beats: { id: string }[] };
  assert.deepEqual(
    deck.beats.map((beat) => beat.id),
    [second.id, first.id],
  );

  const invalid = await call(client, 'reorderBeats', { beatIds: [first.id, 'no-such-id'] });
  assert.equal(invalid.isError, true);
});

test('deleteBeat removes a beat and rejects unknown ids', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'My Deck' });
  const beat = (await call(client, 'createBeat', { heading: 'Doomed' })).data as { id: string };

  const deleted = await call(client, 'deleteBeat', { beatId: beat.id });
  assert.equal(deleted.isError, false);
  assert.deepEqual((deleted.data as { beats: unknown[] }).beats, []);

  const missing = await call(client, 'deleteBeat', { beatId: beat.id });
  assert.equal(missing.isError, true);
});

test('a full create/update/reorder/delete workflow ends in the expected final state', async () => {
  const client = await connectedClient();
  await call(client, 'createDeck', { title: 'Workflow Deck' });

  const intro = (await call(client, 'createBeat', { heading: 'Intro' })).data as { id: string };
  const body = (await call(client, 'createBeat', { heading: 'Body' })).data as { id: string };
  const outro = (await call(client, 'createBeat', { heading: 'Outro' })).data as { id: string };

  await call(client, 'updateBeat', { beatId: body.id, heading: 'Main content' });
  await call(client, 'setNarration', { beatId: intro.id, notes: 'welcome everyone' });
  await call(client, 'reorderBeats', { beatIds: [outro.id, intro.id, body.id] });
  await call(client, 'deleteBeat', { beatId: outro.id });

  const finalDeck = (await call(client, 'getDeck')).data as {
    beats: { id: string; heading?: string; notes?: string }[];
  };

  assert.deepEqual(
    finalDeck.beats.map((beat) => ({ id: beat.id, heading: beat.heading, notes: beat.notes })),
    [
      { id: intro.id, heading: 'Intro', notes: 'welcome everyone' },
      { id: body.id, heading: 'Main content', notes: undefined },
    ],
  );
});
