import { randomUUID } from 'node:crypto';

/**
 * Generates a stable, patch-addressable id for a Deck/Beat/Block.
 * Every entity in the content model is keyed by one of these so that
 * mutations can be expressed as id-addressed JSON Patches later.
 */
export function createId(): string {
  return randomUUID();
}
