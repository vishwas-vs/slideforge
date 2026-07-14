#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { registerSlidesCommand } from './commands/slides.js';

export function createProgram(): Command {
  const program = new Command();
  program
    .name('slideforge')
    .description('Agent-authored content, compiled to animated slides and rendered video.');

  registerSlidesCommand(program);

  return program;
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  createProgram()
    .parseAsync(process.argv)
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
