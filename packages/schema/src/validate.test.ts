import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Beat } from './beat.js';
import type { Deck } from './deck.js';
import { createId } from './id.js';
import { validateDeck } from './validate.js';

function sampleBeat(): Beat {
  return {
    id: createId(),
    heading: 'Intro',
    blocks: [{ id: createId(), type: 'text', content: 'hi' }],
  };
}

function sampleDeck(beats: Beat[] = [sampleBeat()]): Deck {
  return {
    id: createId(),
    meta: { title: 'A deck' },
    beats,
  };
}

test('validateDeck accepts a well-formed deck', () => {
  const result = validateDeck(sampleDeck());
  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test('validateDeck reports zod shape errors for malformed input', () => {
  const result = validateDeck({ id: createId(), meta: {}, beats: [] });
  assert.equal(result.valid, false);
  assert.ok(result.issues.length > 0);
});

test('validateDeck rejects a deck with zero beats', () => {
  const result = validateDeck(sampleDeck([]));
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes('at least one beat')));
});

test('validateDeck rejects a beat with zero blocks', () => {
  const emptyBeat = sampleBeat();
  emptyBeat.blocks = [];
  const result = validateDeck(sampleDeck([emptyBeat]));
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes('has no blocks')));
});

test('validateDeck rejects duplicate beat ids', () => {
  const beat = sampleBeat();
  const duplicateBeat: Beat = {
    ...beat,
    blocks: [{ id: createId(), type: 'text', content: 'again' }],
  };
  const result = validateDeck(sampleDeck([beat, duplicateBeat]));
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes(`Duplicate id "${beat.id}"`)));
});

test('validateDeck rejects duplicate block ids across different beats', () => {
  const sharedBlock = { id: createId(), type: 'text' as const, content: 'shared' };
  const beatOne: Beat = { id: createId(), blocks: [sharedBlock] };
  const beatTwo: Beat = { id: createId(), blocks: [sharedBlock] };
  const result = validateDeck(sampleDeck([beatOne, beatTwo]));
  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.message.includes(`Duplicate id "${sharedBlock.id}"`)),
  );
});
