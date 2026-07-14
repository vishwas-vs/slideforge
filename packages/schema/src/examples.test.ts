import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateDeck } from './validate.js';

/**
 * Validates the example Deck fixtures in examples/decks/ (repo root)
 * against the real schema. Reaching outside this package is intentional
 * here: these are dev-time fixtures used for documentation and future
 * compiler tests, not part of the published package, so keeping them
 * honest is worth the cross-package path.
 */
const FIXTURES = ['short-brief.json', 'code-heavy.json', 'chart-heavy.json'];

for (const fixture of FIXTURES) {
  test(`example fixture ${fixture} is a valid Deck`, () => {
    const url = new URL(`../../../examples/decks/${fixture}`, import.meta.url);
    const raw = readFileSync(url, 'utf8');
    const deck: unknown = JSON.parse(raw);

    const result = validateDeck(deck);

    assert.deepEqual(result.issues, []);
    assert.equal(result.valid, true);
  });
}
