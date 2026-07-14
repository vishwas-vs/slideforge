import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BeatSchema, BlockSchema, createId, DeckSchema } from './index.js';

test('createId returns unique non-empty string ids', () => {
  const a = createId();
  const b = createId();
  assert.equal(typeof a, 'string');
  assert.ok(a.length > 0);
  assert.notEqual(a, b);
});

test('BlockSchema accepts one valid sample of each known block type', () => {
  const samples = [
    { id: createId(), type: 'text', content: 'hello' },
    { id: createId(), type: 'bulletList', items: ['a', 'b'] },
    { id: createId(), type: 'code', content: 'console.log(1)', language: 'ts' },
    { id: createId(), type: 'image', src: 'https://example.com/x.png' },
    { id: createId(), type: 'quote', content: 'stay hungry', attribution: 'unknown' },
    {
      id: createId(),
      type: 'chart',
      chartType: 'bar',
      data: [{ label: 'Q1', value: 1 }],
    },
  ];

  for (const sample of samples) {
    assert.doesNotThrow(() => BlockSchema.parse(sample), `expected ${sample.type} to be valid`);
  }
});

test('BlockSchema rejects an unknown block type', () => {
  assert.throws(() => BlockSchema.parse({ id: createId(), type: 'video', src: 'x.mp4' }));
});

test('BlockSchema rejects a bulletList with no items', () => {
  assert.throws(() => BlockSchema.parse({ id: createId(), type: 'bulletList', items: [] }));
});

test('BeatSchema accepts a beat with mixed blocks and a reveal step', () => {
  const beat = {
    id: createId(),
    heading: 'Intro',
    blocks: [
      { id: createId(), type: 'text', content: 'hi' },
      { id: createId(), type: 'bulletList', items: ['one', 'two'], step: 1 },
    ],
    visualHint: 'code-3d-extrude',
    durationHint: 8,
  };
  assert.doesNotThrow(() => BeatSchema.parse(beat));
});

test('BeatSchema rejects a negative durationHint', () => {
  const beat = { id: createId(), blocks: [], durationHint: -1 };
  assert.throws(() => BeatSchema.parse(beat));
});

test('DeckSchema validates a full minimal deck end to end', () => {
  const deck = {
    id: createId(),
    meta: { title: 'My Deck' },
    beats: [
      {
        id: createId(),
        heading: 'Intro',
        blocks: [{ id: createId(), type: 'text', content: 'hi' }],
      },
    ],
  };
  assert.doesNotThrow(() => DeckSchema.parse(deck));
});

test('DeckSchema rejects a deck missing meta.title', () => {
  const deck = { id: createId(), meta: {}, beats: [] };
  assert.throws(() => DeckSchema.parse(deck));
});
