import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Deck } from '@slideforge/schema';
import { compileDeckToSlidevMarkdown } from './compile.js';
import { parse, stringify } from './slidev-parser.js';

function sampleDeck(): Deck {
  return {
    id: 'deck-1',
    meta: { title: 'My Deck', description: 'A test deck', author: 'Ada' },
    beats: [
      { id: 'beat-1', heading: 'Intro', blocks: [] },
      { id: 'beat-2', blocks: [] },
    ],
  };
}

test('compileDeckToSlidevMarkdown maps Deck.meta to headmatter on slide 0', () => {
  const markdown = compileDeckToSlidevMarkdown(sampleDeck());
  assert.deepEqual(markdown.slides[0]?.frontmatter, {
    title: 'My Deck',
    info: 'A test deck',
    author: 'Ada',
  });
});

test('compileDeckToSlidevMarkdown omits optional headmatter fields when absent', () => {
  const deck = sampleDeck();
  deck.meta = { title: 'Minimal' };
  const markdown = compileDeckToSlidevMarkdown(deck);
  assert.deepEqual(markdown.slides[0]?.frontmatter, { title: 'Minimal' });
});

test('compileDeckToSlidevMarkdown produces one slide per beat after the headmatter slide', () => {
  const markdown = compileDeckToSlidevMarkdown(sampleDeck());
  assert.equal(markdown.slides.length, 3);
  assert.equal(markdown.slides[1]?.frontmatter.title, 'Intro');
  assert.deepEqual(markdown.slides[2]?.frontmatter, {});
});

test('the compiled markdown re-parses through the real @slidev/parser with the right headmatter and slide count', async () => {
  const markdown = compileDeckToSlidevMarkdown(sampleDeck());

  const text = stringify(markdown);
  const reparsed = await parse(text, 'slides.md');

  assert.equal(reparsed.slides.length, 3);
  assert.equal(reparsed.slides[0]?.frontmatter.title, 'My Deck');
  assert.equal(reparsed.slides[0]?.frontmatter.info, 'A test deck');
  assert.equal(reparsed.slides[1]?.frontmatter.title, 'Intro');
  assert.deepEqual(reparsed.slides[2]?.frontmatter, {});
});
