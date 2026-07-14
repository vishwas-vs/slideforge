// Deck -> Slidev project generation lands across the v0.3 issues
// (headmatter/frontmatter mapping, Block -> markdown body, v-click/
// v-motion, layout selection, the compileSlides MCP tool). For now this
// package only proves the @slidev/parser integration works end to end
// -- see slidev-parser.ts and its test.
export { parse, stringify } from './slidev-parser.js';
export type { SlidevMarkdown, SourceSlideInfo } from './slidev-parser.js';
