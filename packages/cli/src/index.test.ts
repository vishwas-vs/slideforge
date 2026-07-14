import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProgram } from './index.js';

test('createProgram registers the slides command with build and preview subcommands', () => {
  const program = createProgram();

  const slides = program.commands.find((command) => command.name() === 'slides');
  assert.ok(slides);

  const subcommandNames = slides.commands.map((command) => command.name());
  assert.ok(subcommandNames.includes('build'));
  assert.ok(subcommandNames.includes('preview'));
});
