import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { SlidevMarkdown } from '@slideforge/compiler-slidev';
import { stringify } from '@slideforge/compiler-slidev';

/**
 * Pinned so builds are reproducible -- confirmed empirically that Slidev
 * needs a real installed project (package.json + node_modules with the
 * theme and vue present) to build at all; pointing it at a bare .md file
 * with nothing installed fails with "theme not found and cannot prompt
 * for installation" (no TTY to confirm an on-demand install).
 */
const SLIDEV_VERSION = '52.18.0';

/**
 * Writes a minimal, self-contained Slidev project (slides.md +
 * package.json) to `outDir`. Doesn't install dependencies itself -- see
 * ensureProjectReady in commands/slides.ts.
 */
export function writeSlidevProject(outDir: string, markdown: SlidevMarkdown): void {
  mkdirSync(outDir, { recursive: true });

  writeFileSync(path.join(outDir, 'slides.md'), stringify(markdown), 'utf8');

  const packageJson = {
    name: 'slideforge-slides',
    private: true,
    type: 'module',
    scripts: {
      dev: 'slidev',
      build: 'slidev build',
    },
    dependencies: {
      '@slidev/cli': SLIDEV_VERSION,
      '@slidev/theme-default': 'latest',
      vue: '^3.5.0',
    },
  };
  writeFileSync(
    path.join(outDir, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8',
  );
}
