import { z } from 'zod';
import { BlockSchema } from './blocks.js';

/**
 * A Beat is one unit of content — a slide in Slidev, a clip's worth of
 * time in HyperFrames. `visualHint` and `durationHint` are read
 * differently by each compiler: soft/best-effort for Slidev (which is
 * click-driven and has no hard timing), load-bearing for HyperFrames
 * (which needs an explicit data-duration for every clip).
 */
export const BeatSchema = z.object({
  id: z.string().min(1),
  heading: z.string().optional(),
  blocks: z.array(BlockSchema),
  notes: z.string().optional(),
  visualHint: z.string().optional(),
  durationHint: z.number().positive().optional(),
});
export type Beat = z.infer<typeof BeatSchema>;
