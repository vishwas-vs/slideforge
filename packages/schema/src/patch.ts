import { applyPatches, enablePatches, produce, type Draft, type Patch } from 'immer';
import type { Deck } from './deck.js';

enablePatches();

/**
 * A single patch operation, in Immer's RFC-6902-flavored shape (paths are
 * arrays of keys/indices rather than JSON Pointer strings). This is
 * positional, not id-addressed: safe for linear undo/redo replayed
 * against the exact Deck a PatchEvent was generated from, but not for
 * rebasing onto a tree that diverged in the meantime. A stronger
 * id-addressed scheme is what a future real-time collaboration layer
 * would need (see docs/architecture.md) — out of scope for the
 * single-agent conversational editing loop this is built for.
 */
export type PatchOp = Patch;

export interface PatchEvent {
  forward: PatchOp[];
  inverse: PatchOp[];
}

/** A Deck-mutation recipe, as passed to updateDeck. Exported so consumers (e.g. the MCP server's DeckStore) don't need their own dependency on Immer just to name this type. */
export type DeckRecipe = (draft: Draft<Deck>) => void;

/**
 * Applies `recipe` to `deck` via an Immer draft, returning both the next
 * Deck and the PatchEvent describing the change. This is the primitive
 * the MCP server's content-CRUD tools build on: mutate the draft
 * naturally (push a Beat, edit a heading, reorder beats.length) and get
 * a forward/inverse patch pair for undo/redo for free.
 */
export function updateDeck(deck: Deck, recipe: DeckRecipe): { deck: Deck; event: PatchEvent } {
  let event: PatchEvent = { forward: [], inverse: [] };
  const next = produce(deck, recipe, (patches, inversePatches) => {
    event = { forward: patches, inverse: inversePatches };
  });
  return { deck: next, event };
}

/** Reverts `deck` to the state it was in before `event` was applied. */
export function undo(deck: Deck, event: PatchEvent): Deck {
  return applyPatches(deck, event.inverse);
}

/** Re-applies `event` to `deck` after it was undone. */
export function redo(deck: Deck, event: PatchEvent): Deck {
  return applyPatches(deck, event.forward);
}
