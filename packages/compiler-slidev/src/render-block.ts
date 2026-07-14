import type { Block } from '@slideforge/schema';

/**
 * Renders one Block to its Slidev markdown body representation. Ignores
 * `step` (progressive reveal) -- wrapping blocks in v-click/v-motion is
 * issue #16's job, layered on top of this plain rendering.
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
