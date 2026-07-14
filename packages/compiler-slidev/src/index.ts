// Deck -> Slidev project generation continues to build out across the
// v0.3 issues (Block -> markdown body, v-click/v-motion, layout
// selection, the compileSlides MCP tool).
export { compileDeckToSlidevMarkdown } from './compile.js';
export { parse, stringify } from './slidev-parser.js';
export type { SlidevMarkdown, SourceSlideInfo } from './slidev-parser.js';
