import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createId } from './id.js';
import type { Deck } from './deck.js';
import { redo, undo, updateDeck } from './patch.js';

function sampleDeck(): Deck {
  return {
    id: createId(),
    meta: { title: 'Original title' },
    beats: [
      {
        id: createId(),
        heading: 'Intro',
        blocks: [{ id: createId(), type: 'text', content: 'hi' }],
      },
    ],
  };
}

test('updateDeck applies the recipe and returns the mutated deck', () => {
  const deck = sampleDeck();
  const { deck: next } = updateDeck(deck, (draft) => {
    draft.meta.title = 'New title';
  });
  assert.equal(next.meta.title, 'New title');
  assert.equal(deck.meta.title, 'Original title', 'original deck must stay untouched');
});

test('updateDeck returns a non-empty forward/inverse PatchEvent for a real change', () => {
  const deck = sampleDeck();
  const { event } = updateDeck(deck, (draft) => {
    draft.meta.title = 'New title';
  });
  assert.ok(event.forward.length > 0);
  assert.ok(event.inverse.length > 0);
});

test('updateDeck returns empty patches for a no-op recipe', () => {
  const deck = sampleDeck();
  const { deck: next, event } = updateDeck(deck, () => {
    // no mutation
  });
  assert.deepEqual(event.forward, []);
  assert.deepEqual(event.inverse, []);
  assert.equal(next, deck);
});

test('undo reverts a deck to its pre-event state', () => {
  const deck = sampleDeck();
  const { deck: next, event } = updateDeck(deck, (draft) => {
    draft.meta.title = 'New title';
  });
  const reverted = undo(next, event);
  assert.deepEqual(reverted, deck);
});

test('redo re-applies an undone event', () => {
  const deck = sampleDeck();
  const { deck: next, event } = updateDeck(deck, (draft) => {
    draft.meta.title = 'New title';
  });
  const reverted = undo(next, event);
  const reapplied = redo(reverted, event);
  assert.deepEqual(reapplied, next);
});

test('updateDeck supports adding a beat, and undo removes it again', () => {
  const deck = sampleDeck();
  const newBeatId = createId();
  const { deck: withNewBeat, event } = updateDeck(deck, (draft) => {
    draft.beats.push({ id: newBeatId, blocks: [] });
  });
  assert.equal(withNewBeat.beats.length, 2);
  assert.equal(withNewBeat.beats[1]?.id, newBeatId);

  const reverted = undo(withNewBeat, event);
  assert.deepEqual(reverted, deck);
});
