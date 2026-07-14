import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { compileDeckToSlidevMarkdown } from '@slideforge/compiler-slidev';
import type { Command } from 'commander';
import { readDeckFromFile } from '../read-deck.js';
import { writeSlidevProject } from '../write-slidev-project.js';

const DEFAULT_OUT_DIR = 'slidev-output';

/**
 * `shell: true` is required here -- confirmed empirically that plain
 * spawnSync('npm', [...]) fails with ENOENT on Windows, since npm/npx
 * are .cmd shims that need a shell to resolve. Node deprecates (DEP0190)
 * combining shell:true with an args array because the args aren't
 * escaped, only concatenated -- so these build one literal command
 * string instead. That's only safe because every piece is a fixed
 * literal we control (never deckPath or --out, which go through fs/cwd,
 * not the shell) -- don't add a dynamic value into these strings
 * without properly quoting it first.
 */
function runCommand(command: string, cwd: string, failureMessage: string): void {
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    throw new Error(failureMessage);
  }
}

/** Runs `npm install` in outDir, but only the first time (skips if node_modules already exists). */
function ensureProjectReady(outDir: string): void {
  if (existsSync(path.join(outDir, 'node_modules'))) {
    return;
  }
  console.log(`Installing Slidev dependencies in ${outDir} (first run only)...`);
  runCommand('npm install', outDir, `npm install failed in ${outDir}`);
}

/** Shells out to the real, project-local `slidev` CLI -- never our own reimplementation of it. */
function runSlidev(outDir: string, slidevArgs: string): void {
  runCommand(
    `npx @slidev/cli ${slidevArgs}`,
    outDir,
    `slidev ${slidevArgs} exited with a non-zero status`,
  );
}

interface SlidesOptions {
  out: string;
}

export function registerSlidesCommand(program: Command): void {
  const slides = program.command('slides').description('Compile a Deck into a Slidev project');

  slides
    .command('build <deckPath>')
    .description('Compile a Deck and build a static Slidev site')
    .option('--out <dir>', 'output directory', DEFAULT_OUT_DIR)
    .action((deckPath: string, options: SlidesOptions) => {
      const deck = readDeckFromFile(deckPath);
      const markdown = compileDeckToSlidevMarkdown(deck);
      writeSlidevProject(options.out, markdown);
      ensureProjectReady(options.out);
      runSlidev(options.out, 'build slides.md');
    });

  slides
    .command('preview <deckPath>')
    .description('Compile a Deck and start the Slidev dev server')
    .option('--out <dir>', 'output directory', DEFAULT_OUT_DIR)
    .action((deckPath: string, options: SlidesOptions) => {
      const deck = readDeckFromFile(deckPath);
      const markdown = compileDeckToSlidevMarkdown(deck);
      writeSlidevProject(options.out, markdown);
      ensureProjectReady(options.out);
      runSlidev(options.out, 'slides.md');
    });
}
