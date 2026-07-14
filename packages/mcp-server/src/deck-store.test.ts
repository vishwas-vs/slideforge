import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DeckStore } from './deck-store.js';

test('getDeck throws before a deck has been created', () => {
  const store = new DeckStore();
  assert.equal(store.hasDeck(), false);
  assert.throws(() => store.getDeck());
});

test('createDeck starts a fresh, empty deck', () => {
  const store = new DeckStore();
  const deck = store.createDeck({ title: 'My Deck' });
  assert.equal(store.hasDeck(), true);
  assert.equal(deck.meta.title, 'My Deck');
  assert.deepEqual(deck.beats, []);
  assert.equal(typeof deck.meta.createdAt, 'string');
});

test('mutate applies a recipe and records patch history', () => {
  const store = new DeckStore();
  store.createDeck({ title: 'My Deck' });

  const updated = store.mutate((draft) => {
    draft.beats.push({ id: 'beat-1', blocks: [] });
  });

  assert.equal(updated.beats.length, 1);
  assert.equal(typeof updated.meta.updatedAt, 'string');
  assert.equal(store.getHistory().length, 1);

  const [firstEvent] = store.getHistory();
  assert.ok(firstEvent);
  assert.ok(firstEvent.forward.length > 0);
});

test('createDeck replaces any deck already in progress and clears history', () => {
  const store = new DeckStore();
  store.createDeck({ title: 'First' });
  store.mutate((draft) => {
    draft.beats.push({ id: 'beat-1', blocks: [] });
  });
  assert.equal(store.getHistory().length, 1);

  const second = store.createDeck({ title: 'Second' });
  assert.equal(second.meta.title, 'Second');
  assert.deepEqual(second.beats, []);
  assert.equal(store.getHistory().length, 0);
});
