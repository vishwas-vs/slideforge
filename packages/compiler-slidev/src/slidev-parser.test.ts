import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse, stringify } from './slidev-parser.js';

test('@slidev/parser can parse and re-stringify a minimal deck', async () => {
  const markdown = ['---', 'theme: default', '---', '', '# Hello', '', 'World', ''].join('\n');

  const parsed = await parse(markdown, 'slides.md');
  assert.equal(parsed.slides.length, 1);
  assert.match(parsed.slides[0]?.content ?? '', /Hello/);

  const restringified = stringify(parsed);
  assert.equal(typeof restringified, 'string');
  assert.match(restringified, /Hello/);
});
