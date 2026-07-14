# Architecture

## Why two modes, not one pipeline

Slides (Slidev) and video (HyperFrames) are genuinely different rendering targets:

- **Slides** are click-driven and live in a browser. Timing is soft — a `v-click` step advances when a human clicks, not at a fixed second. There is no export to video.
- **Video** is deterministic and hard-timed. Every clip has an exact `data-start`/`data-duration`; there is no "click to advance," and no browser interaction at playback time.

Trying to derive one from the other loses what makes each good — a video compiled from click-based slide semantics has no real timing, and a slide deck compiled from a video's rigid timeline can't be presented live. So slideforge treats them as two independent compile targets from one shared content model, not a single pipeline.

## The shared content model

Defined in `packages/schema` (implemented — see that package's source for the authoritative zod schemas and inferred types):

```
Deck { id, meta: DeckMeta, beats: Beat[] }
Beat { id, heading?, blocks: Block[], notes?, visualHint?, durationHint? }
Block = { id, step? } & (text | bulletList | code | image | quote | chart)
```

- `id` on every `Deck`/`Beat`/`Block` is stable and patch-addressable — mutations will be expressed as forward/inverse JSON Patches keyed by that id, the same pattern HyperFrames itself uses internally (`hf-id` + `PatchEvent`). This gives the conversational, checkpoint-free editing loop cheap undo/redo without inventing new machinery (patch engine itself is a separate, not-yet-implemented v0.2 issue).
- Progressive reveal lives on each **Block** as an optional `step` number, not as a separate Beat-level list — that way a block's reveal timing travels with the block itself. The Slidev compiler will group blocks by `step` into `v-click` ranges; the HyperFrames compiler will offset each block's `data-start` within the Beat's time range by `step`. (Earlier drafts of this doc described a Beat-level `revealSteps` field; per-block `step` turned out simpler and was adopted during implementation.)
- `durationHint`/`visualHint` are the two `Beat` fields that mean different things to each compiler: soft/best-effort for Slidev (click-driven, no hard timing), load-bearing for HyperFrames (`data-duration` needs a real number, catalog block selection reads `visualHint`).

## Compilers are adapters, not renderers

Neither `compiler-slidev` nor `compiler-hyperframes` re-implements rendering:

- `compiler-slidev` emits a Slidev project (headmatter + per-slide frontmatter + markdown body) using the official `@slidev/parser` package, then shells out to the real `slidev` CLI (`build`/dev server) to actually render/preview it.
- `compiler-hyperframes` emits composition HTML using `@hyperframes/core` (`generateHyperframesHtml`, validated with `validateCompositionHtml`/`lintHyperframeHtml`), selecting from HyperFrames' own catalog of 150+ pre-built animated blocks where a `visualHint` matches one, then shells out to the real `hyperframes` CLI (`render`) to produce MP4/WebM.

## Agent integration: MCP-first

slideforge does not run its own LLM loop. `packages/mcp-server` exposes the content model as MCP tools (`getDeck`, `createBeat`, `updateBeat`, `reorderBeats`, `deleteBeat`, `setNarration`, `validateDeck`, and later `compileSlides`/`compileVideo`/`renderVideo`) that any host agent — Claude Code, Cursor, or anything else that speaks MCP — can call, supplying its own model and API key. This mirrors Slidev's own `slidev mcp` server and HyperFrames' explicitly agent-oriented CLI design, rather than adding a competing, project-specific agent runtime.

A standalone/embedded agent mode (slideforge running its own conversation loop end-to-end without a host agent) is a plausible future addition but is intentionally not built in v1 — see the `v1.0` milestone.

## Package boundaries

- `schema` — no dependency on anything else in this repo.
- `compiler-slidev`, `compiler-hyperframes` — depend only on `schema`, never on each other.
- `mcp-server`, `cli` — the only packages that may depend on everything else.

See `AGENTS.md` for the enforcement-level version of these rules.
