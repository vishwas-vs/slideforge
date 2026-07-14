# Content model reference

Authoritative reference for the `Deck`/`Beat`/`Block` schema implemented in [`packages/schema`](../packages/schema). For *why* this shape exists (two compile targets, one shared model), see [`architecture.md`](architecture.md) — this doc is the field-by-field "what," that one is the "why."

All types here are zod schemas with inferred TypeScript types of the same name (e.g. `DeckSchema` / `Deck`). Import the type or the schema from `@slideforge/schema` depending on whether you need to validate or just annotate.

## Deck

```ts
interface Deck {
  id: string;
  meta: DeckMeta;
  beats: Beat[];
}
```

- `id` — stable, patch-addressable (see [Ids and versioning](#ids-and-versioning) below).
- `beats` — order is significant: it's the slide order in the Slidev compiler and the default clip sequence in the HyperFrames compiler.

### DeckMeta

```ts
interface DeckMeta {
  title: string;
  description?: string;
  author?: string;
  createdAt?: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}
```

`title` is the only required field. `createdAt`/`updatedAt` are set automatically by `DeckStore.createDeck`/`mutate` in `packages/mcp-server` — you don't need to set them by hand when going through the MCP tools.

## Beat

```ts
interface Beat {
  id: string;
  heading?: string;
  blocks: Block[];
  notes?: string;
  visualHint?: string;
  durationHint?: number; // seconds, must be > 0
}
```

A Beat is one unit of content — a slide in Slidev, a clip's worth of time in HyperFrames. Field semantics differ by compiler target:

| Field | Slidev compiler | HyperFrames compiler |
|---|---|---|
| `heading`, `blocks`, `notes` | Rendered directly (heading/body, speaker notes) | Rendered directly (notes become caption/voiceover script) |
| `visualHint` | Soft: best-effort hint for choosing a built-in layout, ignored if no match | Load-bearing: matched against the HyperFrames catalog of pre-built blocks (e.g. `code-3d-extrude`); falls back to a plain default clip if nothing matches |
| `durationHint` | Soft/ignored: Slidev is click-driven, has no hard timing | Load-bearing: becomes the clip's `data-duration`; a sane default is used if omitted |

This is the central design tension the whole project is built around (see `architecture.md`'s "Why two modes, not one pipeline" section) — don't assume a field means the same thing to both compilers.

## Block

A discriminated union on `type`, exported as `Block` (and `BlockSchema` for validation). Every variant shares two base fields:

```ts
interface BlockBase {
  id: string;
  step?: number; // reveal step this block first appears at (0/undefined = visible immediately)
}
```

`step` is what drives progressive reveal. It lives on the block, not as a separate Beat-level list, so a block's reveal timing travels with it wherever the block goes. The Slidev compiler will group blocks by `step` into `v-click` ranges; the HyperFrames compiler will offset each block's `data-start` within the Beat's time range by `step`. (An earlier design had this as a Beat-level `revealSteps` array instead — per-block `step` turned out simpler; see `architecture.md` for that history if you find references to the old shape.)

The six variants:

| Type | Fields | Notes |
|---|---|---|
| `text` | `content: string` | |
| `bulletList` | `items: string[]` (min 1), `ordered?: boolean` | |
| `code` | `content: string`, `language?: string`, `filename?: string` | |
| `image` | `src: string` (min 1), `alt?: string`, `caption?: string` | |
| `quote` | `content: string`, `attribution?: string` | |
| `chart` | `chartType: 'bar' \| 'line' \| 'pie'`, `data: { label: string; value: number }[]` (min 1), `title?: string` | |

## Ids and versioning

Every `Deck`/`Beat`/`Block` id is generated with `createId()` (a thin wrapper over `crypto.randomUUID()`) and must be unique across the whole Deck — enforced by `validateDeck`, not by the zod schema itself (uniqueness across a nested tree isn't expressible as a single-field zod rule).

Mutations go through `updateDeck(deck, recipe)`, built on Immer's patches feature:

```ts
const { deck: next, event } = updateDeck(deck, (draft) => {
  draft.beats.push({ id: createId(), blocks: [] });
});
// event: { forward: PatchOp[], inverse: PatchOp[] }

const reverted = undo(next, event); // deep-equals the original deck
const reapplied = redo(reverted, event); // deep-equals `next` again
```

`PatchOp` is Immer's own patch shape — **positional** (array-index-based paths), not id-addressed. That's correct for linear undo/redo replayed against the exact Deck a `PatchEvent` came from (what the single-agent conversational editing loop needs) but would not be safe for rebasing onto a Deck that diverged concurrently. A stronger id-addressed scheme would only be needed for a future real-time multi-client collaboration layer — out of scope today (see `architecture.md`).

In `packages/mcp-server`, `DeckStore` wraps `updateDeck` and keeps the resulting `PatchEvent`s in a history array per session, ready for a future undo/redo MCP tool to use — none exists yet.

## Validation

`validateDeck(input: unknown): { valid: boolean; issues: ValidationIssue[] }` combines two layers in one call:

1. **Shape** — runs `DeckSchema.safeParse` first; a failure here reports zod's own issues (wrong types, missing required fields, etc.) in the same `{ path, message }[]` shape as everything else.
2. **Structural rules** zod can't express cleanly across a nested tree on its own:
   - Every id in the Deck (Deck itself, every Beat, every Block) must be unique.
   - The Deck needs at least one Beat.
   - Every Beat needs at least one Block.

`validateDeck` never throws — check `.valid` and read `.issues` for anything that failed.

## Where this is used

`packages/mcp-server` exposes this content model as MCP tools an agent drives directly: `createDeck`, `getDeck`, `createBeat`, `updateBeat`, `reorderBeats`, `deleteBeat`, `setNarration`, `validateDeck`. See that package's source under `src/tools/` for the exact tool schemas — this doc covers the underlying data, not the tool call signatures.
