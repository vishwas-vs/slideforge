# Examples

## `decks/`

Three sample `Deck` fixtures, covering different content shapes:

- [`short-brief.json`](decks/short-brief.json) — a short, text-only pitch (text + bulletList blocks)
- [`code-heavy.json`](decks/code-heavy.json) — code blocks with a `visualHint` pointing at a real HyperFrames catalog block (`code-3d-extrude`)
- [`chart-heavy.json`](decks/chart-heavy.json) — chart blocks (bar/line/pie) with illustrative data

Each is validated against `@slideforge/schema`'s `validateDeck` in `packages/schema/src/examples.test.ts` — if a schema change breaks one of these, CI catches it.

Compiled output (a generated Slidev project / HyperFrames composition per fixture) will land here once `compiler-slidev` and `compiler-hyperframes` exist (v0.3/v0.4).
