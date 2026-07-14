# slideforge

**Agent-authored content, compiled to animated slides and rendered video — from one shared content model.**

slideforge lets an LLM agent (with a human steering conversationally, not approving fixed checkpoints) turn a brief, a document, or a topic into a `Deck` — a small structured content model — and then compile that *same* `Deck` two different ways:

- **`slideforge slides`** → an interactive, animated [Slidev](https://sli.dev) deck (click-through reveals, live in the browser)
- **`slideforge video`** → a deterministic, rendered [HyperFrames](https://hyperframes.heygen.com) video (MP4/WebM, via headless Chrome + FFmpeg)

Slides and video are genuinely different outputs with different constraints (click-driven vs. hard-timed), so slideforge treats them as two explicit modes sharing one content model rather than pretending one derives from the other.

## Status

**Early-stage / pre-v0.2.** The monorepo, tooling, and content-model shape are scaffolded; the compilers themselves are tracked as open issues (see [Milestones](https://github.com/vishwas-vs/slideforge/milestones)). Nothing here renders a real deck or video yet — see `docs/architecture.md` for the intended design and the issue tracker for current progress.

## Why slideforge, not a wrapper around either tool alone

- **Slidev** has no video export — it's a live, click-driven presentation tool. Great for interactive decks, not for a rendered video artifact.
- **HyperFrames** has no concept of a "deck" or click-through reveals — it's a deterministic, hard-timed HTML→video renderer. Great for video, wrong shape for a live presentation.
- Both already do the hard part well (markdown parsing + MCP server for Slidev; HTML/GSAP validation + rendering + a 150+ block catalog for HyperFrames). slideforge's job is the shared content model and the two thin adapters — not reimplementing either renderer.

## Agent integration

slideforge does **not** run its own LLM loop or manage model API keys. It exposes an MCP server (content-model CRUD, compile-to-slides, compile-to-video) plus a plain CLI, so any host agent you already use (Claude Code, Cursor, etc.) supplies the "brain" and drives the tools — the same approach Slidev itself takes with its own `slidev mcp` server. See `AGENTS.md` for the contributor-facing side of this.

## Packages

| Package | Purpose |
|---|---|
| [`packages/schema`](packages/schema) | Shared `Deck`/`Beat`/`Block` content model, validation, patch-based versioning |
| [`packages/mcp-server`](packages/mcp-server) | MCP tool surface for host agents (content CRUD, compile, render) |
| [`packages/compiler-slidev`](packages/compiler-slidev) | `Deck` → Slidev project |
| [`packages/compiler-hyperframes`](packages/compiler-hyperframes) | `Deck` → HyperFrames composition |
| [`packages/cli`](packages/cli) | The `slideforge` command-line entry point |

## Development

Requires Node.js >=22 and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full contributor workflow, and [`docs/`](docs) for design docs as they land.

## License

[MIT](LICENSE)
