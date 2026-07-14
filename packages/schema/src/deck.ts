import { z } from 'zod';
import { BeatSchema } from './beat.js';

export const DeckMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type DeckMeta = z.infer<typeof DeckMetaSchema>;

/**
 * The root content model: one Deck compiles to both a Slidev project and
 * a HyperFrames composition (see docs/architecture.md). `beats` order is
 * significant — it's the slide order in Slidev and the default clip
 * sequence in HyperFrames.
 */
export const DeckSchema = z.object({
  id: z.string().min(1),
  meta: DeckMetaSchema,
  beats: z.array(BeatSchema),
});
export type Deck = z.infer<typeof DeckSchema>;
