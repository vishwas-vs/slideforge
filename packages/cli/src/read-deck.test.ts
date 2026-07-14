import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { readDeckFromFile } from './read-deck.js';

const EXAMPLE_DECK = fileURLToPath(
  new URL('../../../examples/decks/short-brief.json', import.meta.url),
);

test('readDeckFromFile reads a real example fixture', () => {
  const deck = readDeckFromFile(EXAMPLE_DECK);
  assert.equal(deck.meta.title, 'slideforge in 30 seconds');
  assert.ok(deck.beats.length > 0);
});

test('readDeckFromFile throws a readable error for an invalid deck', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'slideforge-read-deck-'));
  try {
    const invalidPath = path.join(dir, 'invalid.json');
    writeFileSync(invalidPath, JSON.stringify({ id: 'x', meta: {}, beats: [] }), 'utf8');

    assert.throws(() => readDeckFromFile(invalidPath), /is invalid/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
