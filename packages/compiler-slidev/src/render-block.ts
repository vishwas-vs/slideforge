import type { Block } from '@slideforge/schema';

/**
 * Renders one Block to its Slidev markdown body representation. Doesn't
 * handle `step` (progressive reveal) itself -- see
 * renderBlocksWithReveal below, which wraps groups of these in
 * <v-click>.
 *
 * `chart` has no native Slidev component to render into (core Slidev
 * markdown has nothing built-in, and picking a third-party chart addon
 * needs its own vetting) -- it degrades to a markdown data table rather
 * than silently dropping the data.
 */
export function renderBlockToMarkdown(block: Block): string {
  switch (block.type) {
    case 'text':
      return block.content;

    case 'bulletList':
      return block.items
        .map((item, i) => (block.ordered ? `${i + 1}. ${item}` : `- ${item}`))
        .join('\n');

    case 'code': {
      const fenced = `\`\`\`${block.language ?? ''}\n${block.content}\n\`\`\``;
      return block.filename ? `**${block.filename}**\n\n${fenced}` : fenced;
    }

    case 'image': {
      const image = `![${block.alt ?? ''}](${block.src})`;
      return block.caption ? `${image}\n\n*${block.caption}*` : image;
    }

    case 'quote': {
      const quoted = block.content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      return block.attribution ? `${quoted}\n\n*— ${block.attribution}*` : quoted;
    }

    case 'chart': {
      const rows = block.data.map((point) => `| ${point.label} | ${point.value} |`).join('\n');
      const table = `| Label | Value |\n| --- | --- |\n${rows}`;
      const heading = block.title ? `**${block.title}**\n\n` : '';
      const note = `<!-- chart type: ${block.chartType} -- rendered as a data table until a native chart component is available -->`;
      return `${heading}${table}\n\n${note}`;
    }
  }
}

/**
 * Renders a Beat's blocks in order, wrapping each contiguous run of
 * blocks that share the same `step` (> 0) in a single <v-click> so they
 * reveal together on that click; blocks with no step (or step 0) render
 * immediately visible, unwrapped. Blank lines around the wrapped content
 * are required for Slidev's markdown-in-HTML-block parsing to treat it
 * as markdown rather than raw text.
 *
 * `v-motion` mapping (richer per-block animation) isn't implemented --
 * there's no schema field driving it yet (visualHint is layout, not
 * motion). A future field would be needed before that's meaningful.
 */
export function renderBlocksWithReveal(blocks: Block[]): string {
  const parts: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const step = block.step ?? 0;

    if (step <= 0) {
      parts.push(renderBlockToMarkdown(block));
      i += 1;
      continue;
    }

    const group: Block[] = [];
    while (i < blocks.length && (blocks[i].step ?? 0) === step) {
      group.push(blocks[i]);
      i += 1;
    }
    const groupContent = group.map(renderBlockToMarkdown).join('\n\n');
    parts.push(`<v-click>\n\n${groupContent}\n\n</v-click>`);
  }

  return parts.join('\n\n');
}
