# AGENTS.md

Instructions for coding agents (and a useful summary for human contributors) working in this repository.

## What this project is

slideforge compiles one shared content model (a `Deck`, made of `Beat`s and `Block`s — see `packages/schema`) into two independent outputs: a Slidev slide deck and a HyperFrames video. It is **not** a reimplementation of either renderer — it's a thin content model plus two adapters. Before adding logic, check whether Slidev or HyperFrames already does it (their own CLIs, parsers, and MCP/tool surfaces are extensive — see `docs/architecture.md`).

## Ground rules

1. **Don't hand-roll what an upstream package already does.** Use `@slidev/parser` to emit Slidev markdown, not a bespoke string template. Use `@hyperframes/core` (`generateHyperframesHtml`, `validateCompositionHtml`, `lintHyperframeHtml`) to emit and validate HyperFrames compositions, not hand-written HTML strings. If you think you need to reimplement something from either upstream project, open an issue explaining why first.
2. **The content model is the one shared abstraction.** Changes to `packages/schema` types affect both compilers — check both `packages/compiler-slidev` and `packages/compiler-hyperframes` for breakage before considering a schema change done.
3. **Package boundaries**: `schema` has no dependency on either compiler or on `mcp-server`. `compiler-slidev` and `compiler-hyperframes` depend only on `schema`, never on each other. `mcp-server` and `cli` are the only packages allowed to depend on everything else.
4. **No embedded LLM calls.** This project does not manage model API keys or run its own agent loop (see README's "Agent integration" section) — that's a deliberate architectural choice, not an oversight. Don't add an LLM client dependency to any package.

## Build / test commands

```sh
pnpm install          # install all workspace deps
pnpm build            # turbo run build (all packages)
pnpm lint             # turbo run lint (Biome)
pnpm typecheck        # turbo run typecheck
pnpm test             # turbo run test
pnpm format           # biome format --write .
```

Run a single package's scripts with `pnpm --filter @slideforge/<name> <script>` (e.g. `pnpm --filter @slideforge/schema test`).

## Style

- TypeScript, strict mode. Formatting/linting via Biome (`biome.json`) — run `pnpm format` before committing, don't hand-format.
- No default exports; prefer named exports.
- Keep `packages/*/src/index.ts` as the only public entry point per package — internal modules should not be imported from outside the package.

## Before opening a PR

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test` must pass locally.
- Add a changeset (`pnpm changeset`) for any change to a published package's behavior.
- If your change was authored or substantially assisted by an AI agent without a human review pass, label the PR `status: needs-human-review` (or ask a maintainer to) rather than merging it directly.
