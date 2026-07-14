import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveSlidevLayout } from './resolve-layout.js';

test('resolveSlidevLayout returns undefined when there is no hint', () => {
  assert.equal(resolveSlidevLayout(undefined), undefined);
});

test('resolveSlidevLayout returns undefined for a hint that is not a real Slidev layout', () => {
  assert.equal(resolveSlidevLayout('code-3d-extrude'), undefined);
});

test('resolveSlidevLayout matches a real Slidev built-in layout name', () => {
  assert.equal(resolveSlidevLayout('quote'), 'quote');
  assert.equal(resolveSlidevLayout('two-cols'), 'two-cols');
  assert.equal(resolveSlidevLayout('default'), 'default');
});

test('resolveSlidevLayout is forgiving of surrounding whitespace and casing', () => {
  assert.equal(resolveSlidevLayout('  Quote '), 'quote');
  assert.equal(resolveSlidevLayout('COVER'), 'cover');
});
