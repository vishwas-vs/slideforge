import { z } from 'zod';

/**
 * Fields shared by every Block variant.
 *
 * `step` is the progressive-reveal group this block first appears in
 * (undefined/0 = visible immediately). It lives on the block rather than
 * as a separate Beat-level list so each block's reveal timing travels
 * with it: the Slidev compiler groups blocks by `step` into v-click
 * ranges, and the HyperFrames compiler offsets each block's data-start
 * within the Beat's time range by `step`.
 */
const blockBase = {
  id: z.string().min(1),
  step: z.number().int().nonnegative().optional(),
};

export const TextBlockSchema = z.object({
  ...blockBase,
  type: z.literal('text'),
  content: z.string(),
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

export const BulletListBlockSchema = z.object({
  ...blockBase,
  type: z.literal('bulletList'),
  items: z.array(z.string()).min(1),
  ordered: z.boolean().optional(),
});
export type BulletListBlock = z.infer<typeof BulletListBlockSchema>;

export const CodeBlockSchema = z.object({
  ...blockBase,
  type: z.literal('code'),
  content: z.string(),
  language: z.string().optional(),
  filename: z.string().optional(),
});
export type CodeBlock = z.infer<typeof CodeBlockSchema>;

export const ImageBlockSchema = z.object({
  ...blockBase,
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().optional(),
  caption: z.string().optional(),
});
export type ImageBlock = z.infer<typeof ImageBlockSchema>;

export const QuoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal('quote'),
  content: z.string(),
  attribution: z.string().optional(),
});
export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;

export const ChartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

export const ChartBlockSchema = z.object({
  ...blockBase,
  type: z.literal('chart'),
  chartType: z.enum(['bar', 'line', 'pie']),
  data: z.array(ChartDataPointSchema).min(1),
  title: z.string().optional(),
});
export type ChartBlock = z.infer<typeof ChartBlockSchema>;

export const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  BulletListBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  QuoteBlockSchema,
  ChartBlockSchema,
]);
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block['type'];
