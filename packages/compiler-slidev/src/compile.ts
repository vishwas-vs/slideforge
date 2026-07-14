import type { Deck } from '@slideforge/schema';
import { stringify as stringifyYaml } from 'yaml';
import type { SlidevMarkdown, SourceSlideInfo } from './slidev-parser.js';

/**
 * Builds one slide's `raw` markdown text: an explicit frontmatter block
 * (even when empty, `---\n---`) followed by content. Always starting
 * with `---` means @slidev/parser's stringifySlide() uses our raw as-is
 * rather than guessing whether to insert its own separator.
 */
function buildRaw(frontmatter: Record<string, unknown>, content: string): string {
  const yamlBody = Object.keys(frontmatter).length > 0 ? stringifyYaml(frontmatter).trimEnd() : '';
  const frontmatterBlock = yamlBody ? `---\n${yamlBody}\n---` : '---\n---';
  return content ? `${frontmatterBlock}\n${content}\n` : `${frontmatterBlock}\n`;
}

/**
 * Builds a SourceSlideInfo for `stringify()`/`stringifySlide()`, which
 * (per @slidev/parser's actual implementation) only ever read `.raw` --
 * the positional/file-tracking fields below exist purely to satisfy the
 * upstream type and are otherwise unused here.
 */
function toSourceSlideInfo(params: {
  index: number;
  frontmatter: Record<string, unknown>;
  content: string;
}): SourceSlideInfo {
  return {
    filepath: 'slides.md',
    index: params.index,
    start: 0,
    contentStart: 0,
    end: 0,
    revision: String(params.index),
    raw: buildRaw(params.frontmatter, params.content),
    contentRaw: params.content,
    frontmatter: params.frontmatter,
    content: params.content,
  };
}

/**
 * Compiles a Deck into a Slidev SlidevMarkdown: slide 0 carries the
 * deck-wide headmatter (from Deck.meta), and one slide per Beat follows.
 * Per-slide content rendering (Block -> markdown body) and layout/
 * transition/click-reveal frontmatter land in later issues (#15-#17) --
 * for now each Beat slide only gets a `title` frontmatter field from
 * Beat.heading, with empty content.
 */
export function compileDeckToSlidevMarkdown(deck: Deck): SlidevMarkdown {
  const headmatter: Record<string, unknown> = { title: deck.meta.title };
  if (deck.meta.description) {
    headmatter.info = deck.meta.description;
  }
  if (deck.meta.author) {
    headmatter.author = deck.meta.author;
  }

  const headmatterSlide = toSourceSlideInfo({ index: 0, frontmatter: headmatter, content: '' });

  const beatSlides = deck.beats.map((beat, i) => {
    const frontmatter: Record<string, unknown> = {};
    if (beat.heading) {
      frontmatter.title = beat.heading;
    }
    return toSourceSlideInfo({ index: i + 1, frontmatter, content: '' });
  });

  return {
    filepath: 'slides.md',
    raw: '',
    slides: [headmatterSlide, ...beatSlides],
  };
}
