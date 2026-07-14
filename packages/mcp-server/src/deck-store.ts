import {
  createId,
  type Deck,
  type DeckMeta,
  type DeckRecipe,
  type PatchEvent,
  updateDeck,
} from '@slideforge/schema';

/**
 * Holds the one Deck a slideforge MCP session is working on, plus its
 * patch history. One deck per server process/session is the right scope
 * for now -- `slideforge mcp` is meant to be spawned per conversation,
 * not run as a multi-tenant server (see docs/architecture.md).
 */
export class DeckStore {
  private deck: Deck | undefined;
  private history: PatchEvent[] = [];

  createDeck(meta: DeckMeta): Deck {
    const now = new Date().toISOString();
    this.deck = {
      id: createId(),
      meta: { ...meta, createdAt: now, updatedAt: now },
      beats: [],
    };
    this.history = [];
    return this.deck;
  }

  /** Throws if no deck has been created yet in this session. */
  getDeck(): Deck {
    if (!this.deck) {
      throw new Error('No deck exists yet -- call createDeck first.');
    }
    return this.deck;
  }

  hasDeck(): boolean {
    return this.deck !== undefined;
  }

  /** Applies `recipe` via the schema patch engine, recording the resulting event. */
  mutate(recipe: DeckRecipe): Deck {
    const current = this.getDeck();
    const { deck: next, event } = updateDeck(current, (draft) => {
      recipe(draft);
      draft.meta.updatedAt = new Date().toISOString();
    });
    this.deck = next;
    this.history.push(event);
    return next;
  }

  getHistory(): readonly PatchEvent[] {
    return this.history;
  }
}
