import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { compileDeckToSlidevMarkdown } from '@slideforge/compiler-slidev';
import type { Deck } from '@slideforge/schema';
import { writeSlidevProject } from './write-slidev-project.js';

function sampleDeck(): Deck {
  return {
    id: 'deck-1',
    meta: { title: 'My Deck' },
    beats: [
      { id: 'beat-1', heading: 'Intro', blocks: [{ id: 'b1', type: 'text', content: 'hi' }] },
    ],
  };
}

test('writeSlidevProject writes a real slides.md and package.json', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'slideforge-write-project-'));
  try {
    const markdown = compileDeckToSlidevMarkdown(sampleDeck());
    writeSlidevProject(dir, markdown);

    const slidesMd = readFileSync(path.join(dir, 'slides.md'), 'utf8');
    assert.match(slidesMd, /title: My Deck/);
    assert.match(slidesMd, /# Intro/);
    assert.match(slidesMd, /hi/);

    const packageJson = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    assert.ok(packageJson.dependencies['@slidev/cli']);
    assert.ok(packageJson.dependencies['@slidev/theme-default']);
    assert.ok(packageJson.dependencies.vue);
    assert.equal(packageJson.scripts.build, 'slidev build');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
